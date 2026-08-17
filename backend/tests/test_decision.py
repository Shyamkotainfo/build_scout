import pytest
from unittest.mock import MagicMock, patch

from agents.state import BuildSmartState
from agents.decision import DecisionAgent


@pytest.fixture
def mock_decision_agent():
    mock_llm = MagicMock()
    mock_llm_json = MagicMock()
    
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "decisions": [
            {
                "component_id": "COMP-001",
                "decision": "REUSE",
                "selected_candidate_id": "CAND-001",
                "selected_candidate_name": "TestCandidate",
                "confidence": 95,
                "reason": "Strong match",
                "alternatives_considered": [],
                "risks": [],
                "implementation_notes": ["Implement it"]
            }
        ]
    }
    '''
    mock_llm_json.invoke = MagicMock(return_value=mock_response)
    mock_llm.bind.return_value = mock_llm_json
    
    with patch("agents.decision.get_llm", return_value=mock_llm):
        agent = DecisionAgent()
        yield agent


def test_decision_agent_instantiation():
    agent = DecisionAgent()
    assert agent.llm is not None


def test_decision_agent_empty_evaluations_produces_build(mock_decision_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "status": "EVALUATED",
        "domain": "Test",
        "requirements": [],
        "components": [
            {
                "id": "COMP-001",
                "name": "TEST_COMP",
                "category": "AI",
                "description": "Test description"
            }
        ],
        "candidates": [],
        "evaluations": [],
        "execution_plan": [],
        "agent_history": ["DecompositionAgent", "ResearchAgent", "EvaluationAgent"]
    }
    
    final_state = mock_decision_agent.run(initial_state)
    
    assert final_state["status"] == "DECIDED"
    assert "DecisionAgent" in final_state["agent_history"]
    
    decisions = final_state.get("decisions")
    assert decisions is not None
    assert len(decisions) == 1
    
    dec = decisions[0]
    assert dec["component_id"] == "COMP-001"
    assert dec["decision"] == "BUILD"
    assert dec["selected_candidate_id"] is None
    assert dec["selected_candidate_name"] is None
    assert dec["confidence"] == 100


def test_decision_agent_run_updates_state(mock_decision_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "status": "EVALUATED",
        "domain": "Test",
        "requirements": [],
        "components": [
            {
                "id": "COMP-001",
                "name": "TEST_COMP",
                "category": "AI",
                "description": "Test description"
            }
        ],
        "candidates": [
            {
                "id": "CAND-001",
                "component_id": "COMP-001",
                "name": "TestCandidate",
                "source": "github",
                "url": "https://github.com/test/test",
                "description": "Test candidate",
                "relevance_reason": "Matches test",
                "metadata": {"stars": 100}
            }
        ],
        "evaluations": [
            {
                "candidate_id": "CAND-001",
                "component_id": "COMP-001",
                "relevance_score": 95,
                "compatibility_score": 92,
                "project_health_score": 90,
                "license_score": 100,
                "security_score": 90,
                "maintainability_score": 91,
                "overall_score": 93.0,
                "strengths": ["Strong match"],
                "concerns": [],
                "missing_evidence": []
            }
        ],
        "execution_plan": [],
        "agent_history": ["DecompositionAgent", "ResearchAgent", "EvaluationAgent"]
    }
    
    final_state = mock_decision_agent.run(initial_state)
    
    assert final_state["status"] == "DECIDED"
    assert "DecisionAgent" in final_state["agent_history"]
    
    decisions = final_state.get("decisions")
    assert decisions is not None
    assert len(decisions) == 1
    
    dec = decisions[0]
    assert dec["component_id"] == "COMP-001"
    assert dec["decision"] == "REUSE"
    assert dec["selected_candidate_id"] == "CAND-001"
    assert dec["selected_candidate_name"] == "TestCandidate"
    assert dec["confidence"] == 95
    assert dec["reason"] == "Strong match"


def test_invalid_decision_build_with_candidate():
    from agents.decision import RawDecisionResult
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        RawDecisionResult(
            component_id="COMP-001",
            decision="BUILD",
            selected_candidate_id="CAND-001",
            selected_candidate_name="Test",
            confidence=100,
            reason="test"
        )


def test_invalid_decision_reuse_without_candidate():
    from agents.decision import RawDecisionResult
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        RawDecisionResult(
            component_id="COMP-001",
            decision="REUSE",
            selected_candidate_id=None,
            selected_candidate_name=None,
            confidence=100,
            reason="test"
        )
