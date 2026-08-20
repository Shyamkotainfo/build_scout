# BuildSmart Frontend Project Memory

## 1. Purpose

Build a production-quality developer dashboard for the BuildSmart hackathon demo.

The frontend is a separate application from the existing BuildSmart backend and must consume the existing FastAPI APIs without changing backend behavior unless an explicit integration task requires it.

Primary goal:

> Provide a clear developer-centric UI that demonstrates BuildSmart's Solution Discovery / Solution Reuse workflow, agent execution, MCP/tool usage, LLM observability, documentation, and V2 roadmap.

Visual direction: **Developer Dashboard reference #1** selected by the user.

---

## 2. Existing Backend Contract

The current backend exposes these business endpoints:

- `GET /health`
- `POST /api/v1/analyses`
- `GET /api/v1/analyses/{analysis_id}`

FastAPI also provides `/docs`, `/redoc`, and `/openapi.json`.

The POST endpoint starts the BuildSmart analysis workflow and returns `AnalysisResultResponse`.
The GET endpoint retrieves a persisted analysis from Lakebase and does NOT execute LangGraph, agents, LLM, or MCP.

The current response contains:

- analysis_id
- user_request
- normalized_request
- domain
- requirements
- components
- candidates
- evaluations
- decisions
- blueprint
- validation_result
- agent_history
- traces
- llm_metrics

The backend schema also supports flexible candidate `metadata`.

---

## 3. BuildSmart V1 Capabilities to Represent in UI

### Agent workflow

```text
Supervisor
    ↓
Decomposition
    ↓
Research
    ↓
Evaluation
    ↓
Decision
    ↓
Blueprint
    ↓
Validation
```

### Decision outcomes

- REUSE
- ADAPT
- BUILD

### Unified Tool Gateway capabilities

- github.search
- web.search
- security.get
- license.get
- aws.documentation
- cloud.architecture

Current external MCP-backed capabilities:

- GitHub MCP
- Tavily Web Search MCP

Current local implementations/fallbacks:

- Security
- License
- Documentation / AWS documentation
- Cloud architecture
- Local fallback for GitHub/Web search

Do not falsely represent local tools as external MCP servers.

---

## 4. LLM Observability UI

The backend already tracks:

- total_calls
- successful_calls
- failed_calls
- total_retries
- total_input_tokens
- total_output_tokens
- total_tokens
- total_latency_ms
- average_latency_ms
- context_compactions
- total_cost

The UI should provide a clear observability section.

Do not expose:

- API keys
- passwords
- OAuth tokens
- raw secrets
- full raw prompts

---

## 5. Documentation UI

The frontend must include a Documentation area capable of rendering Markdown documentation.

The UI should support documentation such as:

- project memory
- MCP documentation
- LLM observability
- skills.md
- prompt optimizer documentation
- V2 specification
- architecture documentation
- roadmap

Documentation should be rendered from Markdown sources rather than manually duplicating large documents inside UI components.

---

## 6. V2 / Upcoming UI

The following are planned, not currently implemented:

- BuildScout / BuildSmart MCP Server
- Skills architecture
- Memory / semantic context retrieval
- Human Feedback
- Feedback-driven prompt optimization
- Prompt versioning / A-B testing
- GEPA / DSPy experimentation
- Requirement clarification
- Skill Planner

These must be visually marked as:

**Upcoming / Planned / V2**

Do not make them appear implemented.

---

## 7. Prompt Optimizer

V1 currently contains a lightweight Prompt Optimizer before the LangGraph workflow.

Current behavior:

```text
User Request
    ↓
Deterministic preprocessing
    ↓
Optional LLM normalization
    ↓
BuildSmartState.normalized_request
    ↓
LangGraph
```

The original user request must remain unchanged.

The optimizer must not invent requirements, technologies, or constraints.

V2 may add:

- memory-augmented optimization
- human-feedback signals
- prompt versioning
- A/B testing
- GEPA / DSPy
- prompt quality scoring
- requirement clarification

---

## 8. Frontend Environment Configuration

Create a separate frontend `.env` and `.env.example`.

At minimum:

```env
BACKEND_URL=http://127.0.0.1:8000
```

### Important Settings Requirement

The UI must contain a **Settings** page.

Configuration changes made through Settings must persist back to the application's `.env` configuration.

Do NOT implement this by allowing arbitrary client-side filesystem writes.

Instead use a controlled backend settings-management mechanism:

