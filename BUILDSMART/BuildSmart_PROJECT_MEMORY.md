# BuildSmart — Project Memory

## Purpose

This file is the persistent working memory for the BuildSmart implementation.

Use it after every completed development step:
1. Send the latest version to the coordinator.
2. The coordinator reads the current state.
3. The next implementation step is planned from this file.
4. After implementation/testing, update this file.
5. Send the updated version back.

---

# 1. Project

**Project:** BuildSmart — Agentic AI Solution Discovery / Solution Reuse Agent

### Problem

When a team receives a new POC or solution requirement, they may immediately start building from scratch without first identifying reusable assets.

BuildSmart should determine:

- **REUSE** — use an existing implementation as-is
- **ADAPT** — modify an existing implementation
- **BUILD** — create the capability from scratch

### V1 scope

V1 uses public/open-source ecosystem sources only.

**Confidential internal company assets are NOT included in V1.**

Potential sources:

- GitHub/open-source repositories
- Web search
- AWS/cloud reference documentation
- Package metadata
- License information
- Security/vulnerability information
- Public reference architectures

---

# 2. Target Agentic Workflow

```text
User Solution Idea
        ↓
Supervisor Agent
        ↓
Decomposition Agent
        ↓
Research Agent
        ↓
Evaluation Agent
        ↓
Decision Agent
        ↓
   REUSE / ADAPT / BUILD
        ↓
Blueprint Agent
        ↓
Validation Agent
        ↓
Final BuildSmart Result
```

Planned agents:

1. SupervisorAgent
2. DecompositionAgent
3. ResearchAgent
4. EvaluationAgent
5. DecisionAgent
6. BlueprintAgent
7. ValidationAgent

---

# 3. Technology Decisions

## LLM

Development LLM:

**Groq API**

The Groq API is working successfully.

## Agentic framework

- **LangGraph** — agent orchestration, state transitions, routing and future retries/loops
- **LangChain** — LLM/tool abstractions
- **Groq** — current LLM provider

## MCP

MCP = Model Context Protocol.

Mental model:

> MCP is a standardized AI-facing interface for agents to interact with external tools/data.

MCP itself does not provide intelligence.

Potential BuildSmart integrations:

- GitHub MCP
- Web Search MCP
- AWS Documentation MCP
- Public package/tool APIs
- License evidence
- Security evidence

Existing MCPs should be reused where possible instead of rebuilding them.

---

# 4. Architecture Principles

### Incremental implementation

Every step must:

1. Implement only the requested step.
2. Preserve previously working functionality.
3. Run the complete test suite.
4. Run a manual test where appropriate.
5. Report files changed and test results.
6. STOP.
7. Wait for confirmation before the next step.

### Agent independence first

Agents are developed and tested independently before connecting them with LangGraph.

### Shared state

`state.py` defines the information passed between agents.

### Orchestration

`graph.py` will later define LangGraph workflow/orchestration.

### Avoid premature complexity

Do not add unnecessary abstractions, model hierarchies, databases, MCP integrations or APIs before their planned step.

---

# 5. Current Backend Structure

Current relevant structure:

```text
backend/
├── agents/
│   ├── __init__.py
│   ├── state.py
│   ├── supervisor.py
│   ├── decomposition.py
│   └── graph.py
├── api/
│   └── routes.py
├── app/
│   ├── __init__.py
│   └── main.py
├── config/
│   ├── __init__.py
│   └── settings.py
├── llm/
│   ├── __init__.py
│   ├── client.py
│   └── prompts.py
├── mcp/
│   └── client.py
├── models/
│   └── schemas.py
├── services/
│   └── analysis_service.py
├── tools/
│   ├── cloud_architecture.py
│   ├── documentation.py
│   ├── github.py
│   ├── license.py
│   ├── security.py
│   └── web_search.py
├── tests/
│   ├── __init__.py
│   ├── test_llm.py
│   ├── test_state.py
│   ├── test_supervisor.py
│   ├── test_decomposition.py
│   └── test_graph.py
├── main.py                ← Central workflow entry point
├── requirements.txt
└── pytest.ini
```

