import uuid

import logging
from agents.graph import build_buildsmart_graph
from agents.state import create_initial_state
from models.schemas import AnalysisResultResponse
from api.exceptions import AnalysisExecutionException, LLMServiceException
from llm.metrics import aggregate_workflow_metrics, pop_metrics_for_analysis, get_metrics_for_analysis

logger = logging.getLogger(__name__)

def analyze(user_request: str) -> AnalysisResultResponse:
    """
    Executes the full BuildSmart workflow for a given user request.
    
    Args:
        user_request: The user's input describing what they want to build.
        
    Returns:
        AnalysisResultResponse: A validated schema mapping of the final state.
    """
    try:
        initial_state = create_initial_state(user_request)
        graph = build_buildsmart_graph()
        final_state = graph.invoke(initial_state)
        
        # Attach raw metrics for DB persistence before calling repo
        analysis_id_str = final_state.get("analysis_id")
        final_state["_llm_calls"] = get_metrics_for_analysis(analysis_id_str)
        
        
        # Persist the final state if Lakebase is configured
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
                    analysis_id = final_state.get("analysis_id")
                    logger.error(f"Failed to persist analysis {analysis_id} to Lakebase: {db_exc}", exc_info=db_exc)
                finally:
                    try:
                        next(session_gen)
                    except StopIteration:
                        pass
            except Exception as conn_exc:
                logger.error(f"Failed to connect to Lakebase: {conn_exc}", exc_info=conn_exc)
        else:
            logger.info("Lakebase is not configured. Skipping persistence.")
            
        analysis_id = final_state.get("analysis_id")
        
        # Attach aggregated metrics to response
        summary = aggregate_workflow_metrics(analysis_id)
        final_state["llm_metrics"] = summary
        
        # Free memory (since we've finished the workflow and DB is synced)
        pop_metrics_for_analysis(analysis_id)
        
        # Remove the private _llm_calls key if present before unpacking
        final_state.pop("_llm_calls", None)
        
        # Pydantic will gracefully ignore fields like agent_history if we set them properly,
        # but in our schema they exist, so **final_state unpacks perfectly.
        return AnalysisResultResponse(**final_state)
    except Exception as exc:
        err_msg = str(exc)
        analysis_id = None
        # Attempt to extract analysis_id from locals if state was created
        if 'initial_state' in locals():
            analysis_id = locals()['initial_state'].get("analysis_id")
            
        logger.error(f"Analysis Execution Failed: {err_msg}", exc_info=exc)
        
        # Identify Groq Rate Limits / LLM failures
        if "429" in err_msg or "Rate limit" in err_msg or "tokens per day" in err_msg:
            raise LLMServiceException(
                message="The AI service is temporarily unavailable. Please try again later.",
                analysis_id=analysis_id
            ) from exc
            
        raise AnalysisExecutionException(
            message="Unable to complete the analysis.",
            analysis_id=analysis_id
        ) from exc
