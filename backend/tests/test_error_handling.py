import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from api.main import app
from api.exceptions import AnalysisExecutionException, LLMServiceException

client = TestClient(app, raise_server_exceptions=False)

def test_health_endpoint():
    """TEST 1 — Ensure /health remains healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")

def test_missing_user_request():
    """TEST 2 — Missing user_request."""
    response = client.post("/api/v1/analyses", json={})
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_REQUEST"
    assert "user_request" in str(data["error"]["details"])

def test_empty_user_request():
    """TEST 3 — Empty user_request."""
    response = client.post("/api/v1/analyses", json={"user_request": ""})
    assert response.status_code == 422
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_REQUEST"

@patch("services.analysis_service.PromptOptimizer")
def test_generic_unexpected_exception(mock_optimizer):
    """TEST 4 — Generic unexpected exception handled by background task."""
    mock_optimizer.return_value.optimize.side_effect = Exception("System meltdown")
    
    from services.analysis_service import run_analysis_background
    from services.job_store import init_job, build_status_response
    
    analysis_id = "test-generic-exception"
    init_job(analysis_id)
    
    # Should not raise exception
    run_analysis_background(analysis_id, "Build something")
    
    status = build_status_response(analysis_id)
    assert status["status"] == "FAILED"
    assert status["error"] == "Unable to complete the analysis."


@patch("services.analysis_service.build_buildsmart_graph")
def test_analysis_execution_exception(mock_graph):
    """TEST 5 — LangGraph execution exception (safe error response)."""
    mock_graph.side_effect = AnalysisExecutionException(analysis_id="123")
    
    from services.analysis_service import run_analysis_background
    from services.job_store import init_job, build_status_response
    
    analysis_id = "test-execution-exception"
    init_job(analysis_id)
    
    run_analysis_background(analysis_id, "Build something")
    
    status = build_status_response(analysis_id)
    assert status["status"] == "FAILED"
    assert status["error"] == "Unable to complete the analysis."


@patch("services.analysis_service.PromptOptimizer")
def test_llm_service_failure(mock_optimizer):
    """TEST 6 — LLM service failure/rate limit."""
    mock_optimizer.return_value.optimize.side_effect = Exception("429 Too Many Requests")
    
    from services.analysis_service import run_analysis_background
    from services.job_store import init_job, build_status_response
    
    analysis_id = "test-llm-exception"
    init_job(analysis_id)
    
    run_analysis_background(analysis_id, "Build something")
    
    status = build_status_response(analysis_id)
    assert status["status"] == "FAILED"
    assert status["error"] == "The AI service is temporarily unavailable. Please try again later."