Notes:
- `app/config.py` was removed; config is now in `config/settings.py`.
- `app/main.py` is the Step 1 LLM smoke test only.
- `main.py` (root) is the central BuildSmart workflow runner.
- `agents/decomposition_cli.py` was DELETED in Step 5 (policy: no individual agent CLIs).
- `agents/graph.py` is the LangGraph orchestration layer.

Some folders/files are initial scaffolding. Do not assume they are implemented/integrated unless this memory explicitly says so.

---

# 6. Completed Step 1 — Groq LLM Foundation

**Status: COMPLETED**

Root-level LLM structure:

```text
backend/llm/
├── __init__.py
├── client.py
└── prompts.py
```

Responsibilities:

- `client.py` → Groq model creation/configuration
- `prompts.py` → prompt strings/templates

No API key is hardcoded.

The LLM smoke/integration test passes.

---

# 7. Completed Step 1.2 — LLM Structure Cleanup

**Status: COMPLETED**

LLM code was moved from:

```text
backend/app/llm/
```

to:

```text
backend/llm/
```

There is now one LLM implementation.

Verified imports:

```python
from llm.client import get_llm
from llm.prompts import LLM_SMOKE_TEST_PROMPT
```

Manual Groq smoke test passes.

---

# 8. Completed Step 2 — Shared Agent State

**Status: COMPLETED**

File:

```text
backend/agents/state.py
```

Contains:

- `BuildSmartState`
- `create_initial_state()`

Current state fields:

```text
analysis_id: str
user_request: str
normalized_request: str
domain: str
status: str

requirements: list[dict]
components: list[dict]
candidates: list[dict]
evaluations: list[dict]
decisions: list[dict]

blueprint: dict
validation_result: dict

current_agent: str
agent_history: list[str]
retry_count: int
execution_plan: list[dict]
```

Initial values:

```text
analysis_id        → UUID v4
user_request       → supplied input
normalized_request → ""
domain             → ""
status             → "CREATED"

requirements       → []
components         → []
candidates         → []
evaluations        → []
decisions          → []

blueprint          → {}
validation_result  → {}

current_agent      → "SupervisorAgent"
agent_history      → []
retry_count        → 0
execution_plan     → []
```

Purpose:

`BuildSmartState` is the shared state contract for the future LangGraph workflow.

### Tests

Step 2:

**17 state tests passed**

Overall at completion:

**18/18 tests passed**

---

# 9. Completed Step 3 — Supervisor Agent

**Status: COMPLETED**

File:

```text
backend/agents/supervisor.py
```

Class:

```text
SupervisorAgent
```

Responsibilities:

1. Reads `user_request`.
2. Calls Groq.
3. Creates a structured BuildSmart execution plan.
4. Stores it in `execution_plan`.
5. Updates status.
6. Updates `current_agent`.
7. Updates `agent_history`.

Status flow:

```text
CREATED
   ↓
PLANNING
   ↓
PLAN_CREATED
```

Expected plan contains:

```text
DecompositionAgent
ResearchAgent
EvaluationAgent
DecisionAgent
BlueprintAgent
ValidationAgent
```

### Groq structured-output decision

`with_structured_output()` caused a Groq compatibility issue because it triggered tool-calling behavior.

The verified working solution is:

```python
.bind(
    response_format={"type": "json_object"}
)
```

followed by Pydantic validation.

Keep this approach unless a later test proves a better compatible approach.

### Tests

Step 3:

**10 Supervisor integration tests passed**

Overall:

**29/29 tests passed**

---

# 10. Current Development Position

Latest confirmed completed step:

## STEP 3 — Supervisor Agent ✅

Current working flow:

