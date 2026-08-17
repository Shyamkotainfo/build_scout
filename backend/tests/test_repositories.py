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
