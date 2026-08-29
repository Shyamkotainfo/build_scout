import logging

from agents.graph import build_buildsmart_graph
from agents.state import create_initial_state
from models.schemas import AnalysisResultResponse
from api.exceptions import AnalysisExecutionException, LLMServiceException
from llm.metrics import aggregate_workflow_metrics, pop_metrics_for_analysis, get_metrics_for_analysis
from services.prompt_optimizer import PromptOptimizer

logger = logging.getLogger(__name__)

def run_analysis_background(analysis_id: str, user_request: str) -> None:
    """
    Executes the full BuildSmart workflow for a given user request in the background.
    Tracks progress via job_store.
    """
    from services.job_store import update_job_status, start_stage, complete_stage
    
    try:
        update_job_status(analysis_id, "RUNNING")
        
        # ------------------------------------------------------------------
        # Step 1 — Prompt Optimization
        # ------------------------------------------------------------------
        start_stage(analysis_id, "prompt_optimizer")
        initial_state = create_initial_state(user_request)
        initial_state["analysis_id"] = analysis_id

        optimizer = PromptOptimizer()
        opt_result = optimizer.optimize(
            user_request=user_request,
            analysis_id=analysis_id,
        )

        logger.info(
            f"PromptOptimizer | analysis_id={analysis_id} | "
            f"intent={opt_result.intent} | "
            f"confidence={opt_result.confidence:.2f} | "
            f"applied={opt_result.optimization_applied}"
        )

        if opt_result.optimization_applied and opt_result.optimized_request:
            initial_state["normalized_request"] = opt_result.optimized_request
            
        complete_stage(analysis_id, "prompt_optimizer")

        # ------------------------------------------------------------------
        # Step 2 — LangGraph agent pipeline
        # ------------------------------------------------------------------
        graph = build_buildsmart_graph()
        final_state = initial_state
        
        NODE_ORDER = [
            "supervisor", "decomposition", "research", 
            "evaluation", "decision", "blueprint", "validation"
        ]
        
        # Start the first LangGraph node
        start_stage(analysis_id, NODE_ORDER[0])
        
        # Stream execution to get real-time node completions
        for s in graph.stream(initial_state):
            node_name = list(s.keys())[0]
            complete_stage(analysis_id, node_name)
            final_state = s[node_name]
            
            try:
                next_idx = NODE_ORDER.index(node_name) + 1
                if next_idx < len(NODE_ORDER):
                    start_stage(analysis_id, NODE_ORDER[next_idx])
            except ValueError:
                pass

        # Attach raw metrics for DB persistence before calling repo
        final_state["_llm_calls"] = get_metrics_for_analysis(analysis_id)

        # ------------------------------------------------------------------
        # Step 3 — Lakebase persistence
        # ------------------------------------------------------------------
        start_stage(analysis_id, "persistence")
        from database.connection import is_database_configured, get_session
        from database.repositories import AnalysisRepository

        if is_database_configured():
            try:
                session_gen = get_session()
                session = next(session_gen)
                try:
                    repo = AnalysisRepository()
                    repo.save_analysis(session, final_state)
                    session.commit()
                except Exception as db_exc:
                    session.rollback()
                    logger.error(
                        f"Failed to persist analysis {analysis_id} to Lakebase: {db_exc}",
                        exc_info=db_exc,
                    )
                finally:
                    try:
                        next(session_gen)
                    except StopIteration:
                        pass
            except Exception as conn_exc:
                logger.error(f"Failed to connect to Lakebase: {conn_exc}", exc_info=conn_exc)
        else:
            logger.info("Lakebase is not configured. Skipping persistence.")
            
        complete_stage(analysis_id, "persistence")

        # Free in-memory metrics store
        pop_metrics_for_analysis(analysis_id)

        # Job fully complete
        update_job_status(analysis_id, "COMPLETED")

    except Exception as exc:
        err_msg = str(exc)
        logger.error(f"Analysis Execution Failed: {err_msg}", exc_info=exc)

        if "429" in err_msg or "Rate limit" in err_msg or "tokens per day" in err_msg:
            safe_error = "The AI service is temporarily unavailable. Please try again later."
        else:
            safe_error = "Unable to complete the analysis."
            
        update_job_status(analysis_id, "FAILED", error=safe_error)


