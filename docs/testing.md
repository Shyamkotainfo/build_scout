# BuildSmart — Testing Guide

> Tests are located in `backend/tests/`.
> Run from within the `backend/` directory with the virtual environment active.

---

## 1. Running Tests

```bash
cd backend
source .venv/bin/activate
pytest -v
```

**Current test count: 136 passing** (as of Step 11.8).

---

## 2. Test Organization

| File | Type | Focus |
|---|---|---|
| `test_llm.py` | Unit | Groq LLM connectivity |
| `test_state.py` | Unit | `BuildSmartState` initialization |
| `test_supervisor.py` | Integration | `SupervisorAgent` behaviour |
| `test_decomposition.py` | Integration | `DecompositionAgent` behaviour |
| `test_research.py` | Integration | `ResearchAgent` behaviour |
| `test_evaluation.py` | Integration | `EvaluationAgent` behaviour |
| `test_decision.py` | Integration | `DecisionAgent` behaviour |
| `test_blueprint.py` | Integration | `BlueprintAgent` behaviour |
| `test_validation.py` | Integration | `ValidationAgent` behaviour |
| `test_graph.py` | Integration | Full LangGraph graph execution |
| `test_mcp.py` | Unit | MCP client initialization |
| `test_schemas.py` | Unit | Pydantic schema validation |
| `test_api.py` | Unit | FastAPI app basics + /health |
| `test_error_handling.py` | Unit | Exception handler coverage |
| `test_database.py` | Unit | DB connection + config |
| `test_repositories.py` | Unit | `AnalysisRepository` (mocked DB) |
| `test_retrieval_api.py` | Unit/Integration | `GET /api/v1/analyses/{id}` endpoint |
| `test_e2e_api.py` | E2E | Full API lifecycle — POST + GET |

---

## 3. Key Test Scenarios

### 3.1 POST → LangGraph → Lakebase → Response (mocked)

```python
@patch("services.analysis_service.analyze")
def test_post_analysis_returns_200(mock_analyze):
    mock_analyze.return_value = minimal_state(aid)
    resp = client.post("/api/v1/analyses", json={"user_request": "..."})
    assert resp.status_code == 200
```

### 3.2 GET retrieval from Lakebase (mocked)

```python
@patch("api.routes.retrieve_analysis")
def test_get_existing_analysis_returns_200(mock_retrieve):
    mock_retrieve.return_value = minimal_state(aid)
    resp = client.get(f"/api/v1/analyses/{aid}")
    assert resp.status_code == 200
```

### 3.3 Architecture guard — GET must not invoke LangGraph

```python
def test_get_does_not_invoke_langgraph(mock_retrieve):
    with patch("agents.graph.build_buildsmart_graph") as mock_graph:
        client.get(f"/api/v1/analyses/{aid}")
        mock_graph.assert_not_called()
```

### 3.4 404 — unknown analysis_id

```python
def test_get_nonexistent_analysis_returns_404(mock_retrieve):
    mock_retrieve.side_effect = AnalysisNotFoundException("00000000-...")
    resp = client.get("/api/v1/analyses/00000000-...")
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "ANALYSIS_NOT_FOUND"
```

### 3.5 422 — invalid request body

```python
def test_post_missing_body_returns_422():
    resp = client.post("/api/v1/analyses", json={})
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "INVALID_REQUEST"
```

### 3.6 503 — LLM unavailable

```python
@patch("services.analysis_service.analyze")
def test_llm_failure_returns_503(mock_analyze):
    mock_analyze.side_effect = LLMServiceException()
    resp = client.post("/api/v1/analyses", json={"user_request": "..."})
    assert resp.status_code == 503
```

---

## 4. Expected HTTP Responses

| Scenario | HTTP Code | Error Code |
|---|---|---|
| Valid POST | 200 | — |
| Valid GET | 200 | — |
| GET /health | 200 | — |
| Missing `user_request` | 422 | `INVALID_REQUEST` |
| Empty `user_request` | 422 | `INVALID_REQUEST` |
| Unknown `analysis_id` | 404 | `ANALYSIS_NOT_FOUND` |
| LLM unavailable | 503 | `LLM_SERVICE_UNAVAILABLE` |
| MCP unavailable | 503 | `MCP_SERVICE_UNAVAILABLE` |
| LangGraph crash | 500 | `ANALYSIS_EXECUTION_FAILED` |
| DB retrieval crash | 500 | `DATABASE_RETRIEVAL_FAILED` |
| DB not configured | 503 | `DATABASE_NOT_CONFIGURED` |
| Unexpected error | 500 | `INTERNAL_ERROR` |

---

## 5. Real E2E Verification (Manual)

Start the server:
```bash
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

**Test 1 — Health**:
```bash
curl http://127.0.0.1:8000/health
# → 200 {"status": "healthy"}
```

**Test 2 — Create analysis**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{"user_request": "I want to build a blog with auth and REST API"}'
# → 200, captures analysis_id
```

**Test 3 — Retrieve from Lakebase**:
```bash
curl "http://127.0.0.1:8000/api/v1/analyses/<analysis_id>"
# → 200, same data from DB (no LangGraph invoked)
```

**Test 4 — Not found**:
```bash
curl "http://127.0.0.1:8000/api/v1/analyses/00000000-0000-0000-0000-000000000000"
# → 404 {"error": {"code": "ANALYSIS_NOT_FOUND", ...}}
```

**Test 5 — Invalid request**:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{}'
# → 422 {"error": {"code": "INVALID_REQUEST", ...}}
```

---

## 6. Security Assertions

All tests verify that:
- No `Traceback` or `File "` strings appear in error responses
- No `postgresql://` connection strings appear in responses
- No `eyJ` (JWT token prefix) appears in responses
- No `groq` API key appears in responses

---

## 7. Current MCP Status in Tests

MCP is **NOT implemented**. Tests that verify `candidates = []` and `evaluations = []` are correct and intentional — these are valid empty states, not failures.

---

## 8. Configuration for Tests

Tests that create `Settings` directly use `_env_file=None` to prevent the `.env` file from leaking real credentials into unit test assertions.

Example:
```python
settings = Settings(groq_api_key="test", lakebase_host=None, _env_file=None)
```
