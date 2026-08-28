import pytest
from unittest.mock import MagicMock, AsyncMock, patch

from agents.state import BuildSmartState
from agents.blueprint import BlueprintAgent


@pytest.fixture
def mock_blueprint_agent():
    mock_llm = MagicMock()
    mock_llm_json = MagicMock()
    
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "solution_summary": "Test summary",
        "architecture_style": "Test Style",
        "technology_stack": [
            {
                "component_id": "COMP-001",
                "component_name": "TEST_COMP",
                "decision": "REUSE",
                "technology": "Test Tech",
                "reason": "Because"
            }
        ],
        "components": [
            {
                "component_id": "COMP-001",
                "component_name": "TEST_COMP",
                "decision": "REUSE",
                "technology": "Test Tech",
                "responsibility": "To test",
                "integration": "API"
            }
        ],
        "data_flow": ["A -> B"],
        "integration_points": [
            {
                "source": "A",
                "target": "B",
                "purpose": "Testing"
            }
        ],
        "implementation_phases": [
            {
                "phase": 1,
                "name": "Phase 1",
                "activities": ["Do something"]
            }
        ],
        "reuse_summary": {
            "reuse": ["TEST_COMP"],
            "adapt": [],
            "build": []
        },
        "risks": ["Risk 1"],
        "assumptions": ["Assumption 1"]
    }
    '''
    from unittest.mock import AsyncMock
    mock_llm.invoke = MagicMock(return_value=mock_response)
    mock_llm_json.invoke = MagicMock(return_value=mock_response)
    mock_llm.ainvoke = AsyncMock(return_value=mock_response)
    mock_llm_json.ainvoke = AsyncMock(return_value=mock_response)
    mock_llm.bind.return_value = mock_llm_json
    
    with patch("agents.blueprint.get_llm", return_value=mock_llm):
        agent = BlueprintAgent()
        yield agent


def test_blueprint_agent_instantiation():
    agent = BlueprintAgent()
    assert agent.llm is not None


def test_blueprint_agent_run_updates_state(mock_blueprint_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "normalized_request": "test request",
        "domain": "Test",
        "status": "DECIDED",
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
                "implementation_notes": []
            }
        ],
        "execution_plan": [],
        "agent_history": ["DecompositionAgent", "ResearchAgent", "EvaluationAgent", "DecisionAgent"]
    }
    
    final_state = mock_blueprint_agent.run(initial_state)
    
    assert final_state["status"] == "BLUEPRINT_CREATED"
    assert "BlueprintAgent" in final_state["agent_history"]
    
    blueprint = final_state.get("blueprint")
    assert blueprint is not None
    assert blueprint["solution_summary"] == "Test summary"
    assert blueprint["architecture_style"] == "Test Style"
    assert len(blueprint["technology_stack"]) == 1
    assert blueprint["technology_stack"][0]["decision"] == "REUSE"
    assert len(blueprint["components"]) == 1
    assert blueprint["components"][0]["responsibility"] == "To test"
    assert len(blueprint["data_flow"]) == 1
    assert len(blueprint["integration_points"]) == 1
    assert len(blueprint["implementation_phases"]) == 1
    assert len(blueprint["reuse_summary"]["reuse"]) == 1
    assert blueprint["risks"] == ["Risk 1"]
    assert blueprint["assumptions"] == ["Assumption 1"]


def test_blueprint_agent_missing_reuse_summary(mock_blueprint_agent):
    """TEST 1: LLM response without reuse_summary still succeeds."""
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "solution_summary": "Test",
        "architecture_style": "Test",
        "technology_stack": [],
        "components": [],
        "data_flow": [],
        "integration_points": [],
        "implementation_phases": [],
        "risks": [],
        "assumptions": []
    }
    '''
    mock_blueprint_agent.llm_json.invoke = MagicMock(return_value=mock_response)
    
    initial_state = {"user_request": "test", "agent_history": [], "decisions": [], "components": []}
    final_state = mock_blueprint_agent.run(initial_state)
    
    assert final_state["status"] == "BLUEPRINT_CREATED"
    assert "reuse_summary" in final_state["blueprint"]


