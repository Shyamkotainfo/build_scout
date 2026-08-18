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
