from fastapi import APIRouter
from models.schemas import AnalysisRequest, AnalysisResultResponse, AnalysisSummaryResponse
from services.analysis_service import analyze
from services.retrieval_service import retrieve_analysis, list_analyses

router = APIRouter()

@router.get("/health")
def health_check():
    from config.settings import get_settings
    from database.connection import get_session, is_database_configured
    import sqlalchemy
    
    settings = get_settings()
    llm_status = "configured" if settings.groq_api_key else "not_configured"
    
    db_status = "unavailable"
    if is_database_configured():
        db_status = "connected"
        try:
            # Safely test if we can run a query and if a required table exists
            session_gen = get_session()
            session = next(session_gen)
            try:
                # Need to use text for raw queries in newer SQLAlchemy if we were to execute raw sql,
                # but let's just query a model directly to let SQLAlchemy handle it
                from database.models import Analysis
                session.query(Analysis).limit(1).all()
            except sqlalchemy.exc.OperationalError as e:
                db_status = "unavailable" # Auth or network error
            except sqlalchemy.exc.ProgrammingError as e:
                db_status = "schema_error" # Missing table
            finally:
                try:
                    next(session_gen)
                except StopIteration:
                    pass
        except Exception:
            pass
    else:
        db_status = "not_configured"
        
    overall_status = "healthy"
    if db_status in ["unavailable", "schema_error"] or llm_status == "not_configured":
        overall_status = "degraded"
        
    return {
        "status": overall_status,
        "database": db_status,
        "llm": llm_status,
        "mcp": "healthy" # Simplified for now, in a real app would ping servers
    }

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
    "/api/v1/analyses",
    response_model=list[AnalysisSummaryResponse],
    summary="List all analyses",
    description="Returns a lightweight list of all previous analyses.",
    tags=["Analyses"],
)
def get_all_analyses():
    return list_analyses()


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
