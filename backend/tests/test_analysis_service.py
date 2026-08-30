import pytest
from unittest.mock import patch, MagicMock

from services.analysis_service import run_analysis_background
from services.job_store import ACTIVE_JOBS, init_job
from agents.state import BuildSmartState
from models.schemas import AnalysisResultResponse

@pytest.fixture
def mock_graph():
    with patch("services.analysis_service.build_buildsmart_graph") as mock_build:
        mock_g = MagicMock()
        mock_build.return_value = mock_g
        yield mock_g

def test_run_analysis_background_updates_job_store(mock_graph):
    # Setup mock stream yield
    mock_final_state = {
        "analysis_id": "123",
        "user_request": "build a thing",
        "normalized_request": "build a thing",
        "domain": "GENERAL",
        "status": "VALIDATED",
        "requirements": [],
        "components": [],
        "candidates": [],
        "evaluations": [],
        "decisions": [],
        "blueprint": {},
        "validation_result": {},
        "current_agent": "ValidationAgent",
        "agent_history": [],
        "retry_count": 0,
        "execution_plan": []
    }
    
    # stream yields a dict representing state after node completion
    mock_graph.stream.return_value = [
        {"supervisor": mock_final_state},
        {"validation": mock_final_state}
    ]

    init_job("123")
    
    with patch("services.analysis_service.get_metrics_for_analysis") as mock_metrics:
        mock_metrics.return_value = []
        
        with patch("services.analysis_service.PromptOptimizer") as mock_po:
            mock_opt = MagicMock()
            mock_opt.optimize.return_value = MagicMock(
                optimization_applied=False, 
                confidence=100.0,
                recommended_domain="GENERAL",
                optimized_prompt="build a thing",
                risk_score=0.1
            )
            mock_po.return_value = mock_opt
            
            # Execute
            run_analysis_background("123", "build a thing")

    # Assertions
    mock_graph.stream.assert_called_once()
    
    assert "123" in ACTIVE_JOBS
    job = ACTIVE_JOBS["123"]
    assert job["status"] == "COMPLETED"
    assert "prompt_optimizer" in job["stages"]
    assert job["stages"]["prompt_optimizer"]["status"] == "COMPLETED"
    
    # It should track nodes yielded by stream
    assert "supervisor" in job["stages"]
    assert job["stages"]["supervisor"]["status"] == "COMPLETED"