```text
Settings UI
    ↓
Settings API
    ↓
Allowlisted configuration keys
    ↓
.env update
    ↓
Backend configuration reload/restart requirement where applicable
```

Only explicitly supported configuration keys may be modified.

Secrets must be masked in the UI.

Never display secret values after save.

Never log secret values.

If a new supported environment variable is introduced, it must be:

1. added to the configuration schema,
2. added to `.env.example`,
3. exposed in the Settings UI,
4. persisted to `.env`,
5. reflected in the settings documentation.

The system must distinguish between:
- frontend-only variables
- backend configuration variables
- secrets
- non-secret operational settings

Do not silently modify arbitrary environment variables.

---

## 9. Suggested UI Navigation

```text
BuildSmart
│
├── Dashboard
├── New Analysis
├── Analyses
│
├── Research
│   ├── Candidates
│   ├── Evaluations
│   └── Decisions
│
├── Architecture
├── Agent Trace
├── MCP & Tools
├── LLM Metrics
│
├── Documentation
│   ├── Project Memory
│   ├── Skills
│   ├── MCP
│   ├── LLM Observability
│   ├── Prompt Optimizer
│   └── V2 Specification
│
├── Roadmap / Upcoming
│
└── Settings
```

---

## 10. Visual Design

Use the selected Developer Dashboard reference as the primary inspiration.

Desired characteristics:

- dark developer dashboard
- deep navy/charcoal base
- blue primary accent
- clean cards
- compact sidebar
- strong hierarchy
- readable technical data
- restrained animations
- professional hackathon-demo appearance
- avoid generic chatbot styling

---

## 11. Implementation Principles

1. Do not modify backend business logic unnecessarily.
2. Reuse existing API contracts.
3. Centralize API calls in frontend services.
4. Use typed models for API responses.
5. Handle loading, error, empty, and degraded states.
6. Never use fake data when real backend data is available.
7. Clearly label unavailable/external-dependency states.
8. Never expose secrets.
9. Keep frontend configuration separate from backend configuration.
10. Do not implement V2 functionality as if it were already available.
11. Maintain a clean component architecture.
12. Every major task must be testable independently.

---

## 12. Recommended Frontend Task Breakdown

### Task 1
Frontend foundation, project structure, environment configuration, API client.

### Task 2
Developer dashboard shell, sidebar, navigation, theme.

### Task 3
- [x] Task 3: Analysis Execution & Result Page (Completed)
- [x] Task 4: Research, Evaluation & Decision Explorer (Completed)
- [x] Task 5: Architecture Blueprint + Agent Execution Trace (Completed)
- [x] Task 6: MCP & LLM Observability Console (Completed)

### Task 7
Markdown Documentation and V2/Upcoming Roadmap.

### Task 8
Settings UI and controlled `.env` configuration management.

### Task 9
Final integration, error handling, responsive behavior, polish and tests.

---

## 13. Current Frontend Position

Status:

**TASK 6 COMPLETED** (MCP & LLM Observability Console)

Completed items:
- Implemented `/architecture/:analysisId` providing a comprehensive, visual blueprint of the backend's generated design.
- Built `ArchitectureDiagram.jsx` dynamically generating sequential system data flows without hardcoding.
- Connected component architectures seamlessly with REUSE/ADAPT/BUILD styles and mapping their underlying technological rationales.
- Rendered flexible, arbitrary fields gracefully inside `IntegrationPoints.jsx` dynamically iterating object keys.
- Implemented `/traces/:analysisId` as a robust observability interface.
- Accurately calculated successful vs failed agent statuses within `TraceSummary.jsx`, providing token metrics and total MCP usage counts cleanly.
- Styled `AgentTimeline.jsx` mapping execution order with visual ticks and icons for FAILED vs COMPLETED runs.

### 7. MCP Console (`/mcp/:analysisId`)
- Visualizes the internal Tool Registry (MCP & Local).
- Lists explicitly executed capability traces.
- Displays fallback executions (e.g. `fallback_search`).

### 8. LLM Metrics Console (`/metrics/:analysisId`)
- Renders `llm_metrics` from backend schema.
- Cost, latency, token count, reliability (compactions & retries).
- Renders gracefully missing states for unavailable model usage data.

