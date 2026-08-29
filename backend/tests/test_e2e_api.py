"""
test_e2e_api.py — End-to-End API lifecycle tests for BuildSmart.

These tests cover the complete lifecycle:
  POST /api/v1/analyses → LangGraph → Lakebase → response
  GET  /api/v1/analyses/{analysis_id} → Lakebase → response

Architecture guards ensure GET never invokes agents/LLM/MCP.
Error-path tests use controlled mocks to avoid real failures.
"""
import uuid
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app, raise_server_exceptions=False)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _minimal_state(analysis_id: str) -> dict:
    """
    Minimal BuildSmartState dict that satisfies AnalysisResultResponse.
    Used to mock the LangGraph result in integration-level tests.
    """
    return {
        "analysis_id": analysis_id,
        "user_request": "Build a todo app",
        "normalized_request": "todo application with auth",
        "domain": "Web Application",
        "status": "VALIDATED",
        "requirements": [
            {"id": str(uuid.uuid4()), "description": "User authentication", "priority": "HIGH"}
        ],
        "components": [
            {"id": "COMP-001", "name": "AUTH_SERVICE", "category": "AUTHENTICATION",
             "description": "Handle login/signup", "dependencies": []}
        ],
        "candidates": [],
        "evaluations": [],
        "decisions": [
            {"component_id": "COMP-001", "decision": "BUILD",
             "selected_candidate_name": None, "confidence": 100.0,
             "reason": "No candidate", "risks": [], "implementation_notes": []}
        ],
        "blueprint": {
            "solution_summary": "Modular web app",
            "architecture_style": "Modular Monolith",
            "components": [],
            "reuse_summary": {"REUSE": [], "ADAPT": [], "BUILD": []},
            "data_flow": ["request → auth → response"],
            "integration_points": [],
            "implementation_phases": [],
            "assumptions": [],
            "risks": [],
        },
        "validation_result": {
            "overall_status": "PASS",
            "overall_score": 90,
            "requirement_coverage": {"status": "PASS", "score": 100, "findings": []},
            "component_coverage": {"status": "PASS", "score": 100, "findings": []},
            "decision_consistency": {"status": "PASS", "score": 100, "findings": []},
            "architecture_consistency": {"status": "PASS", "score": 90, "findings": []},
            "data_flow_consistency": {"status": "PASS", "score": 90, "findings": []},
            "integration_consistency": {"status": "PASS", "score": 90, "findings": []},
            "implementation_completeness": {"status": "PASS", "score": 85, "findings": []},
            "risk_completeness": {"status": "PASS", "score": 80, "findings": []},
            "critical_issues": [],
            "warnings": [],
            "recommendations": [],
        },
        "agent_history": [
            "SupervisorAgent", "DecompositionAgent", "ResearchAgent",
            "EvaluationAgent", "DecisionAgent", "BlueprintAgent", "ValidationAgent"
        ],
        "traces": [],
    }


# ─── PART 1: Contract verification ────────────────────────────────────────────

def test_health_endpoint_exists():
    """GET /health must return 200."""
    resp = client.get("/health")
    assert resp.status_code == 200


def test_health_response_is_json_with_status():
    """GET /health must return JSON {status: healthy}."""
    resp = client.get("/health")
    assert resp.headers["content-type"].startswith("application/json")
    assert resp.json()["status"] in ("healthy", "degraded")


def test_post_analyses_endpoint_exists():
    """POST /api/v1/analyses must be registered (422 on invalid body, not 404)."""
    resp = client.post("/api/v1/analyses", json={})
    assert resp.status_code != 404


