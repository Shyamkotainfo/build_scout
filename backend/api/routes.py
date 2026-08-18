from fastapi import APIRouter
from models.schemas import AnalysisRequest, AnalysisResultResponse
from services.analysis_service import analyze
from services.retrieval_service import retrieve_analysis

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.post(
    "/api/v1/analyses",
    response_model=AnalysisResultResponse,
    summary="Run a new analysis",
    description=(
        "Executes the full BuildSmart agentic workflow for the given user request "
        "and persists the result to Databricks Lakebase."
    ),
    tags=["Analyses"],
)
def create_analysis(request: AnalysisRequest):
    return analyze(request.user_request)


@router.get(
    "/api/v1/analyses/{analysis_id}",
    response_model=AnalysisResultResponse,
    summary="Retrieve a persisted analysis",
    description=(
        "Returns the full result of a previously completed BuildSmart analysis "
        "fetched directly from Databricks Lakebase. "
        "This endpoint does NOT invoke the LangGraph workflow, any agent, the LLM, or MCP."
    ),
    tags=["Analyses"],
    responses={
        200: {"description": "Analysis found and returned."},
        404: {"description": "Analysis not found."},
        500: {"description": "Database retrieval error."},
        503: {"description": "Persistence layer not configured."},
    },
)
def get_analysis(analysis_id: str):
    """
    Retrieve analysis from Lakebase by analysis_id.

    - **analysis_id**: UUID of the previously created analysis.
    """
    return retrieve_analysis(analysis_id)
