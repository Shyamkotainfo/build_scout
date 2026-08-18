"""
test_retrieval_api.py — Tests for GET /api/v1/analyses/{analysis_id}

These tests verify:
- Retrieval from Lakebase by analysis_id
- 404 for unknown IDs
- No LangGraph / LLM / MCP invocation during retrieval
- Empty candidates/evaluations are handled correctly
- Database failures are mapped to 500 errors
"""
import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


def _make_client():
    from api.main import app
    return TestClient(app, raise_server_exceptions=False)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

VALID_UUID = "1ffd8437-1dc0-4927-a31c-c3d3872489bc"
NONEXISTENT_UUID = "00000000-0000-0000-0000-000000000000"
MALFORMED_UUID = "not-a-uuid"


def _mock_result(analysis_id: str = VALID_UUID) -> dict:
    """Minimal valid dict that maps to AnalysisResultResponse."""
    return {
        "analysis_id": analysis_id,
        "user_request": "Build an AI document intelligence platform",
        "normalized_request": "AI document intelligence platform",
        "domain": "document_intelligence",
        "status": "VALIDATED",
        "requirements": [
            {"id": str(uuid.uuid4()), "description": "PDF ingestion", "priority": "HIGH"}
        ],
        "components": [
            {"id": str(uuid.uuid4()), "name": "PDF_INGESTION", "category": "DATA_INGESTION",
             "description": "Ingest PDFs", "dependencies": []}
        ],
        "candidates": [],        # MCP offline – legitimately empty
        "evaluations": [],       # MCP offline – legitimately empty
        "decisions": [
            {"component_id": str(uuid.uuid4()), "decision": "BUILD",
             "selected_candidate_name": None, "confidence": 100.0,
             "reason": "No candidate available", "risks": [], "implementation_notes": []}
        ],
        "blueprint": {
            "solution_summary": "Modular Python platform",
            "architecture_style": "Modular Monolith",
            "components": [],
            "reuse_summary": {"REUSE": [], "ADAPT": [], "BUILD": []},
            "data_flow": ["upload -> extract -> embed -> search"],
            "integration_points": [],
            "implementation_phases": [],
            "assumptions": [],
            "risks": [],
        },
        "validation_result": None,
        "agent_history": [
            "SupervisorAgent", "DecompositionAgent", "ResearchAgent",
            "EvaluationAgent", "DecisionAgent", "BlueprintAgent", "ValidationAgent"
        ],
        "traces": [],
    }


# ─── Happy-path tests (mocked retrieval_service) ──────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_200(mock_retrieve):
    """Existing analysis returns HTTP 200."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    assert resp.status_code == 200


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_correct_analysis_id(mock_retrieve):
    """Returned analysis_id matches the path parameter."""
    mock_retrieve.return_value = _mock_result(VALID_UUID)
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    assert resp.json()["analysis_id"] == VALID_UUID


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_user_request(mock_retrieve):
    """user_request is present in the response."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    assert "user_request" in resp.json()
    assert resp.json()["user_request"] != ""


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_requirements(mock_retrieve):
    """requirements list is returned (non-empty for a real analysis)."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "requirements" in data
    assert isinstance(data["requirements"], list)
    assert len(data["requirements"]) >= 1


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_components(mock_retrieve):
    """components list is present."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "components" in data
    assert isinstance(data["components"], list)
    assert len(data["components"]) >= 1


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_candidates(mock_retrieve):
    """candidates list is present (can be empty when MCP is offline)."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "candidates" in data
    assert isinstance(data["candidates"], list)


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_evaluations(mock_retrieve):
    """evaluations list is present (can be empty when MCP is offline)."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "evaluations" in data
    assert isinstance(data["evaluations"], list)


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_decisions(mock_retrieve):
    """decisions list is returned."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "decisions" in data
    assert isinstance(data["decisions"], list)


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_blueprint(mock_retrieve):
    """blueprint is present and non-null."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "blueprint" in data
    assert data["blueprint"] is not None


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_validation_result(mock_retrieve):
    """validation_result key is present in the response."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "validation_result" in data


@patch("api.routes.retrieve_analysis")
def test_get_analysis_returns_agent_history(mock_retrieve):
    """agent_history is returned with correct agent names."""
    mock_retrieve.return_value = _mock_result()
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    data = resp.json()
    assert "agent_history" in data
    assert "SupervisorAgent" in data["agent_history"]
    assert "BlueprintAgent" in data["agent_history"]


@patch("api.routes.retrieve_analysis")
def test_get_analysis_empty_candidates_is_valid(mock_retrieve):
    """Empty candidates and evaluations (MCP offline) must be accepted, not errored."""
    result = _mock_result()
    result["candidates"] = []
    result["evaluations"] = []
    mock_retrieve.return_value = result
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    assert resp.status_code == 200
    assert resp.json()["candidates"] == []
    assert resp.json()["evaluations"] == []


# ─── Error cases ───────────────────────────────────────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_get_analysis_not_found_returns_404(mock_retrieve):
    """Unknown analysis_id returns 404."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException(NONEXISTENT_UUID)
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{NONEXISTENT_UUID}")
    assert resp.status_code == 404
    body = resp.json()
    assert body["error"]["code"] == "ANALYSIS_NOT_FOUND"


@patch("api.routes.retrieve_analysis")
def test_get_analysis_malformed_uuid_returns_404(mock_retrieve):
    """Malformed UUID path is treated as not found."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException(MALFORMED_UUID)
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{MALFORMED_UUID}")
    assert resp.status_code == 404


@patch("api.routes.retrieve_analysis")
def test_get_analysis_db_failure_returns_500(mock_retrieve):
    """A database retrieval failure returns 500 via the error framework."""
    from api.exceptions import BuildSmartAPIException
    mock_retrieve.side_effect = BuildSmartAPIException(
        code="DATABASE_RETRIEVAL_FAILED",
        message="Failed to retrieve analysis from the database.",
        status_code=500,
        analysis_id=VALID_UUID,
    )
    client = _make_client()
    resp = client.get(f"/api/v1/analyses/{VALID_UUID}")
    assert resp.status_code == 500
    body = resp.json()
    assert body["error"]["code"] == "DATABASE_RETRIEVAL_FAILED"


# ─── Architecture guard tests ──────────────────────────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_retrieval_does_not_invoke_langgraph(mock_retrieve):
    """Retrieval endpoint must not call build_buildsmart_graph."""
    mock_retrieve.return_value = _mock_result()
    with patch("agents.graph.build_buildsmart_graph") as mock_graph:
        client = _make_client()
        client.get(f"/api/v1/analyses/{VALID_UUID}")
        mock_graph.assert_not_called()


@patch("api.routes.retrieve_analysis")
def test_retrieval_does_not_invoke_llm(mock_retrieve):
    """Retrieval endpoint must not call the LLM factory."""
    mock_retrieve.return_value = _mock_result()
    with patch("llm.client.get_llm") as mock_llm:
        client = _make_client()
        client.get(f"/api/v1/analyses/{VALID_UUID}")
        mock_llm.assert_not_called()


@patch("api.routes.retrieve_analysis")
def test_retrieval_does_not_invoke_mcp(mock_retrieve):
    """Retrieval endpoint must not invoke MCP tools."""
    mock_retrieve.return_value = _mock_result()
    with patch("agents.research.ResearchAgent.run") as mock_mcp:
        client = _make_client()
        client.get(f"/api/v1/analyses/{VALID_UUID}")
        mock_mcp.assert_not_called()