```text
User Request
     ↓
BuildSmartState
     ↓
SupervisorAgent
     ↓
Groq
     ↓
Structured Execution Plan
     ↓
BuildSmartState
```

Latest confirmed test result:

**29/29 tests passing**

---

# 10. Completed Step 4 — Decomposition Agent

**Status: COMPLETED**

### Files created

```text
backend/agents/decomposition.py
backend/agents/decomposition_cli.py
backend/tests/test_decomposition.py
```

### Files modified

```text
backend/llm/prompts.py  ← added DECOMPOSITION_SYSTEM_PROMPT
```

### Class

```text
DecompositionAgent
```

### Pydantic models (local to decomposition.py)

```text
Requirement       — id, description, priority
Component         — id, name, description, category
DecompositionResult — normalized_request, domain, requirements, components
```

### Responsibilities

1. Reads `user_request` from state.
2. Sets status to `DECOMPOSING`.
3. Calls Groq in JSON mode (same `.bind(response_format={"type": "json_object"})` pattern as Supervisor).
4. Validates response with `DecompositionResult.model_validate()`.
5. Populates state fields: `normalized_request`, `domain`, `requirements`, `components`.
6. Sets `current_agent` to `"DecompositionAgent"`.
7. Appends `"DecompositionAgent"` to `agent_history`.
8. Sets status to `DECOMPOSED`.

### Status flow

```text
PLAN_CREATED
     ↓
DECOMPOSING
     ↓
DECOMPOSED
```

### Component categories (controlled list)

```text
INGESTION | PROCESSING | AI | STORAGE | RETRIEVAL |
BACKEND | FRONTEND | SECURITY | INTEGRATION | OBSERVABILITY
```

### ID format

```text
Requirements: REQ-001, REQ-002, ...
Components:   COMP-001, COMP-002, ...
```

### Does NOT

- Search GitHub or the web.
- Recommend specific libraries.
- Make REUSE/ADAPT/BUILD decisions.
- Call MCP tools.

### CLI

```bash
PYTHONPATH=. python -m agents.decomposition_cli "I want to build an AI customer-support assistant."
PYTHONPATH=. python -m agents.decomposition_cli "I want to build an AI document intelligence platform."
```

Both commands exit successfully with real Groq output.

### Real CLI result 1 — Customer support

```text
Domain: Conversational AI / Customer Support
Components: 10 (INGESTION, PROCESSING, RETRIEVAL, AI, INTEGRATION, SECURITY, OBSERVABILITY, FRONTEND, BACKEND, STORAGE)
Status: DECOMPOSED
```

### Real CLI result 2 — Document intelligence

```text
Domain: Document AI / Enterprise Knowledge Management
Components: 11 (all categories covered)
Status: DECOMPOSED
```

### Tests

Step 4:

**15 decomposition tests passed**

Overall after Step 4 + CLI:

**44/44 tests passed**

---

# 11. Completed Step 5 — LangGraph Workflow: Supervisor → Decomposition

**Status: COMPLETED**

### Files created

```text
backend/agents/graph.py
backend/tests/test_graph.py
```

### Files modified

```text
backend/main.py  ← Central workflow runner (was empty placeholder)
```

### Files deleted

```text
backend/agents/decomposition_cli.py
```

### Permanent policy (established this step)

No individual agent CLI files.
There is ONE central workflow runner: `backend/main.py`.
Every new agent plugs into the same workflow.

### LangGraph structure

```text
StateGraph(BuildSmartState)
    START
      ↓
  supervisor  ← SupervisorAgent().run(state)
      ↓
decomposition ← DecompositionAgent().run(state)
      ↓
     END
```

### Key constants (exported from graph.py)

```text
SUPERVISOR_NODE   = "supervisor"
DECOMPOSITION_NODE = "decomposition"
```

### Stream mode

Workflow uses `graph.stream(initial_state, stream_mode="updates")` to display
accumulated state after each agent completes.

