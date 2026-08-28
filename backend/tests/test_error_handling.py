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

@patch("api.routes.analyze")
def test_generic_unexpected_exception(mock_analyze):
    """TEST 4 — Generic unexpected exception."""
    mock_analyze.side_effect = Exception("System meltdown")
    
    response = client.post("/api/v1/analyses", json={"user_request": "Build something"})
    
    assert response.status_code == 500
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INTERNAL_ERROR"
    assert "meltdown" not in data["error"]["message"] # no stack trace/internal message exposed

@patch("api.routes.analyze")
def test_analysis_execution_exception(mock_analyze):
    """TEST 5 — LangGraph execution exception (safe error response)."""
    mock_analyze.side_effect = AnalysisExecutionException(analysis_id="123")
    
    response = client.post("/api/v1/analyses", json={"user_request": "Build something"})
    
    assert response.status_code == 500
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "ANALYSIS_EXECUTION_FAILED"
    assert data["error"]["analysis_id"] == "123"
    assert "Unable to complete" in data["error"]["message"]

@patch("api.routes.analyze")
def test_llm_service_failure(mock_analyze):
    """TEST 6 — LLM service failure/rate limit."""
    mock_analyze.side_effect = LLMServiceException(analysis_id="456")
    
    response = client.post("/api/v1/analyses", json={"user_request": "Build something"})
    
    assert response.status_code == 503
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "LLM_SERVICE_UNAVAILABLE"
    assert data["error"]["analysis_id"] == "456"
    assert "service is temporarily unavailable" in data["error"]["message"]
