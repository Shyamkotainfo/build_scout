import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from api.main import app
from models.schemas import AnalysisResultResponse

client = TestClient(app, raise_server_exceptions=False)

@pytest.fixture
def mock_analyze():
    with patch("api.routes.analyze") as mock_a:
        yield mock_a

def test_create_analysis_valid(mock_analyze):
    mock_res = AnalysisResultResponse(
        analysis_id="123",
        user_request="build a platform",
        normalized_request="build a platform",
        domain="DOCUMENTS",
        status="VALIDATED",
        requirements=[],
        components=[],
        candidates=[],
        evaluations=[],
        decisions=[],
        blueprint={},
        validation_result={},
        agent_history=["SupervisorAgent"],
        traces=[]
    )
    mock_analyze.return_value = mock_res
    
    response = client.post("/api/v1/analyses", json={"user_request": "build a platform"})
    
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == "123"
    assert data["status"] == "VALIDATED"
    assert data["agent_history"] == ["SupervisorAgent"]
    
    mock_analyze.assert_called_once_with("build a platform")

def test_create_analysis_invalid_request():
    # Empty string should fail Pydantic validation
    response = client.post("/api/v1/analyses", json={"user_request": ""})
    assert response.status_code == 422

def test_create_analysis_internal_error(mock_analyze):
    mock_analyze.side_effect = Exception("Workflow failed")
    
    response = client.post("/api/v1/analyses", json={"user_request": "build a platform"})
    assert response.status_code == 500
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "INTERNAL_ERROR"