### Central workflow command

```bash
# Interactive
python -m main

# Non-interactive (also works)
python -m main "I want to build an AI customer-support assistant."
```

### Real workflow result 1 — Customer support

```text
Supervisor   → PLAN_CREATED (6-step execution plan)
Decomposition → DECOMPOSED (12 components, 8 requirements)
History: [SupervisorAgent, DecompositionAgent]
```

### Real workflow result 2 — Document intelligence

```text
Supervisor   → PLAN_CREATED (6-step execution plan)
Decomposition → DECOMPOSED (11 components, 9 requirements)
History: [SupervisorAgent, DecompositionAgent]
```

### Architecture responsibilities

```text
agents/supervisor.py    → Supervisor intelligence
agents/decomposition.py → Decomposition intelligence
agents/state.py         → Shared state contract
agents/graph.py         → LangGraph orchestration ONLY
llm/client.py           → Groq model
llm/prompts.py          → Prompt definitions
main.py                 → Application / workflow entry point
```

### Tests

Step 5:

**12 graph integration tests passed**

Overall:

**56/56 tests passed**

---

# 12. Completed Step 6 — Research Agent + MCP Tool Integration

**Status: COMPLETED**

# 13. Completed Step 7 — Evaluation Agent

**Status: COMPLETED**

# 14. Completed Step 8 — Decision Agent

**Status: COMPLETED**

# 15. Completed Step 9 — Blueprint Agent

**Status: COMPLETED**

Fixed a critical validation bug where the LLM omitted `reuse_summary`.
- `reuse_summary` is now deterministic.
- The LLM no longer owns `reuse_summary`. We removed the prompt requirement.
- Python derives `reuse`, `adapt`, and `build` arrays directly from state decisions.
- Added `default_factory=ReuseSummary` to `BlueprintResult` so Pydantic does not fail if the LLM omits it.
- Validation behavior: Pydantic validates all other LLM output. Python replaces `reuse_summary` and transitions to `BLUEPRINT_CREATED`. Total failure of LLM JSON results in `BLUEPRINT_FAILED`.
- Both CLI workflows (customer-support, document-intelligence) tested and successfully display structured blueprints.

Latest tests:
**77/77 tests passed.**

---

# 16. Completed Step 10 — Validation Agent

**Status: COMPLETED**

- Created `ValidationAgent` to act as the final quality/consistency gate.
- **Deterministic Rules (Python-driven)**: Check component coverage, requirement coverage, and exact mapping consistency against decisions (`REUSE/ADAPT/BUILD`). A hard contradiction results in a deterministic `FAIL`.
- **Architectural Rules (LLM-driven)**: Groq evaluates architecture consistency, data flow, integrations, implementation completeness, and risks. Returns scores from 0-100 for each dimension.
- Output validation schema maps to `ValidationResult` (Pydantic model) containing individual `ValidationCategory` objects.
- Graph Topology updated to append `VALIDATION_NODE` after `BLUEPRINT_NODE`.
- Empty candidates properly result in `WARNING` or `PASS` as long as decisions and blueprint correctly align on `BUILD` (No false failures).
- Final workflow status transitions from `VALIDATING` to `VALIDATED`. 
- Results dynamically print to the console.

Latest tests:
**84/84 tests passed.**

---

## NEXT STEP:
**STEP 11 — FINAL END-TO-END INTEGRATION / API + DEMO**
(Not yet started)

---

```text
STEP 1
Groq LLM
✅

STEP 1.1 / 1.2
LLM structure cleanup
✅

STEP 2
BuildSmartState
✅

STEP 3
SupervisorAgent
✅

STEP 4
DecompositionAgent
✅

STEP 5
LangGraph: Supervisor → Decomposition
✅

STEP 6
ResearchAgent + MCP tools
✅

STEP 7
EvaluationAgent
✅

STEP 8
DecisionAgent
✅

STEP 9
BlueprintAgent
✅

STEP 10
ValidationAgent
← NEXT

STEP 11
Complete LangGraph workflow

STEP 12
Real MCP integrations

STEP 13
FastAPI integration

STEP 14
Error handling / retries / tracing

STEP 15
End-to-end testing + demo
```

