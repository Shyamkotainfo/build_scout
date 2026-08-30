"""
retrieval_service.py — Read-only service for fetching persisted analyses from Lakebase.

IMPORTANT: This service MUST NOT invoke:
- LangGraph
- Any agent (Supervisor, Decomposition, Research, Evaluation, Decision, Blueprint, Validation)
- The LLM (Groq or any other)
- MCP

It only performs database reads via AnalysisRepository.
"""
import logging
import uuid
from typing import Optional

from database.connection import get_session, is_database_configured
from database.repositories import AnalysisRepository
from api.exceptions import AnalysisNotFoundException, BuildSmartAPIException

logger = logging.getLogger(__name__)


def _parse_analysis_id(analysis_id_str: str) -> uuid.UUID:
    """Parse and validate the analysis UUID. Raises ValueError on bad format."""
    try:
        return uuid.UUID(analysis_id_str)
    except ValueError:
        raise ValueError(f"Invalid analysis ID format: {analysis_id_str!r}")


def retrieve_analysis(analysis_id_str: str) -> dict:
    """
    Retrieve a persisted analysis from Lakebase by its ID.

    Returns the full analysis result dict (compatible with AnalysisResultResponse).
    Raises AnalysisNotFoundException if the ID is not found.
    Raises BuildSmartAPIException for DB configuration or connection failures.
    """
    # Validate UUID format before touching the DB
    try:
        analysis_uuid = _parse_analysis_id(analysis_id_str)
    except ValueError:
        raise AnalysisNotFoundException(analysis_id_str)

    if not is_database_configured():
        raise BuildSmartAPIException(
            code="DATABASE_NOT_CONFIGURED",
            message="The persistence layer is not configured. Cannot retrieve analysis.",
            status_code=503,
            analysis_id=analysis_id_str
        )

    try:
        session_gen = get_session()
        session = next(session_gen)
        try:
            repo = AnalysisRepository()
            result = repo.get_analysis_result(session, analysis_uuid)
        finally:
            try:
                next(session_gen)
            except StopIteration:
                pass
    except Exception as exc:
        logger.error(f"Failed to retrieve analysis {analysis_id_str} from Lakebase: {exc}", exc_info=exc)
        raise BuildSmartAPIException(
            code="DATABASE_RETRIEVAL_FAILED",
            message="Failed to retrieve analysis from the database.",
            status_code=500,
            analysis_id=analysis_id_str
        )

    if result is None:
        raise AnalysisNotFoundException(analysis_id_str)

    return result


def list_analyses() -> list[dict]:
    """
    Retrieve a list of all analyses.
    Returns a lightweight representation of the analyses.
    """
    if not is_database_configured():
        return []

    try:
        session_gen = get_session()
        session = next(session_gen)
        
        try:
            # Fetch all analyses with joined data or just do individual queries for simplicity
            repo = AnalysisRepository()
            analyses = repo.get_all_analyses(session)
            
            result_list = []
            for a in analyses:
                # Count components
                components = repo.get_components(session, a.id)
                comp_count = len(components)
                
                # Count candidates
                cand_count = len(repo.get_candidates(session, a.id))
                
                # Count requirements
                requirements = repo.get_requirements(session, a.id)
                req_count = len(requirements)
                
                # Fetch validation results from blueprint or analysis if stored
                # Fetch decisions to count them
                decisions = repo.get_decisions(session, a.id)
                reuse_count = sum(1 for d in decisions if d.decision == 'REUSE')
                adapt_count = sum(1 for d in decisions if d.decision == 'ADAPT')
                build_count = sum(1 for d in decisions if d.decision == 'BUILD')
                
                result_list.append({
                    "analysis_id": str(a.id),
                    "user_request": a.user_request,
                    "normalized_request": a.normalized_request or "",
                    "domain": a.domain,
                    "status": a.status,
                    "created_at": a.created_at.isoformat() if a.created_at else None,
                    "updated_at": a.updated_at.isoformat() if a.updated_at else None,
                    "component_count": comp_count,
                    "candidate_count": cand_count,
                    "requirements_count": req_count,
                    "validation_score": a.validation_score,
                    "validation_status": a.validation_status,
                    "decision_summary": {
                        "reuse": reuse_count,
                        "adapt": adapt_count,
                        "build": build_count
                    }
                })
            return result_list
        finally:
            try:
                next(session_gen)
            except StopIteration:
                pass
    except Exception as e:
        import sqlalchemy
        from api.exceptions import DatabaseAuthException, DatabaseSchemaException, DatabaseConnectionException
        if isinstance(e, sqlalchemy.exc.OperationalError):
            logger.error(f"Failed to list analyses (Auth/Connection): {e}")
            raise DatabaseConnectionException("Database connection or authentication failed.")
        elif isinstance(e, sqlalchemy.exc.ProgrammingError):
            logger.error(f"Failed to list analyses (Schema): {e}")
            raise DatabaseSchemaException("Required database tables are missing.")
        
        logger.error(f"Failed to list analyses: {e}")
        return []
