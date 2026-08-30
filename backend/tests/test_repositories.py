import pytest
import uuid
from unittest.mock import MagicMock
from database.repositories import AnalysisRepository
from database.models import Analysis, Requirement, Component, Candidate, CandidateEvaluation, Decision, Blueprint, AgentRun

def test_save_analysis_success():
    repo = AnalysisRepository()
    mock_session = MagicMock()
    
    analysis_id = str(uuid.uuid4())
    req_id = str(uuid.uuid4())
    comp_id = str(uuid.uuid4())
    cand_id = str(uuid.uuid4())
    
    state = {
        "analysis_id": analysis_id,
        "user_request": "Build an AI platform",
        "requirements": [
            {"id": req_id, "name": "Req 1"}
        ],
        "components": [
            {"id": comp_id, "requirement_id": req_id, "name": "Comp 1"}
        ],
        "candidates": [
            {"id": cand_id, "component_id": comp_id, "name": "Repo 1"}
        ],
        "evaluations": [
            {"id": str(uuid.uuid4()), "candidate_id": cand_id, "overall_score": 0.9}
        ],
        "decisions": [
            {"id": str(uuid.uuid4()), "component_id": comp_id, "selected_candidate_id": cand_id, "action": "REUSE"}
        ],
        "blueprint": {
            "architecture": {}
        },
        "agent_history": ["Supervisor", "Decomposition"]
    }
    
    repo.save_analysis(mock_session, state)
    
    # Verify session.add was called multiple times
    assert mock_session.add.call_count > 0
    
    # We can inspect the arguments passed to session.add
    added_objects = [call.args[0] for call in mock_session.add.mock_calls]
    
    assert any(isinstance(obj, Analysis) and str(obj.id) == analysis_id for obj in added_objects)
    assert any(isinstance(obj, Requirement) and str(obj.id) == req_id for obj in added_objects)
    assert any(isinstance(obj, Component) and str(obj.id) == comp_id for obj in added_objects)
    assert any(isinstance(obj, Candidate) and str(obj.id) == cand_id for obj in added_objects)
    assert any(isinstance(obj, CandidateEvaluation) for obj in added_objects)
    assert any(isinstance(obj, Decision) for obj in added_objects)
    assert any(isinstance(obj, Blueprint) for obj in added_objects)
    
    # 2 agents in history -> 2 AgentRun records
    agent_runs = [obj for obj in added_objects if isinstance(obj, AgentRun)]
    assert len(agent_runs) == 2
    
def test_save_analysis_missing_id():
    repo = AnalysisRepository()
    mock_session = MagicMock()
    
    # state missing analysis_id
    state = {"user_request": "Empty"}
    
    with pytest.raises(ValueError, match="analysis_id is missing"):
        repo.save_analysis(mock_session, state)
    
    mock_session.add.assert_not_called()
    
def test_get_analysis_result_legacy_and_normal():
    repo = AnalysisRepository()
    mock_session = MagicMock()
    
    # Create mock DB objects
    analysis_id = uuid.uuid4()
    mock_analysis = Analysis(id=analysis_id, user_request="test", status="VALIDATED")
    
    comp_id = uuid.uuid4()
    mock_comp = Component(id=comp_id, canonical_name="COMP1", component_type="BACKEND")
    
    cand_id = uuid.uuid4()
    mock_cand = Candidate(id=cand_id, component_id=comp_id, name="LegacyCand")
    
    # Evaluation
    mock_eval = CandidateEvaluation(
        id=uuid.uuid4(),
        candidate_id=cand_id,
        compatibility_score=80,
        health_score=None,
        overall_score=85,
        rationale="Looks good"
    )
    # Set the relationship so e.candidate.component_id works
    mock_eval.candidate = mock_cand
    
    # Setup repo mocks
    repo.get_analysis = MagicMock(return_value=mock_analysis)
    repo.get_requirements = MagicMock(return_value=[])
    repo.get_components = MagicMock(return_value=[mock_comp])
    repo.get_candidates = MagicMock(return_value=[mock_cand])
    repo.get_evaluations = MagicMock(return_value=[mock_eval])
    repo.get_decisions = MagicMock(return_value=[])
    repo.get_blueprint = MagicMock(return_value=None)
    repo.get_agent_runs = MagicMock(return_value=[])
    repo.get_llm_calls = MagicMock(return_value=[])
    
    result = repo.get_analysis_result(mock_session, analysis_id)
    
    assert result is not None
    assert len(result["evaluations"]) == 1
    
    ev = result["evaluations"][0]
    assert ev["candidate_id"] == str(cand_id)
    assert ev["candidate_name"] == "LegacyCand"
    assert ev["component_id"] == str(comp_id)
    assert ev["overall_score"] == 85
    assert ev["compatibility_score"] == 80
    assert ev["project_health_score"] is None
    
    assert result["blueprint"] is None
