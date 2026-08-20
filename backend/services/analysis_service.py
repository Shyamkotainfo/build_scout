import logging

from agents.graph import build_buildsmart_graph
from agents.state import create_initial_state
from models.schemas import AnalysisResultResponse
from api.exceptions import AnalysisExecutionException, LLMServiceException
from llm.metrics import aggregate_workflow_metrics, pop_metrics_for_analysis, get_metrics_for_analysis
from services.prompt_optimizer import PromptOptimizer

logger = logging.getLogger(__name__)

def analyze(user_request: str) -> AnalysisResultResponse:
    """
    Executes the full BuildSmart workflow for a given user request.

    Flow:
        user_request
            ↓
        PromptOptimizer   (pre-processing, not a LangGraph agent)
            ↓
        BuildSmartState   (user_request preserved; optimized_request in normalized_request)
            ↓
        LangGraph graph   (SupervisorAgent receives the optimized request)
            ↓
        Lakebase persistence
            ↓
        AnalysisResultResponse

    Args:
        user_request: The user's input describing what they want to build.

    Returns:
        AnalysisResultResponse: A validated schema mapping of the final state.
    """
    try:
        # ------------------------------------------------------------------
        # Step 1 — Prompt Optimization (pre-processing service)
        # ------------------------------------------------------------------
        initial_state = create_initial_state(user_request)
        analysis_id_str = initial_state["analysis_id"]

        optimizer = PromptOptimizer()
        opt_result = optimizer.optimize(
            user_request=user_request,
            analysis_id=analysis_id_str,
        )

        logger.info(
            f"PromptOptimizer | analysis_id={analysis_id_str} | "
            f"intent={opt_result.intent} | "
            f"confidence={opt_result.confidence:.2f} | "
            f"applied={opt_result.optimization_applied}"
        )

        # Feed the optimized request into normalized_request so SupervisorAgent
        # receives a cleaner representation. The original user_request is
        # NEVER overwritten — it is preserved verbatim in state.
        if opt_result.optimization_applied and opt_result.optimized_request:
            initial_state["normalized_request"] = opt_result.optimized_request

        # ------------------------------------------------------------------
        # Step 2 — LangGraph agent pipeline
        # ------------------------------------------------------------------
        graph = build_buildsmart_graph()
        final_state = graph.invoke(initial_state)

        # Attach raw metrics for DB persistence before calling repo
        final_state["_llm_calls"] = get_metrics_for_analysis(analysis_id_str)

        # ------------------------------------------------------------------
        # Step 3 — Lakebase persistence
        # ------------------------------------------------------------------
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
                        f"Failed to persist analysis {analysis_id_str} to Lakebase: {db_exc}",
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

        # ------------------------------------------------------------------
        # Step 4 — Build response
        # ------------------------------------------------------------------
        analysis_id = final_state.get("analysis_id")

        # Attach aggregated LLM metrics to response
        summary = aggregate_workflow_metrics(analysis_id)
        final_state["llm_metrics"] = summary

        # Free in-memory metrics store
        pop_metrics_for_analysis(analysis_id)

        # Remove private key before schema unpacking
        final_state.pop("_llm_calls", None)

        return AnalysisResultResponse(**final_state)

    except Exception as exc:
        err_msg = str(exc)
        analysis_id = None
        if "initial_state" in locals():
            analysis_id = locals()["initial_state"].get("analysis_id")

        logger.error(f"Analysis Execution Failed: {err_msg}", exc_info=exc)

        if "429" in err_msg or "Rate limit" in err_msg or "tokens per day" in err_msg:
            raise LLMServiceException(
                message="The AI service is temporarily unavailable. Please try again later.",
                analysis_id=analysis_id,
            ) from exc

        raise AnalysisExecutionException(
            message="Unable to complete the analysis.",
            analysis_id=analysis_id,
        ) from exc

