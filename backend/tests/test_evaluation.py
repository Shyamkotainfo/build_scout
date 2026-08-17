import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from agents.state import BuildSmartState


@pytest.fixture
def mock_evaluation_agent():
    mock_llm = MagicMock()
    mock_llm_json = MagicMock()
    
    # Predictable JSON output
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "evaluations": [
            {
                "candidate_id": "CAND-001",
                "component_id": "COMP-001",
                "relevance_score": 100,
                "compatibility_score": 90,
                "project_health_score": 80,
                "license_score": 100,
                "security_score": null,
                "maintainability_score": 90,
                "strengths": ["Good match", "Permissive license"],
                "concerns": ["Unknown security"],
                "missing_evidence": ["Security"]
            }
        ]
    }
    '''
    mock_llm_json.invoke = MagicMock(return_value=mock_response)
    mock_llm.bind.return_value = mock_llm_json
    
    with patch("agents.evaluation.get_llm", return_value=mock_llm):
        from agents.evaluation import EvaluationAgent
        agent = EvaluationAgent()
        yield agent


def test_evaluation_agent_instantiation():
    from agents.evaluation import EvaluationAgent
    agent = EvaluationAgent()
    assert agent.llm is not None


def test_evaluation_agent_run_updates_state(mock_evaluation_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "status": "RESEARCHED",
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
        "execution_plan": [],
        "agent_history": ["DecompositionAgent", "ResearchAgent"]
    }
    
    final_state = mock_evaluation_agent.run(initial_state)
    
    assert final_state["status"] == "EVALUATED"
    assert "EvaluationAgent" in final_state["agent_history"]
    
    evaluations = final_state.get("evaluations")
    assert evaluations is not None
    assert len(evaluations) == 1
    
    ev = evaluations[0]
    assert ev["candidate_id"] == "CAND-001"
    assert ev["component_id"] == "COMP-001"
    assert ev["relevance_score"] == 100
    assert ev["security_score"] is None
    assert "Security" in ev["missing_evidence"]
    
    # Check overall_score deterministic calculation
    # Weights: rel(0.25), comp(0.20), proj(0.15), lic(0.10), sec(0.15), maint(0.15)
    # Total known weight = 1 - 0.15 (security) = 0.85
    # Total known score = 100*0.25 + 90*0.20 + 80*0.15 + 100*0.10 + 90*0.15 
    # = 25 + 18 + 12 + 10 + 13.5 = 78.5
    # Overall score = 78.5 / 0.85 = 92.35
    assert ev["overall_score"] == 92.35


def test_evaluation_agent_empty_candidates(mock_evaluation_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "status": "RESEARCHED",
        "domain": "Test",
        "requirements": [],
        "components": [],
        "candidates": [],
        "execution_plan": [],
        "agent_history": ["DecompositionAgent", "ResearchAgent"]
    }
    
    final_state = mock_evaluation_agent.run(initial_state)
    
    assert final_state["status"] == "EVALUATED"
    assert "EvaluationAgent" in final_state["agent_history"]
    assert "evaluations" not in final_state