---

# 13. BuildSmart Decision Logic

The central product outcome is:

```text
REUSE
ADAPT
BUILD
```

The system should not simply return links.

Target decision pipeline:

```text
Decompose requirement
        ↓
Find candidates
        ↓
Evaluate candidates
        ↓
Check license
        ↓
Check project health
        ↓
Check compatibility
        ↓
Check security
        ↓
Rank alternatives
        ↓
REUSE / ADAPT / BUILD
        ↓
Implementation blueprint
```

---

# 14. Development Memory Update Protocol

After every completed step, update this file.

Record:

- Step number and status
- Files created
- Files modified
- Files removed
- Classes/functions added
- State changes
- Architecture decisions
- Dependencies added
- Problems encountered
- Fixes applied
- Tests added
- Test results
- Manual test results
- Current folder structure if changed
- Next step

Preserve important historical decisions. Do not overwrite history.

---

# 15. Permanent Validation Rule

Every completed development step must be validated at two levels:

**LEVEL 1 — Automated Tests**

```bash
pytest -v
```

**LEVEL 2 — Real CLI / Smoke Test**

Execute the actual implementation from the command line using real configured services where applicable.

For LLM agents, use the real Groq API rather than only mocks.

Both levels must pass before a step is marked COMPLETED.

---

# 16. Coordinator Instructions

When this file is provided to the coordinator:

1. Treat it as the latest BuildSmart implementation memory.
2. Read the current development position.
3. Do not assume unconfirmed work is complete.
4. Use the relevant project `.md` specifications as additional source material.
5. Generate only the next implementation step unless asked otherwise.
6. Keep implementation incremental.
7. Require tests after each step.
8. Update this memory after each confirmed step.

---

# 17. Current Development Position

Latest confirmed completed step:

## STEP 9 — BlueprintAgent ✅

Current working flow:

```text
python -m main "<user request>"
         ↓
  create_initial_state()
         ↓
  LangGraph graph.stream()
         ↓
  supervisor node → SupervisorAgent
         ↓
  decomposition node → DecompositionAgent
         ↓
  research node → ResearchAgent (via MCP GitHub/Web)
         ↓
  evaluation node → EvaluationAgent
         ↓
  decision node → DecisionAgent
         ↓
  blueprint node → BlueprintAgent
         ↓
  Final BuildSmartState
  (execution_plan + domain + requirements + components + candidates + evaluations + decisions + blueprint)
```

Latest confirmed test result:

**72/72 tests passing**

Architecture Rule:
BlueprintAgent strictly respects REUSE/ADAPT/BUILD decisions and synthesizes an architectural plan consisting of a technology stack, component responsibilities, integrations, data flow, phases, risks, and assumptions. It utilizes structured output via Groq. Empty list fields on the Pydantic model (`risks`, `assumptions`, etc.) use `default_factory=list` for resilience.

---

# 18. Current Status Snapshot

```text
Groq LLM                         ✅
LLM structure                    ✅
BuildSmartState                  ✅
SupervisorAgent                  ✅
DecompositionAgent               ✅
LangGraph workflow (Sup→Dec)     ✅
Central workflow runner          ✅
Research Agent                   ✅
Evaluation Agent                 ✅
Decision Agent                   ✅
Blueprint Agent                  ✅
Validation Agent                 ⏳ NEXT (Step 10)
MCP integrations                 ✅ (GitHub/Web verified)
FastAPI                          ⏳
End-to-end workflow              ⏳
Final demo                       ⏳
```

**Last confirmed test result: 72/72 passing.**

**Next action: Implement Step 10 — ValidationAgent.**