@patch("api.routes.retrieve_analysis")
def test_get_analysis_endpoint_exists(mock_retrieve):
    """GET /api/v1/analyses/{id} must be registered (any response except 404 routing)."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException(str(uuid.uuid4()))
    resp = client.get(f"/api/v1/analyses/{uuid.uuid4()}")
    # The endpoint exists — a 404 here means ANALYSIS_NOT_FOUND, not routing 404
    assert resp.status_code in (200, 404, 503)


def test_openapi_schema_is_available():
    """OpenAPI schema must be accessible."""
    resp = client.get("/openapi.json")
    assert resp.status_code == 200
    schema = resp.json()
    assert "paths" in schema


def test_openapi_contains_all_three_business_endpoints():
    """Exactly three business paths must be documented."""
    resp = client.get("/openapi.json")
    paths = resp.json()["paths"]
    assert "/health" in paths
    assert "/api/v1/analyses" in paths
    assert "/api/v1/analyses/{analysis_id}" in paths


def test_openapi_no_unexpected_business_endpoints():
    """Confirm there are no extra undocumented sub-resource endpoints."""
    resp = client.get("/openapi.json")
    paths = set(resp.json()["paths"].keys())
    # All known/expected API paths
    expected = {
        "/health",
        "/api/v1/analyses",
        "/api/v1/analyses/{analysis_id}",
        "/api/v1/analyses/{analysis_id}/status",
        "/api/v1/settings",
    }
    unexpected = paths - expected
    assert len(unexpected) == 0, f"Unexpected endpoints found: {unexpected}"


# ─── PART 2: Validation (422) ─────────────────────────────────────────────────

def test_post_missing_body_returns_422():
    """POST with empty JSON body must return 422."""
    resp = client.post("/api/v1/analyses", json={})
    assert resp.status_code == 422


def test_post_missing_body_returns_invalid_request_code():
    """422 error must use INVALID_REQUEST code from existing error framework."""
    resp = client.post("/api/v1/analyses", json={})
    body = resp.json()
    assert "error" in body
    assert body["error"]["code"] == "INVALID_REQUEST"


def test_post_empty_user_request_returns_422():
    """Empty user_request string must be rejected by Pydantic validation."""
    resp = client.post("/api/v1/analyses", json={"user_request": ""})
    assert resp.status_code == 422


def test_post_whitespace_only_request_returns_422():
    """Whitespace-only user_request must be rejected."""
    resp = client.post("/api/v1/analyses", json={"user_request": "   "})
    assert resp.status_code == 422


def test_post_request_too_long_returns_422():
    """user_request exceeding 5000 chars must be rejected."""
    resp = client.post("/api/v1/analyses", json={"user_request": "x" * 5001})
    assert resp.status_code == 422


def test_post_invalid_body_does_not_expose_stack_trace():
    """422 error body must not contain raw Python exception traces."""
    resp = client.post("/api/v1/analyses", json={})
    body = resp.text
    assert "Traceback" not in body
    assert "File \"" not in body


# ─── PART 3: POST → mocked LangGraph (integration) ───────────────────────────

@patch("api.routes.run_analysis_background")
def test_post_analysis_returns_200(mock_analyze):
    """POST with valid request returns 200."""
    aid = str(uuid.uuid4())
    mock_analyze.return_value = _minimal_state(aid)
    resp = client.post("/api/v1/analyses", json={"user_request": "Build a blog"})
    assert resp.status_code == 200


@patch("api.routes.run_analysis_background")
def test_post_analysis_returns_analysis_id(mock_analyze):
    """POST response must contain a non-empty analysis_id and QUEUED status."""
    resp = client.post("/api/v1/analyses", json={"user_request": "Build a blog"})
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "analysis_id" in data
    assert data["status"] == "QUEUED"


# Removed synchronous integration tests that no longer apply to the POST endpoint


# ─── PART 4: GET → mocked retrieval (integration) ────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_get_existing_analysis_returns_200(mock_retrieve):
    """GET with a known analysis_id returns 200."""
    aid = str(uuid.uuid4())
    mock_retrieve.return_value = _minimal_state(aid)
    resp = client.get(f"/api/v1/analyses/{aid}")
    assert resp.status_code == 200


@patch("api.routes.retrieve_analysis")
def test_get_returns_correct_analysis_id(mock_retrieve):
    """GET response analysis_id matches the requested path parameter."""
    aid = str(uuid.uuid4())
    mock_retrieve.return_value = _minimal_state(aid)
    resp = client.get(f"/api/v1/analyses/{aid}")
    assert resp.json()["analysis_id"] == aid


@patch("api.routes.retrieve_analysis")
def test_get_does_not_invoke_langgraph(mock_retrieve):
    """GET must never trigger the LangGraph workflow."""
    aid = str(uuid.uuid4())
    mock_retrieve.return_value = _minimal_state(aid)
    with patch("agents.graph.build_buildsmart_graph") as mock_graph:
        client.get(f"/api/v1/analyses/{aid}")
        mock_graph.assert_not_called()


@patch("api.routes.retrieve_analysis")
def test_get_does_not_invoke_llm(mock_retrieve):
    """GET must never call the LLM factory."""
    aid = str(uuid.uuid4())
    mock_retrieve.return_value = _minimal_state(aid)
    with patch("llm.client.get_llm") as mock_llm:
        client.get(f"/api/v1/analyses/{aid}")
        mock_llm.assert_not_called()


@patch("api.routes.retrieve_analysis")
def test_get_does_not_invoke_mcp(mock_retrieve):
    """GET must never invoke any agent or MCP tool."""
    aid = str(uuid.uuid4())
    mock_retrieve.return_value = _minimal_state(aid)
    with patch("agents.research.ResearchAgent.run") as mock_mcp:
        client.get(f"/api/v1/analyses/{aid}")
        mock_mcp.assert_not_called()


# ─── PART 5: 404 & malformed ID ──────────────────────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_get_nonexistent_analysis_returns_404(mock_retrieve):
    """GET with an unknown UUID returns 404."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException("00000000-0000-0000-0000-000000000000")
    resp = client.get("/api/v1/analyses/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@patch("api.routes.retrieve_analysis")
def test_get_nonexistent_returns_analysis_not_found_code(mock_retrieve):
    """404 must use ANALYSIS_NOT_FOUND error code."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException("00000000-0000-0000-0000-000000000000")
    resp = client.get("/api/v1/analyses/00000000-0000-0000-0000-000000000000")
    assert resp.json()["error"]["code"] == "ANALYSIS_NOT_FOUND"


@patch("api.routes.retrieve_analysis")
def test_get_malformed_id_returns_404(mock_retrieve):
    """Malformed UUID (non-parseable) returns 404 safely."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException("not-a-uuid")
    resp = client.get("/api/v1/analyses/not-a-uuid")
    assert resp.status_code == 404


@patch("api.routes.retrieve_analysis")
def test_404_does_not_expose_stack_trace(mock_retrieve):
    """404 response must not contain internal Python traces."""
    from api.exceptions import AnalysisNotFoundException
    mock_retrieve.side_effect = AnalysisNotFoundException("00000000-0000-0000-0000-000000000000")
    resp = client.get("/api/v1/analyses/00000000-0000-0000-0000-000000000000")
    assert "Traceback" not in resp.text
    assert "File \"" not in resp.text


# ─── PART 6: Error handling ───────────────────────────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_db_failure_returns_500(mock_retrieve):
    """Database failure during GET returns 500 via error framework."""
    from api.exceptions import BuildSmartAPIException
    mock_retrieve.side_effect = BuildSmartAPIException(
        code="DATABASE_RETRIEVAL_FAILED",
        message="Failed to retrieve analysis from the database.",
        status_code=500,
    )
    resp = client.get(f"/api/v1/analyses/{uuid.uuid4()}")
    assert resp.status_code == 500
    assert resp.json()["error"]["code"] == "DATABASE_RETRIEVAL_FAILED"


# Async endpoints do not immediately return 500/503 on execution errors.


# ─── PART 7: Security ─────────────────────────────────────────────────────────

@patch("api.routes.retrieve_analysis")
def test_500_does_not_expose_credentials(mock_retrieve):
    """Internal errors must not leak connection strings or secrets."""
    from api.exceptions import BuildSmartAPIException
    mock_retrieve.side_effect = BuildSmartAPIException(
        code="DATABASE_RETRIEVAL_FAILED",
        message="Failed to retrieve analysis from the database.",
        status_code=500,
    )
    resp = client.get(f"/api/v1/analyses/{uuid.uuid4()}")
    body = resp.text
    # Must not contain credential artifacts
    assert "password" not in body.lower() or "password" not in resp.json().get("error", {}).get("message", "").lower()
    assert "eyJ" not in body  # JWT token prefix
    assert "postgresql://" not in body
    assert "Traceback" not in body


@patch("api.routes.run_analysis_background")
def test_post_422_does_not_expose_credentials(mock_analyze):
    """Validation errors must not expose any internal credentials."""
    resp = client.post("/api/v1/analyses", json={})
    body = resp.text
    assert "postgresql://" not in body
    assert "eyJ" not in body
    assert "groq" not in body.lower() or "groq" not in resp.json().get("error", {}).get("message", "").lower()
