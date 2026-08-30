import uuid
from fastapi import APIRouter, BackgroundTasks, HTTPException
from models.schemas import AnalysisRequest, AnalysisResultResponse, AnalysisSummaryResponse, AnalysisResponse, AnalysisStatusResponse
from services.analysis_service import run_analysis_background
from services.retrieval_service import retrieve_analysis, list_analyses
from services.job_store import init_job, build_status_response, ACTIVE_JOBS

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
            session_gen = get_session()
            session = next(session_gen)
            try:
                from database.models import Analysis
                session.query(Analysis).limit(1).all()
            except sqlalchemy.exc.OperationalError as e:
                db_status = "unavailable"
            except sqlalchemy.exc.ProgrammingError as e:
                db_status = "schema_error"
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
        "mcp": "healthy"
    }

@router.post(
    "/api/v1/analyses",
    response_model=AnalysisResponse,
    summary="Run a new analysis",
    description=(
        "Executes the full BuildSmart agentic workflow as a background task. "
        "Returns the analysis_id immediately."
    ),
    tags=["Analyses"],
)
def create_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    analysis_id = str(uuid.uuid4())
    init_job(analysis_id)
    background_tasks.add_task(run_analysis_background, analysis_id, request.user_request)
    
    return AnalysisResponse(
        analysis_id=analysis_id,
        status="QUEUED",
        message="Analysis queued for background execution."
    )

@router.get(
    "/api/v1/analyses/{analysis_id}/status",
    response_model=AnalysisStatusResponse,
    summary="Get analysis status",
    description="Returns the real-time execution status of a running analysis or checks if it completed.",
    tags=["Analyses"],
)
def get_analysis_status(analysis_id: str):
    # 1. Check active jobs
    status = build_status_response(analysis_id)
    if status:
        return status
        
    # 2. Not in active jobs, check if it's in the DB (Completed)
    try:
        from database.connection import is_database_configured, get_session
        from database.repositories import AnalysisRepository
        if is_database_configured():
            session_gen = get_session()
            session = next(session_gen)
            repo = AnalysisRepository()
            db_analysis = repo.get_analysis(session, uuid.UUID(analysis_id))
            try:
                next(session_gen)
            except StopIteration:
                pass
                
            if db_analysis:
                return AnalysisStatusResponse(
                    analysis_id=analysis_id,
                    status="COMPLETED",
                    current_stage="persistence",
                    stages=[],
                    error=None
                )
    except Exception:
        pass
        
    # 3. Not in DB either -> 404
    raise HTTPException(status_code=404, detail="Analysis not found or expired from job store.")

@router.get(
    "/api/v1/analyses",
    response_model=list[AnalysisSummaryResponse],
    summary="List all analyses",
    description="Returns a lightweight list of all previous and currently running analyses.",
    tags=["Analyses"],
)
def get_all_analyses():
    # Fetch historical analyses
    db_analyses = list_analyses()
    
    # Prepend active running jobs
    active_summaries = []
    import datetime
    
    # Sort active jobs by their ID to keep deterministic behavior (though order isn't strictly defined by time)
    for aid, job in ACTIVE_JOBS.items():
        if job["status"] not in ["COMPLETED", "FAILED"]:
            active_summaries.append(
                AnalysisSummaryResponse(
                    analysis_id=aid,
                    user_request="Analyzing new request...",
                    status=job["status"],
                    created_at=datetime.datetime.now(datetime.timezone.utc).isoformat()
                )
            )
            
    return active_summaries + db_analyses

@router.get(
    "/api/v1/analyses/{analysis_id}",
    response_model=AnalysisResultResponse,
    summary="Retrieve a persisted analysis",
    description=(
        "Returns the full result of a previously completed BuildSmart analysis "
        "fetched directly from Databricks Lakebase."
    ),
    tags=["Analyses"],
)
def get_analysis(analysis_id: str):
    return retrieve_analysis(analysis_id)

