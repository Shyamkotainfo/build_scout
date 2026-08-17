import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from api.routes import router
from api.exceptions import BuildSmartAPIException
from models.schemas import ErrorResponse, ErrorDetail

# Configure root logger (will be shared with the rest of the application)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="BuildSmart Analysis API",
    description="API for the BuildSmart AI agentic architecture workflow.",
    version="1.0.0"
)

app.include_router(router)

@app.exception_handler(BuildSmartAPIException)
async def buildsmart_exception_handler(request: Request, exc: BuildSmartAPIException):
    logger.error(f"BuildSmartAPIException: {exc.code} - {exc.message}", exc_info=exc)
    error_detail = ErrorDetail(
        code=exc.code,
        message=exc.message,
        analysis_id=exc.analysis_id
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(error=error_detail).model_dump()
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"RequestValidationError: {exc.errors()}")
    error_detail = ErrorDetail(
        code="INVALID_REQUEST",
        message="The request is invalid.",
        details={"errors": exc.errors()}
    )
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(error=error_detail).model_dump()
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled generic exception", exc_info=exc)
    error_detail = ErrorDetail(
        code="INTERNAL_ERROR",
        message="An unexpected server error occurred."
    )
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(error=error_detail).model_dump()
    )
