import pytest
from unittest.mock import MagicMock, patch

from agents.state import BuildSmartState
from agents.validation import ValidationAgent


@pytest.fixture
def mock_validation_agent():
    mock_llm = MagicMock()
    mock_llm_json = MagicMock()
    
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "architecture_consistency": {
            "score": 90,
            "findings": ["Architecture is solid"]
        },
        "data_flow_consistency": {
            "score": 95,
            "findings": ["Data flows logically"]
        },
        "integration_consistency": {
            "score": 85,
            "findings": ["Good integrations"]
        },
        "implementation_completeness": {
            "score": 80,
            "findings": ["Mostly complete"]
        },
        "risk_completeness": {
            "score": 88,
            "findings": ["Risks well documented"]
        },
        "recommendations": ["Proceed with development"]
    }
    '''
    from unittest.mock import AsyncMock
    mock_llm.invoke = MagicMock(return_value=mock_response)
    mock_llm_json.invoke = MagicMock(return_value=mock_response)
    mock_llm.ainvoke = AsyncMock(return_value=mock_response)
    mock_llm_json.ainvoke = AsyncMock(return_value=mock_response)
    mock_llm.bind.return_value = mock_llm_json
    
    with patch("agents.validation.get_llm", return_value=mock_llm):
        agent = ValidationAgent()
        yield agent


def test_validation_agent_instantiation():
    agent = ValidationAgent()
    assert agent.llm is not None


def test_validation_agent_missing_blueprint(mock_validation_agent):
    initial_state = {"status": "BLUEPRINT_CREATED", "agent_history": [], "blueprint": {}}
    
    final_state = mock_validation_agent.run(initial_state)
    
    assert final_state["status"] == "VALIDATED"
    assert "ValidationAgent" in final_state["agent_history"]
    
    val = final_state.get("validation_result", {})
    assert val["overall_status"] == "FAIL"
    assert "No blueprint was generated." in val["critical_issues"]


def test_validation_agent_valid_blueprint(mock_validation_agent):
    initial_state = {
        "status": "BLUEPRINT_CREATED",
        "agent_history": [],
        "requirements": [{"id": "REQ-1", "description": "Test", "priority": "HIGH"}],
        "components": [{"id": "COMP-1", "name": "API", "category": "BACKEND", "description": "Test API"}],
        "decisions": [
            {
                "component_id": "COMP-1",
                "decision": "REUSE",
                "selected_candidate_name": "FastAPI"
            }
        ],
        "blueprint": {
            "components": [
                {
                    "component_id": "COMP-1",
                    "component_name": "API",
                    "decision": "REUSE",
                    "technology": "FastAPI",
                    "responsibility": "Handle requests",
                    "integration": "None"
                }
            ]
        }
    }
    
    final_state = mock_validation_agent.run(initial_state)
    
    val = final_state.get("validation_result", {})
    assert val["overall_status"] == "PASS"  # All scores high, no warnings/critical issues
    assert val["component_coverage"]["score"] == 100
    assert val["decision_consistency"]["score"] == 100
    assert val["requirement_coverage"]["score"] == 100
    assert val["architecture_consistency"]["score"] == 90
    assert not val["critical_issues"]


def test_validation_agent_missing_components(mock_validation_agent):
    initial_state = {
        "components": [
            {"id": "COMP-1", "name": "API"},
            {"id": "COMP-2", "name": "DB"}
        ],
        "decisions": [],
        "blueprint": {
            "components": [
                {"component_id": "COMP-1", "decision": "BUILD"}
            ]
        },
        "agent_history": []
    }
    
    final_state = mock_validation_agent.run(initial_state)
    val = final_state.get("validation_result", {})
    
    assert val["overall_status"] == "FAIL"
    assert val["component_coverage"]["score"] == 50
    assert any("COMP-2" in issue for issue in val["critical_issues"])


def test_validation_agent_decision_contradiction_fails(mock_validation_agent):
    """MANDATORY TEST: REUSE in DecisionAgent vs BUILD in BlueprintAgent = FAIL"""
    initial_state = {
        "components": [{"id": "COMP-001", "name": "API"}],
        "decisions": [
            {
                "component_id": "COMP-001",
                "decision": "REUSE",
                "selected_candidate_name": "FastAPI"
            }
        ],
        "blueprint": {
            "components": [
                {
                    "component_id": "COMP-001",
                    "component_name": "API",
                    "decision": "BUILD", # Contradiction!
                    "technology": "Custom API",
                    "responsibility": "Handle",
                    "integration": "None"
                }
            ]
        },
        "agent_history": []
    }
    
    final_state = mock_validation_agent.run(initial_state)
    val = final_state.get("validation_result", {})
    
    assert val["overall_status"] == "FAIL"
    assert val["decision_consistency"]["score"] < 100
    assert any("Decision contradiction" in issue for issue in val["critical_issues"])


def test_validation_agent_reuse_missing_candidate_warning(mock_validation_agent):
    initial_state = {
        "components": [{"id": "COMP-001", "name": "API"}],
        "decisions": [
            {
                "component_id": "COMP-001",
                "decision": "REUSE",
                "selected_candidate_name": None # Missing candidate
            }
        ],
        "blueprint": {
            "components": [
                {"component_id": "COMP-001", "decision": "REUSE"}
            ]
        },
        "agent_history": []
    }
    
    final_state = mock_validation_agent.run(initial_state)
    val = final_state.get("validation_result", {})
    
    # Not a fail, just a warning since decision matches but candidate missing
    assert val["overall_status"] in ("WARNING", "FAIL") # LLM scores might pull it to PASS but warnings prevent PASS
    assert len(val["warnings"]) == 1
    assert "no candidate was selected" in val["warnings"][0]


def test_validation_agent_empty_candidates_with_build(mock_validation_agent):
    """Test empty candidates/evaluations with BUILD decisions does not cause failure."""
    initial_state = {
        "candidates": [],
        "evaluations": [],
        "components": [{"id": "COMP-1", "name": "API"}],
        "decisions": [
            {"component_id": "COMP-1", "decision": "BUILD", "selected_candidate_name": None}
        ],
        "blueprint": {
            "components": [
                {"component_id": "COMP-1", "decision": "BUILD"}
            ]
        },
        "agent_history": []
    }
    
    final_state = mock_validation_agent.run(initial_state)
    val = final_state.get("validation_result", {})
    
    assert val["overall_status"] == "PASS"
    assert not val["critical_issues"]
