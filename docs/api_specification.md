# BuildSmart — API Specification

## 1. API Principles

BuildSmart exposes a small REST API for the MVP.

Base URL:

```text
/api/v1
```

Principles:

- FastAPI.
- JSON request/response.
- UUID identifiers.
- Asynchronous analysis execution.
- No long-running agent workflow inside the HTTP request.
- Structured error responses.
- Analysis status is observable by the frontend.
- Agent/tool trace is exposed as read-only data.

---

## 2. API Flow

```text
POST /analyses
      ↓
analysis_id
      ↓
background agent workflow
      ↓
GET /analyses/{id}
      ↓
GET /analyses/{id}/trace
      ↓
GET /analyses/{id}/components
      ↓
GET /analyses/{id}/candidates
      ↓
GET /analyses/{id}/decisions
      ↓
GET /analyses/{id}/blueprint
```

---

## 3. Create Analysis

### `POST /api/v1/analyses`

Request:

```json
{
  "idea": "I want to build an AI document intelligence platform that accepts PDFs, extracts text, creates embeddings, performs semantic search and exposes an API."
}
```

Response:

```json
{
  "analysis_id": "2e6f0b15-4f3c-4e19-a4c4-1f6c1f4e3b22",
  "status": "CREATED",
  "message": "Analysis accepted"
}
```

HTTP:

```text
202 Accepted
```

---

## 4. Get Analysis

### `GET /api/v1/analyses/{analysis_id}`

Response:

```json
{
  "analysis_id": "2e6f0b15-4f3c-4e19-a4c4-1f6c1f4e3b22",
  "status": "EVALUATING",
  "user_request": "Build an AI document intelligence platform",
  "domain": "document_intelligence",
  "progress": 65,
  "reuse_confidence": null,
  "created_at": "2026-08-15T10:00:00Z",
  "updated_at": "2026-08-15T10:01:30Z"
}
```

---

## 5. Run / Retry Analysis

### `POST /api/v1/analyses/{analysis_id}/run`

Use this to start or retry an analysis.

Response:

```json
{
  "analysis_id": "2e6f0b15-4f3c-4e19-a4c4-1f6c1f4e3b22",
  "status": "DECOMPOSING"
}
```

HTTP:

```text
202 Accepted
```

---

## 6. Get Components

### `GET /api/v1/analyses/{analysis_id}/components`

Response:

```json
{
  "analysis_id": "2e6f0b15-4f3c-4e19-a4c4-1f6c1f4e3b22",
  "components": [
    {
      "id": "component-1",
      "name": "DOCUMENT_PARSING",
      "type": "document_processing",
      "description": "Extract text and structure from PDF documents",
      "required": true
    },
    {
      "id": "component-2",
      "name": "VECTOR_DATABASE",
      "type": "database",
      "description": "Store and retrieve vector embeddings",
      "required": true
    }
  ]
}
```

---

## 7. Get Candidates

### `GET /api/v1/analyses/{analysis_id}/candidates`

Optional query parameters:

```text
component_id
decision
limit
```

Example:

```text
GET /api/v1/analyses/{id}/candidates?component_id=component-1&limit=5
```

Response:

```json
{
  "component_id": "component-1",
  "candidates": [
    {
      "id": "candidate-1",
      "name": "PyMuPDF",
      "source": "GitHub",
      "url": "https://github.com/pymupdf/PyMuPDF",
      "license": "AGPL-3.0 / commercial licensing",
      "overall_score": 91,
      "decision": "REUSE",
      "confidence": 0.94
    }
  ]
}
```

Note: license values must be populated from live evidence; the API example is illustrative.

---

## 8. Get Candidate Details

### `GET /api/v1/candidates/{candidate_id}`

Response:

```json
{
  "id": "candidate-1",
  "name": "Candidate Name",
  "description": "Candidate description",
  "url": "https://example.com",
  "repository_url": "https://github.com/example/project",
  "language": "Python",
  "metadata": {
    "stars": 1000,
    "forks": 100
  },
  "evaluation": {
    "compatibility": 90,
    "health": 85,
    "security": 88,
    "license": 95,
    "adoption": 80,
    "maintenance": 90,
    "overall": 88
  },
  "evidence": []
}
```

