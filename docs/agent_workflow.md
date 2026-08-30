# BuildSmart — Agent Workflow

> **Source of truth**: `backend/agents/` and `backend/agents/graph.py`
> This document reflects the **currently implemented** workflow only.

---

## 1. LangGraph Topology

```
START
  │
  ▼
supervisor
  │
  ▼
decomposition
  │
  ▼
research
  │
  ▼
evaluation
  │
  ▼
decision
  │
  ▼
blueprint
  │
  ▼
validation
  │
  ▼
END
```

The graph is a **linear directed acyclic graph** — no conditional branching, no cycles, no parallel nodes in the current implementation.

---

## 2. Shared State

All agents read from and write to `BuildSmartState` (a TypedDict). Agents do not call each other directly; communication happens exclusively through state mutations.

Key state fields:

| Field | Type | Populated By |
|---|---|---|
| `analysis_id` | str (UUID) | `create_initial_state()` |
| `user_request` | str | Client input |
| `normalized_request` | str | SupervisorAgent |
| `domain` | str | SupervisorAgent |
| `execution_plan` | list | SupervisorAgent |
| `requirements` | list | DecompositionAgent |
| `components` | list | DecompositionAgent |
| `candidates` | list | ResearchAgent |
| `evaluations` | list | EvaluationAgent |
| `decisions` | list | DecisionAgent |
| `blueprint` | dict | BlueprintAgent |
| `validation_result` | dict | ValidationAgent |
| `status` | str | Each agent updates |
| `agent_history` | list | Each agent appends its name |
| `current_agent` | str | Each agent sets its name |
| `retry_count` | int | Error recovery |

---

## 3. Agent Descriptions

---

### 3.1 SupervisorAgent

**Purpose**: Plans the workflow and normalises the user request.

**Input**: `user_request` (raw string from client)

**Output**:
- `normalized_request` — cleaned, canonical form of the request
- `domain` — detected domain (e.g., `document_intelligence`)
- `execution_plan` — ordered list of agent steps to run
- `status` → `PLAN_CREATED`

**Does NOT**: Decompose requirements, call the LLM for research, make decisions.

---

### 3.2 DecompositionAgent

**Purpose**: Breaks the normalised request into requirements and components.

**Input**: `normalized_request`, `domain`

**Output**:
- `requirements` — list of `{id, name, description, category, priority}`
- `components` — list of `{id, name, description, category}`
- `status` → `DECOMPOSED`

**Does NOT**: Search for candidates, evaluate anything, make Build/Reuse decisions.

---

### 3.3 ResearchAgent

**Purpose**: Searches for reusable candidates for each component.

**Input**: `components`

**Output**:
- `candidates` — list of reusable libraries/projects found

**Current status**: ⚠️ MCP tools are **NOT implemented**. ResearchAgent currently produces `candidates = []`.

**Does NOT**: Evaluate candidates, make decisions, call the LLM for evaluation scoring.

---

### 3.4 EvaluationAgent

**Purpose**: Scores each candidate against its component requirements.

**Input**: `components`, `candidates`

**Output**:
- `evaluations` — list of `{candidate_name, component_id, score, reasoning, concerns}`
- `status` → `EVALUATED`

**Current status**: When `candidates = []` (MCP offline), produces `evaluations = []`.

**Does NOT**: Make decisions, generate blueprints, search for new candidates.

---

### 3.5 DecisionAgent

**Purpose**: Makes the final Build / Reuse / Adapt decision for each component.

**Input**: `components`, `candidates`, `evaluations`

**Output**:
- `decisions` — list of `{component_id, decision, selected_candidate_name, confidence, reason, risks}`
- `status` → `DECIDED`

**Logic**: When no evaluated candidate is available (MCP offline), all decisions default to `BUILD` with 100% confidence.

**Does NOT**: Generate blueprints, validate architecture, perform research.

---

### 3.6 BlueprintAgent

**Purpose**: Generates the implementation blueprint and architecture plan.

**Input**: `requirements`, `components`, `decisions`

**Output**:
- `blueprint` — dict containing:
  - `solution_summary`
  - `architecture_style`
  - `components` (with technology assignments)
  - `reuse_summary` (`{REUSE: [], ADAPT: [], BUILD: [...]}`)
  - `data_flow`
  - `integration_points`
  - `implementation_phases`
  - `assumptions`
  - `risks`
- `status` → `BLUEPRINT_GENERATED`

**Does NOT**: Validate the blueprint, modify decisions, run research.

---

### 3.7 ValidationAgent

**Purpose**: Validates the blueprint against requirements and decisions for consistency.

**Input**: `requirements`, `components`, `decisions`, `blueprint`

**Output**:
- `validation_result` — dict with per-category scores:
  - `overall_status` (`PASS`, `WARNING`, `FAIL`)
  - `overall_score` (0–100)
  - `requirement_coverage`
  - `component_coverage`
  - `decision_consistency`
  - `architecture_consistency`
  - `data_flow_consistency`
  - `integration_consistency`
  - `implementation_completeness`
  - `risk_completeness`
  - `critical_issues`, `warnings`, `recommendations`
- `status` → `VALIDATED`

**Validation rules**:
- All requirements must map to components
- All components must have a decision
- `REUSE`/`ADAPT` decisions must have a `selected_candidate_name`
- `BUILD` decisions with a `selected_candidate_name` are flagged as invalid

**Does NOT**: Modify the blueprint, make decisions, perform new research.

---

## 4. Agent History

Every agent appends its class name to `state["agent_history"]`. The final history for a successful run:

```json
[
  "SupervisorAgent",
  "DecompositionAgent",
  "ResearchAgent",
  "EvaluationAgent",
  "DecisionAgent",
  "BlueprintAgent",
  "ValidationAgent"
]
```

---

## 5. MCP — FUTURE / PLANNED

> ⚠️ **MCP is NOT currently active.**

### 5.1 MCP Client (Future Research)
When MCP is implemented, `ResearchAgent` will have access to:
- GitHub repository search
- Web search
- Package registry (PyPI, npm, Maven) queries
- License analysis tools

Until then, `candidates = []` and `evaluations = []` for all analyses.

### 5.2 BuildScout MCP Server (Future Integration)
In V2, the entire LangGraph workflow will be exposed to external AI agents via the **BuildScout MCP Server**. 

Planned MCP tools to trigger this workflow include:
- `analyze_solution`: Run the complete BuildScout analysis
- `discover_solutions`: Discover reusable solutions
- `evaluate_candidates`: Evaluate discovered candidates
- `make_build_decision`: Determine REUSE / ADAPT / BUILD
- `generate_architecture`: Generate the architecture blueprint
- `validate_architecture`: Validate the proposed architecture
- `get_analysis`: Retrieve a previous analysis
- `get_analysis_history`: Retrieve historical analyses