def test_blueprint_agent_validation_failure(mock_blueprint_agent):
    """TEST 2: Blueprint validation failure should result in BLUEPRINT_FAILED."""
    # Provide completely invalid JSON
    mock_response = MagicMock()
    mock_response.content = 'INVALID JSON'
    mock_blueprint_agent.llm.ainvoke = AsyncMock(return_value=mock_response)
    mock_blueprint_agent.llm_json.ainvoke = AsyncMock(return_value=mock_response)
    
    initial_state = {"user_request": "test", "agent_history": []}
    final_state = mock_blueprint_agent.run(initial_state)
    
    assert final_state["status"] == "BLUEPRINT_FAILED"
    assert final_state["blueprint"] == {}
    assert "BlueprintAgent" not in final_state["agent_history"]


def test_blueprint_agent_empty_candidates_workflow(mock_blueprint_agent):
    """TEST 7: Empty candidates/evaluations with BUILD decisions produces build list."""
    initial_state = {
        "candidates": [],
        "evaluations": [],
        "decisions": [
            {"component_id": "COMP-1", "decision": "BUILD"},
            {"component_id": "COMP-2", "decision": "BUILD"}
        ],
        "components": [
            {"id": "COMP-1", "name": "INCOMING_MESSAGE_INGESTION"},
            {"id": "COMP-2", "name": "CONVERSATION_MANAGER"}
        ],
        "agent_history": []
    }
    
    final_state = mock_blueprint_agent.run(initial_state)
    assert final_state["status"] == "BLUEPRINT_CREATED"
    blueprint = final_state["blueprint"]
    
    # Assert TEST 7 logic
    assert blueprint["reuse_summary"]["reuse"] == []
    assert blueprint["reuse_summary"]["adapt"] == []
    assert blueprint["reuse_summary"]["build"] == ["INCOMING_MESSAGE_INGESTION", "CONVERSATION_MANAGER"]


def test_blueprint_agent_decision_consistency(mock_blueprint_agent):
    """TEST 2, 4, 5, 6, 8, 9: Deterministic reuse_summary is generated from decisions."""
    initial_state = {
        "decisions": [
            {"component_id": "C1", "decision": "REUSE", "selected_candidate_name": "FastAPI"},
            {"component_id": "C2", "decision": "ADAPT", "selected_candidate_name": "Qdrant"},
            {"component_id": "C3", "decision": "BUILD", "selected_candidate_name": None},
            {"component_id": "C4", "decision": "REUSE", "selected_candidate_name": None} # Missing name, fallback to component name
        ],
        "components": [
            {"id": "C1", "name": "SUPPORT_API"},
            {"id": "C2", "name": "KNOWLEDGE_RETRIEVAL"},
            {"id": "C3", "name": "DOMAIN_LOGIC"},
            {"id": "C4", "name": "FALLBACK_REUSE"}
        ],
        "agent_history": []
    }
    
    final_state = mock_blueprint_agent.run(initial_state)
    assert final_state["status"] == "BLUEPRINT_CREATED"
    blueprint = final_state["blueprint"]
    
    # Tests 2, 4, 5, 6
    assert blueprint["reuse_summary"]["reuse"] == ["FastAPI", "FALLBACK_REUSE"] # Test 9 included
    assert blueprint["reuse_summary"]["adapt"] == ["Qdrant"]
    assert blueprint["reuse_summary"]["build"] == ["DOMAIN_LOGIC"]


def test_blueprint_agent_overwrites_incorrect_reuse_summary(mock_blueprint_agent):
    """TEST 3: LLM-provided incorrect reuse_summary is overwritten."""
    mock_response = MagicMock()
    mock_response.content = '''
    {
        "solution_summary": "Test",
        "architecture_style": "Test",
        "technology_stack": [],
        "components": [],
        "data_flow": [],
        "integration_points": [],
        "implementation_phases": [],
        "reuse_summary": {
            "reuse": ["WrongTechnology"],
            "adapt": [],
            "build": []
        },
        "risks": [],
        "assumptions": []
    }
    '''
    mock_blueprint_agent.llm.ainvoke = AsyncMock(return_value=mock_response)
    mock_blueprint_agent.llm_json.ainvoke = AsyncMock(return_value=mock_response)
    
    initial_state = {
        "user_request": "test", 
        "agent_history": [],
        "decisions": [{"component_id": "COMP-001", "decision": "BUILD"}],
        "components": [{"id": "COMP-001", "name": "REAL_TECH"}]
    }
    final_state = mock_blueprint_agent.run(initial_state)
    
    assert final_state["status"] == "BLUEPRINT_CREATED"
    blueprint = final_state["blueprint"]
    assert blueprint["reuse_summary"]["reuse"] == []
    assert blueprint["reuse_summary"]["build"] == ["REAL_TECH"]
