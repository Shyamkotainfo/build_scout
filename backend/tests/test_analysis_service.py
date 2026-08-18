import pytest
from unittest.mock import patch, MagicMock

from services.analysis_service import analyze
from agents.state import BuildSmartState
from models.schemas import AnalysisResultResponse

@pytest.fixture
def mock_graph():
    with patch("services.analysis_service.build_buildsmart_graph") as mock_build:
        mock_g = MagicMock()
        mock_build.return_value = mock_g
        yield mock_g

def test_analyze_creates_initial_state_and_invokes_graph(mock_graph):
    # Setup mock return value
    mock_final_state: BuildSmartState = {
        "analysis_id": "123",
        "user_request": "build a thing",
        "normalized_request": "build a thing",
        "domain": "GENERAL",
        "status": "VALIDATED",
        "requirements": [{"id": "REQ-1", "description": "desc", "priority": "HIGH"}],
        "components": [],
        "candidates": [],
        "evaluations": [],
        "decisions": [
            {"component_id": "C-1", "decision": "BUILD", "selected_candidate_name": None, "confidence": 100, "reason": "No candidates", "risks": [], "implementation_notes": []}
        ],
        "blueprint": {},
        "validation_result": {},
        "current_agent": "ValidationAgent",
        "agent_history": ["SupervisorAgent", "ValidationAgent"],
        "retry_count": 0,
        "execution_plan": []
    }
    mock_graph.invoke.return_value = mock_final_state

    # Execute
    result = analyze("build a thing")

    # Assertions
    mock_graph.invoke.assert_called_once()
    assert isinstance(result, AnalysisResultResponse)
    assert result.analysis_id == "123"
    assert result.user_request == "build a thing"
    assert result.status == "VALIDATED"
    assert len(result.requirements) == 1
    assert result.requirements[0].id == "REQ-1"
    
    # Test preserves BUILD decisions and empty candidates/evaluations
    assert len(result.candidates) == 0
    assert len(result.evaluations) == 0
    assert len(result.decisions) == 1
    assert result.decisions[0].decision == "BUILD"
    
    assert result.agent_history == ["SupervisorAgent", "ValidationAgent"]