---

## 9. Get Decisions

### `GET /api/v1/analyses/{analysis_id}/decisions`

Response:

```json
{
  "decisions": [
    {
      "component": "DOCUMENT_PARSING",
      "decision": "REUSE",
      "candidate": "Candidate Name",
      "confidence": 0.92,
      "risk": "LOW",
      "rationale": "Strong technical fit and acceptable evidence."
    },
    {
      "component": "DOMAIN_CLASSIFICATION",
      "decision": "BUILD",
      "candidate": null,
      "confidence": 0.88,
      "risk": "MEDIUM",
      "rationale": "No suitable generic implementation found."
    }
  ]
}
```

---

## 10. Get Blueprint

### `GET /api/v1/analyses/{analysis_id}/blueprint`

Response:

```json
{
  "analysis_id": "analysis-1",
  "architecture": {
    "nodes": [],
    "edges": []
  },
  "component_mapping": [],
  "technology_stack": [],
  "integration_flow": [],
  "data_flow": [],
  "api_interfaces": [],
  "implementation_phases": [],
  "effort": {
    "from_scratch_days": 40,
    "with_reuse_days": 22,
    "estimated_savings_percent": 45
  }
}
```

---

## 11. Agent Trace

### `GET /api/v1/analyses/{analysis_id}/trace`

Response:

```json
{
  "analysis_id": "analysis-1",
  "runs": [
    {
      "agent": "SupervisorAgent",
      "status": "COMPLETED",
      "started_at": "...",
      "completed_at": "...",
      "tool_calls": 0
    },
    {
      "agent": "ResearchAgent",
      "status": "COMPLETED",
      "started_at": "...",
      "completed_at": "...",
      "tool_calls": 8
    }
  ]
}
```

The frontend uses this endpoint for the agent trace screen.

---

## 12. Evidence

### `GET /api/v1/analyses/{analysis_id}/evidence`

Optional:

```text
component_id
candidate_id
evidence_type
```

Response:

```json
{
  "evidence": [
    {
      "candidate": "Candidate Name",
      "type": "license",
      "source_url": "https://example.com/source",
      "claim": "License information",
      "evidence": "Source-backed evidence text",
      "retrieved_at": "2026-08-15T10:00:00Z",
      "confidence": 0.98
    }
  ]
}
```

---

## 13. Health Check

### `GET /health`

Response:

```json
{
  "status": "ok",
  "service": "buildsmart-api"
}
```

---

## 14. Error Contract

All errors should follow:

```json
{
  "error": {
    "code": "ANALYSIS_NOT_FOUND",
    "message": "Analysis was not found",
    "request_id": "req-123"
  }
}
```

Recommended error codes:

```text
INVALID_REQUEST
ANALYSIS_NOT_FOUND
ANALYSIS_ALREADY_RUNNING
AGENT_EXECUTION_FAILED
TOOL_EXECUTION_FAILED
EXTERNAL_SOURCE_UNAVAILABLE
VALIDATION_FAILED
BLUEPRINT_NOT_AVAILABLE
INTERNAL_ERROR
```

---

## 15. API Security for MVP

- API keys/secrets are server-side only.
- External MCP credentials are never returned to the frontend.
- Tool arguments must be sanitized before trace persistence.
- Internal/confidential sources are disabled in V1.
- Frontend only consumes BuildSmart APIs.

---

## 16. API-to-Agent Mapping

| Endpoint | Main Owner |
|---|---|
| `POST /analyses` | Supervisor / Analysis Service |
| `POST /analyses/{id}/run` | Supervisor |
| `GET /analyses/{id}` | Backend |
| `GET /components` | Decomposition Agent output |
| `GET /candidates` | Research Agent output |
| `GET /evidence` | Evaluation Agent output |
| `GET /decisions` | Decision Agent output |
| `GET /blueprint` | Blueprint Agent output |
| `GET /trace` | Agent runtime |
