# BuildSmart — System Architecture

## 1. Overview

BuildSmart is an agentic AI backend that analyses a user's software project request and produces a structured implementation blueprint. It determines which components should be **built from scratch**, **reused from open source**, or **adapted** from existing libraries.

---

## 2. High-Level Architecture

```
Client (Frontend / curl)
         │
         ▼
    ┌─────────────┐
    │   FastAPI   │   GET /health
    │   API Layer │   POST /api/v1/analyses
    │             │   GET  /api/v1/analyses/{id}
    └──────┬──────┘
           │
    ┌──────▼──────────────┐
    │   AnalysisService   │  (WRITE path: create new analysis)
    │   RetrievalService  │  (READ path: fetch persisted analysis)
    └──────┬──────────────┘
           │ (write path only)
    ┌──────▼──────────────┐
    │     LangGraph       │  Directed agentic graph
    └──────┬──────────────┘
           │
    ┌──────▼──────────────────────────────────────┐
    │              Agent Pipeline                 │
    │                                             │
    │  SupervisorAgent                            │
    │       │                                     │
    │  DecompositionAgent                         │
    │       │                                     │
    │  ResearchAgent ←── MCP [FUTURE / PLANNED]  │
    │       │                                     │
    │  EvaluationAgent                            │
    │       │                                     │
    │  DecisionAgent                              │
    │       │                                     │
    │  BlueprintAgent                             │
    │       │                                     │
    │  ValidationAgent                            │
    └──────┬──────────────────────────────────────┘
           │
    ┌──────▼──────────────┐
    │  AnalysisRepository │  SQLAlchemy ORM
    └──────┬──────────────┘
           │
    ┌──────▼──────────────┐
    │ Databricks Lakebase │  PostgreSQL-compatible
    └─────────────────────┘
```

---

## 3. Layer Descriptions

### 3.1 API Layer (`backend/api/`)

- **Framework**: FastAPI
- **Endpoints**: 3 business endpoints (see [api.md](api.md))
- **Error handling**: `BuildSmartAPIException` hierarchy → structured `ErrorResponse`
- **Documentation**: Auto-generated Swagger at `/docs` and OpenAPI at `/openapi.json`

### 3.2 Services Layer (`backend/services/`)

| Service | Responsibility |
|---|---|
| `analysis_service.py` | WRITE path — runs LangGraph, persists result |
| `retrieval_service.py` | READ path — fetches persisted analysis from Lakebase |

The two services are strictly separated. `retrieval_service.py` **never** invokes LangGraph, agents, the LLM, or MCP.

### 3.3 LangGraph (`backend/agents/graph.py`)

The agent workflow is implemented as a LangGraph directed acyclic graph. It runs only on the **write path** (POST). The graph is compiled once and invoked per request.

### 3.4 Agent Layer (`backend/agents/`)

Seven agents implement the analysis pipeline. Each agent reads from and writes to `BuildSmartState`. See [agent_workflow.md](agent_workflow.md) for full details.

### 3.5 LLM Layer (`backend/llm/`)

- **Provider**: Groq (via `langchain-groq`)
- **Access**: `llm/client.py` → `get_llm()` returns a `ChatGroq` instance
- **Usage**: Called by individual agents to invoke the LLM for decomposition, evaluation, decision-making, and blueprint generation

### 3.6 MCP Layer — FUTURE / PLANNED

> ⚠️ **MCP is NOT currently implemented.**

MCP (Model Context Protocol) tools are planned to give the `ResearchAgent` access to GitHub search, web search, and package registry APIs. Currently, `ResearchAgent` runs without external tool calls, producing empty `candidates` lists.

### 3.7 Persistence Layer (`backend/database/`)

- **ORM**: SQLAlchemy (synchronous)
- **Database**: Databricks Lakebase (PostgreSQL-compatible)
- **Connection**: `database/connection.py` → `get_session()` generator
- **Repository**: `database/repositories.py` → `AnalysisRepository` (read + write methods)
- **Schema**: See [database.md](database.md)

### 3.8 Configuration (`backend/config/settings.py`)

Pydantic `BaseSettings` with `env_file=".env"`. All field names are lowercase on the model (e.g., `settings.lakebase_host`), though environment variables use uppercase (e.g., `LAKEBASE_HOST`).

---

## 4. Data Flow

### Write Path (POST /api/v1/analyses)

```
Client POST
    → FastAPI validates AnalysisRequest
    → AnalysisService.analyze()
    → create_initial_state(user_request)
    → graph.invoke(state)
    → [7 agents execute in sequence]
    → AnalysisRepository.save_analysis(session, final_state)
    → session.commit() [atomic transaction]
    → map state → AnalysisResultResponse
    → JSON response to client
```

### Read Path (GET /api/v1/analyses/{id})

```
Client GET
    → FastAPI validates path param
    → retrieval_service.retrieve_analysis(analysis_id)
    → parse UUID, check DB configured
    → AnalysisRepository.get_analysis_result(session, uuid)
    → aggregate queries: analysis + requirements + components
      + candidates + evaluations + decisions + blueprint + agent_runs
    → map → AnalysisResultResponse dict
    → JSON response to client
```

---

## 5. Current vs Planned

| Feature | Status |
|---|---|
| FastAPI API layer | ✅ CURRENT |
| LangGraph agent pipeline | ✅ CURRENT |
| Groq LLM integration | ✅ CURRENT |
| Databricks Lakebase persistence | ✅ CURRENT |
| GET retrieval from Lakebase | ✅ CURRENT |
| MCP GitHub/Web search tools | ⏳ PLANNED |
| Frontend UI | ⏳ PLANNED |
| Human-in-the-loop review | ⏳ PLANNED |
| Deployment / containerization | ⏳ PLANNED |
| Additional retrieval endpoints (list, filter) | ⏳ PLANNED |
