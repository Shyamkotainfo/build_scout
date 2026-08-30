import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from api.main import app

client = TestClient(app, raise_server_exceptions=False)

@pytest.fixture
def mock_run_bg():
    with patch("api.routes.run_analysis_background") as mock_bg:
        yield mock_bg

def test_create_analysis_valid(mock_run_bg):
    response = client.post("/api/v1/analyses", json={"user_request": "build a platform"})
    
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert data["status"] == "QUEUED"
    
    # Fastapi BackgroundTasks get executed after response is sent if using TestClient in some cases,
    # but to check if it was added, we can check the call args if they got executed.
    # Actually, starlette TestClient executes background tasks before returning.
    mock_run_bg.assert_called_once()
    assert mock_run_bg.call_args[0][1] == "build a platform"

def test_create_analysis_invalid_request():
    # Empty string should fail Pydantic validation
    response = client.post("/api/v1/analyses", json={"user_request": ""})
    assert response.status_code == 422