- Bound robust fallbacks inside `ToolCallItem.jsx` alerting explicitly if the MCP server was unavailable and `FALLBACK` took precedence.
- Enforced complete safety by rendering exclusively pre-sanitized tool arguments rather than rehydrating raw trace secrets.
- Completed comprehensive unit test sweeps verifying cross-page navigation, error boundaries, empty states, and dynamic mapping structures across 29 assertions.

**TASK 7 COMPLETED** (Documentation Center + V2 Specification + Product Roadmap)

Completed items:
- Implemented `/docs` using an allowlisted registry of markdown files and Vite dynamic raw imports.
- Built `MarkdownRenderer` leveraging `react-markdown` and `remark-gfm` with dynamic syntax highlighting.
- Built a sticky Table of Contents that tracks active scrolling sections.
- Created `/v2` describing upcoming capabilities like human feedback and memory constraints.
- Built `/roadmap` timeline showcasing milestone progression towards V2.
- Resolved security requirements completely blocking local filesystem traversals.
- 103/103 automated tests pass successfully across the entire React application suite.

**CRITICAL RUNTIME ISSUE RESOLVED (Backend Connection)**

- **Issue**: The frontend continuously displayed "Backend Unavailable" despite `curl` showing the backend was healthy at `http://127.0.0.1:8000/health`.
- **Root Cause**: The backend `api/main.py` lacked a configured `CORSMiddleware`. Since the Vite dev server runs on port 5173, modern browsers actively block cross-origin requests yielding a CORS error, mapped to a `NETWORK_FAILURE` in the frontend API client.
- **Fix Applied**: Injected a minimal safe `CORSMiddleware` configuration into the FastAPI app (`api/main.py`), exclusively allow-listing `http://localhost:5173` and `http://127.0.0.1:5173`.
- **Tests Performed**: `Dashboard.test.jsx` updated to explicitly assert health request states (`Connected`, `Unavailable` (on 500 error), `Unavailable` (on network failure), and `Checking`). All 103 frontend UI tests pass.
- **Final Runtime Verification**: Connection indicator correctly renders "Connected" upon successful health retrieval.

**TASK 8 COMPLETED** (Settings UI and configuration management)

Completed items:
- Designed a comprehensive `SETTINGS_REGISTRY` in `backend/api/settings_router.py` that mirrors the application settings, defining types, descriptions, and categorization.
- Improved the `GET /api/v1/settings` and `PUT /api/v1/settings` endpoints to return the enriched registry and to update the `.env` atomically using `os.replace`.
- Created `Settings.jsx` which automatically groups configurations into categories.
- Developed a modular `SettingCard.jsx` to render fields properly and handle secrets safely.
- All 106 frontend UI tests pass.
- Backend settings API tests pass.

Next implementation task:

**Frontend Task 9 — (Final integration, error handling, responsive behavior, polish and tests)**

---

## 14. Source Backend Files Reviewed

The initial frontend integration should be grounded in the existing backend files:

- `backend/api/routes.py`
- `backend/models/schemas.py`
- `backend/config/settings.py`
- `backend/api/main.py`
- `backend/api/exceptions.py`

The current backend settings already contain LLM, MCP, Lakebase, logging, and pricing configuration.

The current backend API contract and observability documentation are the source of truth for the first frontend integration.

---

## 15. Critical Demo Principle

The frontend should make BuildSmart's core value immediately visible:

```text
"What should we build?"
        ↓
"What already exists?"
        ↓
"What can we REUSE?"
        ↓
"What should we ADAPT?"
        ↓
"What must we BUILD?"
        ↓
"Why?"
        ↓
"How will we implement it?"
```

The UI should demonstrate this journey rather than simply displaying a large JSON response.


### Task 9: Data Integration, Analysis History & Observability Fixes
- **Status:** COMPLETE
- **Description:** Fixed data mapping and loading issues for Lakebase integrations.
  - **Docs Fix:** Updated `vite.config.js` to allow out-of-root fetching for markdown docs.
  - **Trace & MCP Persistence:** Updated `BuildSmartState` and `AnalysisRepository` to properly persist `AgentRun` and `ToolCall` records, feeding real data to the Trace and MCP Consoles.
  - **LLM Metrics & Schemas Fix:** Fixed schema mismatch errors (`score` vs `overall_score`, `reasoning` vs `rationale`) between LangGraph internal state and API response `AnalysisResultResponse` schemas, ensuring the response completes successfully and metrics populate.
  - **History API:** Created a new lightweight endpoint `GET /api/v1/analyses` to fetch historical analyses, removing reliance on `localStorage` for dashboard history.
