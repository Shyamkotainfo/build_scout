import pytest
from pydantic import ValidationError

from models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisResultResponse,
    RequirementResponse,
    ComponentResponse,
    CandidateResponse,
    EvaluationResponse,
    DecisionResponse,
    BlueprintResponse,
    BlueprintComponentResponse,
    ValidationResponse,
    AgentTraceResponse
)

def test_analysis_request_valid():
    req = AnalysisRequest(user_request="I want to build an AI document intelligence platform.")
    assert req.user_request == "I want to build an AI document intelligence platform."

def test_analysis_request_empty_rejected():
    with pytest.raises(ValidationError):
        AnalysisRequest(user_request="")
        
def test_analysis_request_whitespace_only_rejected():
    with pytest.raises(ValidationError):
        AnalysisRequest(user_request="   ")

def test_analysis_request_too_long_rejected():
    with pytest.raises(ValidationError):
        AnalysisRequest(user_request="a" * 5001)

def test_analysis_response_valid():
    res = AnalysisResponse(analysis_id="123", status="CREATED", message="Ok")
    assert res.analysis_id == "123"

def test_analysis_result_response_valid():
    res = AnalysisResultResponse(
        analysis_id="123",
        user_request="test",
        status="COMPLETED"
    )
    assert res.analysis_id == "123"
    assert res.status == "COMPLETED"
    assert res.blueprint is not None

def test_nested_requirement_serialization():
    req = RequirementResponse(id="R1", description="desc", priority="HIGH")
    assert req.model_dump()["id"] == "R1"

def test_nested_component_serialization():
    comp = ComponentResponse(id="C1", name="name", category="FE", description="desc", dependencies=["C2"])
    assert comp.model_dump()["dependencies"] == ["C2"]

def test_candidate_serialization():
    cand = CandidateResponse(component_id="C1", name="react", description="ui", license="MIT", stars=100)
    assert cand.model_dump()["name"] == "react"

def test_evaluation_serialization():
    eval_res = EvaluationResponse(
        candidate_name="react", component_id="C1", score=90, reasoning="good", concerns=[], missing_evidence=[]
    )
    assert eval_res.model_dump()["score"] == 90

def test_decision_serialization():
    dec = DecisionResponse(
        component_id="C1", decision="REUSE", selected_candidate_name="react", confidence=1.0, reason="ok", risks=[], implementation_notes=[]
    )
    assert dec.model_dump()["decision"] == "REUSE"

def test_blueprint_serialization():
    bp_comp = BlueprintComponentResponse(
        component_id="C1", component_name="UI", decision="REUSE", technology="React", responsibility="Show", integration="None"
    )
    bp = BlueprintResponse(
        solution_summary="sum",
        architecture_style="micro",
        components=[bp_comp],
        data_flow=["flow"],
        integration_points=[],
        implementation_phases=[],
        assumptions=[],
        risks=[]
    )
    assert bp.model_dump()["solution_summary"] == "sum"
    assert len(bp.model_dump()["components"]) == 1

def test_validation_serialization():
    val = ValidationResponse(overall_status="PASS", overall_score=100)
    assert val.model_dump()["overall_score"] == 100

def test_agent_trace_serialization():
    trace = AgentTraceResponse(agent_name="SupervisorAgent", status="COMPLETED", execution_order=1, tool_calls=[])
    assert trace.model_dump()["agent_name"] == "SupervisorAgent"

def test_json_serialization_works():
    res = AnalysisResultResponse(
        analysis_id="123",
        user_request="test",
        status="COMPLETED"
    )
    json_str = res.model_dump_json()
    assert '"analysis_id":"123"' in json_str

def test_existing_state_can_be_mapped():
    state = {
        "analysis_id": "uuid-123",
        "user_request": "Build me a thing",
        "normalized_request": "build a thing",
        "domain": "GENERAL",
        "status": "VALIDATED",
        "requirements": [{"id": "REQ1", "description": "do it", "priority": "HIGH"}],
        "components": [],
        "candidates": [],
        "evaluations": [],
        "decisions": [],
        "blueprint": {},
        "validation_result": {},
        "agent_history": ["SupervisorAgent"]
    }
    
    # We can pass unpacked dict directly due to alias mapping or direct match
    res = AnalysisResultResponse(**state)
    assert res.analysis_id == "uuid-123"
    assert len(res.requirements) == 1
    assert res.requirements[0].id == "REQ1"
    assert res.agent_history == ["SupervisorAgent"]
