# BuildSmart

**BuildSmart** is an agentic AI backend that analyses a software project request and produces a structured implementation plan — deciding which components to **Build from scratch**, **Reuse** from open source, or **Adapt** from existing libraries.

---

## What BuildSmart Does

1. Accepts a plain-English description of a software project
2. Decomposes it into requirements and technical components
3. Searches for reusable candidates *(MCP — future)*
4. Evaluates and scores each candidate *(MCP — future)*
5. Makes Build / Reuse / Adapt decisions per component
6. Generates a full implementation blueprint
7. Validates the blueprint for consistency
8. Persists the entire analysis to Databricks Lakebase
9. Exposes the result via a REST API

---

## Current Agent Workflow

```
SupervisorAgent
    ↓
DecompositionAgent
    ↓
ResearchAgent          ← MCP (not yet active)
    ↓
EvaluationAgent
    ↓
DecisionAgent
    ↓
BlueprintAgent
    ↓
ValidationAgent
    ↓
Lakebase Persistence
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/v1/analyses` | Run full analysis workflow |
| `GET` | `/api/v1/analyses/{analysis_id}` | Retrieve persisted analysis from Lakebase |

> **GET retrieval reads ONLY from Lakebase. It does NOT re-run the agents.**

---

## Databricks Lakebase Persistence

All analysis data is stored in **Databricks Lakebase** (PostgreSQL-compatible) via SQLAlchemy. Persisted entities:

- `analysis` — root record
- `requirement` — decomposed requirements
- `component` — technical components
- `candidate` — reusable candidates *(empty until MCP is active)*
- `candidate_evaluation` — evaluation scores
- `decision` — Build/Reuse/Adapt decisions
- `blueprint` — JSONB architecture plan
- `agent_run` — execution trace

---

## Running the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Groq API key and Lakebase credentials

# Start the server
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

---

## Running Tests

```bash
cd backend
source .venv/bin/activate
pytest -v
```

**Current test count**: 136+ passing tests.

---

## Swagger / API Documentation

Once the server is running:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc
- **OpenAPI JSON**: http://127.0.0.1:8000/openapi.json

---

## MCP Status

> ⚠️ **MCP is NOT currently implemented.**

`ResearchAgent` currently produces `candidates = []`. GitHub search, web search, and package registry tools are planned for a future step.

---

## Documentation

Detailed docs are in [`docs/`](docs/):

| File | Contents |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System architecture and layer descriptions |
| [`docs/api.md`](docs/api.md) | Full API reference with examples |
| [`docs/database.md`](docs/database.md) | Lakebase schema and persistence behavior |
| [`docs/agent_workflow.md`](docs/agent_workflow.md) | Agent pipeline and LangGraph topology |
| [`docs/testing.md`](docs/testing.md) | Testing strategy and key scenarios |
| [`docs/data_model.md`](docs/data_model.md) | Logical data model (ER diagram) |
| [`docs/api_specification.md`](docs/api_specification.md) | Original API specification |
| [`docs/agent_specification.md`](docs/agent_specification.md) | Original agent specification |
