# BuildSmart — Skills Architecture & V2 Design

> **Document type:** Architecture Design
>
> **Status labels used throughout this document:**
> - `[IMPLEMENTED]` — Exists in the current V1 codebase.
> - `[DESIGNED]` — Specified here; not yet implemented.
> - `[PLANNED]` — On the roadmap but not yet specified in detail.
> - `[FUTURE]` — Long-term aspiration; out of scope for immediate planning.

---

## 1. Introduction — Why BuildSmart Needs a Skills Layer

BuildSmart V1 is a production-capable multi-agent system. The V1 foundation `[IMPLEMENTED]` includes:

| V1 Capability | Location |
|---|---|
| LangGraph multi-agent workflow (7 agents) | `backend/agents/graph.py` |
| UnifiedToolGateway (abstract capability routing) | `backend/tools/gateway.py` |
| GitHub MCP integration | `backend/mcp_integration/` |
| Tavily Web Search MCP integration | `backend/mcp_integration/` |
| Local tool fallbacks (security, license, AWS docs, cloud arch) | `backend/tools/` |
| Databricks Lakebase persistence | `backend/database/` |
| Centralized LLM retry framework (3 retries, exponential backoff, 413 compaction) | `backend/llm/retry.py` |
| LLM observability (token metrics, latency, cost, dual log files) | `backend/llm/metrics.py` |
| Lightweight Prompt Optimizer | `backend/services/prompt_optimizer.py` |
| FastAPI REST API | `backend/api/` |

Despite this strong V1 foundation, tools are **low-level capabilities**. The current `UnifiedToolGateway` exposes:

```
github.search        web.search          security.get
license.get          aws.documentation   cloud.architecture
```

These are excellent atomic capabilities, but they are not reusable **business capabilities**. For example:

```
github.search  ≠  "Find open-source candidates for a requirement"
```

The second statement — *find open-source candidates* — is a **business intent** that requires:

- formulating a search query from a requirement description
- running one or more tool calls (github.search, web.search)
- normalizing disparate results into a unified candidate format
- applying deduplication
- enforcing context-size limits
- preserving source provenance metadata
- handling partial failures gracefully

In V1, this logic is embedded directly inside `ResearchAgent`. It cannot be reused by any other agent, cannot be versioned independently, cannot be tested in isolation, and cannot be adapted based on human feedback.

The **Skills architecture** introduces a named, versioned, composable layer — the **Skill** — between agents and tools. This unlocks reuse, testability, observability, and eventually human-feedback-driven personalization.

---

## 2. Core Concepts

### 2.1 Comparison Table

| Concept | Definition | Examples | V1 Status |
|---|---|---|---|
| **Tool** | Low-level, single-purpose, executable capability. Returns raw structured data. No business logic. | `github.search`, `web.search`, `license.get`, `security.get`, `aws.documentation`, `cloud.architecture` | `[IMPLEMENTED]` |
| **Skill** | Reusable business capability composed from one or more tools, with explicit contracts, instructions, and validation rules. | Solution Discovery, Security Assessment, License Compliance, Architecture Research | `[DESIGNED]` |
| **Agent** | Reasoning and orchestration component. Decides what to do, selects skills, interprets results, updates workflow state. | `SupervisorAgent`, `ResearchAgent`, `EvaluationAgent`, `DecisionAgent` | `[IMPLEMENTED]` |
| **Memory** | Persisted historical knowledge and context used to improve future analyses. Previous decisions, previous candidates, user feedback signals. | Analysis history, previous evaluations, user preference signals | `[DESIGNED]` |
| **Prompt Optimizer** | Preprocessing layer that transforms a raw user request into a clearer, structured representation before agent execution. | `PromptOptimizer` service | `[IMPLEMENTED]` (V1 lightweight) |
| **Human Feedback** | Explicit user corrections and preferences that can influence future analysis. Candidate rejection, technology preferences, decision overrides. | "Prefer AWS", "Avoid GPL", "Use this candidate" | `[DESIGNED]` |

### 2.2 The Critical Distinction

This must be clearly understood before implementing V2:

```
github.search         ≠  Skill        (it is a Tool/Capability)
web.search            ≠  Skill        (it is a Tool/Capability)
security.get          ≠  Skill        (it is a Tool/Capability)
license.get           ≠  Skill        (it is a Tool/Capability)

Solution Discovery    =  Skill        (composed from github.search + web.search)
Security Assessment   =  Skill        (composed from security.get + web.search)
License Compliance    =  Skill        (composed from license.get + web.search)
Architecture Research =  Skill        (composed from aws.documentation + cloud.architecture + web.search)
```

**Do NOT convert every tool into a Skill.** Tools remain tools. Skills are named, versioned business capabilities that _orchestrate_ tools.

### 2.3 Layer Diagram

```
Agent (ResearchAgent, EvaluationAgent, ...)
  │   reasons, selects skills, interprets results, updates BuildSmartState
  ▼
Skill (Solution Discovery, Security Assessment, ...)   ← [DESIGNED]
  │   combines tools, enforces contracts, validates outputs
  ▼
UnifiedToolGateway (gateway.py)                        ← [IMPLEMENTED]
  │   routes abstract capabilities to MCP or local implementations
  ▼
MCPManager → MCPRegistry → MCPToolClient               ← [IMPLEMENTED]
  │   handles timeouts, retries, secret masking, result truncation
  ▼
External MCP Server or Local Tool                      ← [IMPLEMENTED]
  (GitHub MCP, Tavily MCP, local python tools)
```

---

## 3. V1 Foundation — Current State `[IMPLEMENTED]`

### 3.1 Current Agent Pipeline

The V1 BuildSmart pipeline is a linear LangGraph DAG:

```
POST /api/v1/analyses
    ↓
AnalysisService (backend/services/analysis_service.py)
    ↓
PromptOptimizer (backend/services/prompt_optimizer.py)
    │   Deterministic preprocessing + optional LLM normalization
    │   Output: optimized_request, intent, requirements, constraints
    ↓
BuildSmartState (created by create_initial_state())
    ↓
SupervisorAgent     → creates execution plan, normalizes domain
    ↓
DecompositionAgent  → produces requirements[] + components[]
    ↓
ResearchAgent       → queries tools via UnifiedToolGateway → candidates[]
    ↓
EvaluationAgent     → scores candidates → evaluations[]
    ↓
DecisionAgent       → REUSE / ADAPT / BUILD per component → decisions[]
    ↓
BlueprintAgent      → architecture blueprint → blueprint{}
    ↓
ValidationAgent     → consistency validation → validation_result{}
    ↓
AnalysisRepository  → persists to Databricks Lakebase
    ↓
AnalysisResultResponse → JSON API response
```

### 3.2 Current Tool Layer

All tool execution flows through the `UnifiedToolGateway` `[IMPLEMENTED]`:

```
ResearchAgent
    ↓
tool_gateway.execute_tool(capability_name, args)
    ↓
MCPRegistry.get_tool_config(capability_name)
    ↓
if provider == "MCP":
    MCPManager.call_tool(server, tool, args)
        → MCPToolClient → External MCP Server
        → Fallback to local tool on failure
if provider == "LOCAL":
    LocalTool.execute(args)
    ↓
Normalized result dict
```

**Registered capabilities `[IMPLEMENTED]`:**

| Capability | Provider | MCP Server | Local Fallback |
|---|---|---|---|
| `github.search` | MCP → LOCAL | `@modelcontextprotocol/server-github` | `backend/tools/github.py` |
| `web.search` | MCP → LOCAL | Tavily MCP | `backend/tools/web_search.py` |
| `security.get` | LOCAL | — | `backend/tools/security.py` |
| `license.get` | LOCAL | — | `backend/tools/license.py` |
| `aws.documentation` | LOCAL | — | `backend/tools/cloud_architecture.py` |
| `cloud.architecture` | LOCAL | — | `backend/tools/documentation.py` |

### 3.3 LLM Infrastructure `[IMPLEMENTED]`

| Component | File | Detail |
|---|---|---|
| LLM client (Groq/ChatGroq) | `backend/llm/client.py` | Returns `ChatGroq` instance |
| Retry service (sync) | `backend/llm/retry.py` → `invoke_with_retry` | 3 retries, exponential backoff, 413 compaction |
| Retry service (async) | `backend/llm/retry.py` → `ainvoke_with_retry` | Same policy |
| Token metrics | `backend/llm/metrics.py` → `record_llm_call` | Per-call token counts, latency, cost |
| Dual log files | `buildsmart.log`, `llm_tokens.log` | JSONL token log + application log |
| Lakebase persistence | `LLMCall` model in `repositories.py` | Permanent per-analysis storage |

### 3.4 Prompt Optimizer `[IMPLEMENTED]`

The `PromptOptimizer` is a preprocessing service, **not a LangGraph agent**, that runs before `SupervisorAgent`:

- Deterministic preprocessing: length check, whitespace normalization
- Optional single LLM call via `invoke_with_retry` for structured extraction
- Output: `PromptOptimizationResult` (optimized_request, intent, requirements, constraints, known_technologies)
- Fallback: if optimization fails, original request is passed through unchanged
- Anti-hallucination: never injects technologies or requirements not stated by the user
- Token usage automatically flows into the existing observability metrics

**V2 evolution planned** (not implemented): feedback-driven optimization, prompt versioning, GEPA/DSPy experimentation.

### 3.5 What V1 Does NOT Have

The following are explicitly **not** present in V1:

- `[DESIGNED]` A named Skill abstraction or Skill class
- `[DESIGNED]` A SkillRegistry
- `[DESIGNED]` A Skill Planner that selects skills per request
- `[DESIGNED]` Human feedback storage or application
- `[DESIGNED]` Memory/context retrieval from historical analyses
- `[PLANNED]` Advanced feedback-driven prompt optimization

---

## 4. V2 Skills — Initial Target Set `[DESIGNED]`

The following seven skills are the initial V2 design targets. None are implemented. All tool execution must route through the existing `UnifiedToolGateway`.

---

### 4.1 Solution Discovery Skill

**Purpose**: Find existing open-source or reusable solutions for a given technical requirement or component.

**Required capabilities**: `github.search`, `web.search`

**Optional capabilities**: `license.get`, `security.get`

**Responsibilities**:
- Formulate effective discovery queries from component descriptions
- Search GitHub and the web for relevant projects
- Normalize heterogeneous results into unified `ResearchCandidate` format
- Deduplicate by URL
- Preserve source provenance (GitHub MCP, Tavily MCP, local fallback)
- Preserve available metadata (stars, language, license, last_updated, forks)
- Enforce context-size limits before LLM normalization

**Expected output**:
```json
{
  "candidates": [
    {
      "id": "CAND-001",
      "component_id": "COMP-001",
      "name": "example/project",
      "source": "github",
      "url": "https://github.com/example/project",
      "description": "...",
      "relevance_reason": "...",
      "metadata": {
        "stars": 12000,
        "language": "Python",
        "license": "MIT",
        "last_updated": "2026-08-01"
      }
    }
  ],
  "skill_trace": { "tools_used": [...], "latency_ms": 840, "provider": "MCP" }
}
```

**Anti-hallucination rule**: Metadata must only contain values returned by the provider. Never invent stars, license, or language.

---

### 4.2 Solution Evaluation Skill

**Purpose**: Evaluate candidate solutions against component requirements for suitability.

**Required capabilities**: None (LLM-driven with supplied evidence)

**Optional capabilities**: `github.search`, `web.search`

**Evaluation dimensions**:
- Relevance — does it solve the component requirement?
- Functionality — does it cover the needed feature set?
- Technology compatibility — does it fit the domain and architecture?
- Maturity — project age, release cadence, stability signals
- Maintenance — recent activity, open issue trends, contributors
- Community signals — stars, forks, downloads
- Documentation quality
- Implementation fit — integration complexity

**Expected output**:
```json
{
  "candidate_id": "CAND-001",
  "component_id": "COMP-001",
  "relevance_score": 85,
  "compatibility_score": 78,
  "project_health_score": 90,
  "license_score": null,
  "security_score": null,
  "maintainability_score": 82,
  "overall_score": 83.8,
  "strengths": ["Active development", "Large community"],
  "concerns": ["Missing license evidence"],
  "missing_evidence": ["license", "security"]
}
```

**Anti-hallucination rule**: Dimension scores must be `null` when evidence is absent. The `missing_evidence` array must enumerate every absent dimension explicitly.

---

### 4.3 License Compliance Skill

**Purpose**: Determine whether a candidate's license is acceptable for the intended use case.

**Required capabilities**: `license.get`

**Optional capabilities**: `web.search`

**Evaluation dimensions**:
- License type (MIT, Apache-2.0, GPL-3.0, AGPL-3.0, proprietary, ...)
- License compatibility with the project's intended use
- Restrictions (copyleft, attribution, patent clauses)
- Commercial usage considerations
- Dual-licensing complexity

**Anti-hallucination rule**: Never infer or fabricate a license. If the provider returns no license data, the result must be `UNKNOWN` — not "likely permissive", not "MIT assumed".

**Expected output**:
```json
{
  "repository": "example/project",
  "license_spdx": "MIT",
  "license_name": "MIT License",
  "compliance_signal": "PERMISSIVE",
  "restrictions": [],
  "confidence": 0.97,
  "source": "ClearlyDefined",
  "missing_evidence": []
}
```

---

### 4.4 Security Assessment Skill

**Purpose**: Assess security risks and signals for a candidate solution.

**Required capabilities**: `security.get`

**Optional capabilities**: `web.search`

**Evaluation dimensions**:
- Known vulnerabilities (CVE records, NVD)
- OpenSSF Scorecard score and signals
- Repository health indicators (branch protection, code review, CI/CD)
- Dependency risk signals
- Known security concerns in the community
- Recent security-related issues or advisories

**Anti-hallucination rule**: The skill must not claim a project is "secure". It provides evidence signals. The `EvaluationAgent` applies scoring judgment.

**Expected output**:
```json
{
  "repository": "example/project",
  "scorecard_score": 7.8,
  "scorecard_source": "OpenSSF",
  "known_vulnerabilities": [],
  "confidence": 0.85,
  "evidence_url": "https://scorecard.dev/viewer/?repo=github.com/example/project",
  "missing_evidence": []
}
```

---

### 4.5 Architecture Research Skill

**Purpose**: Research architecture patterns and reference implementations for infrastructure or cloud components.

**Required capabilities**: `aws.documentation`, `cloud.architecture`

**Optional capabilities**: `web.search`

**Supports**:
- Cloud architecture pattern discovery
- AWS service selection guidance
- Integration and deployment patterns
- Scalability and reliability considerations
- Reference implementations

**Expected output**:
```json
{
  "component_id": "COMP-003",
  "architecture_patterns": [
    {
      "name": "Event-driven serverless ingestion",
      "description": "...",
      "aws_services": ["S3", "Lambda", "SQS"],
      "url": "https://docs.aws.amazon.com/..."
    }
  ],
  "service_recommendations": ["AWS S3", "AWS Textract"],
  "skill_trace": { ... }
}
```

---

### 4.6 Technology Recommendation Skill

**Purpose**: Compare technology, library, and platform options and recommend the most appropriate choice.

**Required inputs**:
- requirements
- constraints (e.g., "AWS only", "Python only")
- candidate solutions (from Solution Discovery)
- optional: architecture information, security signals, license information

**Optional capabilities**: `github.search`, `web.search`, `aws.documentation`

**Expected output**:
```json
{
  "component_id": "COMP-001",
  "recommendations": [
    {
      "technology": "FastAPI",
      "rank": 1,
      "reason": "Highest compatibility with Python constraint, active maintenance, MIT license",
      "confidence": 0.91
    }
  ],
  "constraints_applied": ["Python", "MIT-compatible license"]
}
```

---

### 4.7 Solution Comparison Skill

**Purpose**: Produce a structured, consistent side-by-side comparison of multiple candidates for the same component.

**Required inputs**: Two or more evaluated candidates for the same component.

**Comparison dimensions**:

| Dimension | Description |
|---|---|
| Functionality | Feature coverage match |
| Compatibility | Technology stack fit |
| License | License type and compliance signal |
| Security | OpenSSF / CVE signals |
| Maturity | Age, release cadence, stability |
| Maintainability | Code health, documentation quality |
| Community | Stars, forks, issue velocity |
| Implementation effort | Integration complexity |
| Risks | Known risks per candidate |

**Expected output**: Structured side-by-side comparison table with a recommended winner per component and reasoning.

---

## 5. Additional Future Skills `[PLANNED]`

These skills are on the roadmap but are not yet specified in detail. They should not be implemented until their immediate predecessors are stable.

### 5.1 Reuse Decision Skill `[PLANNED]`

Applies business rules and evaluation results to produce a structured REUSE / ADAPT / BUILD recommendation per component. Currently this logic lives in `DecisionAgent` and makes an LLM-driven decision. The skill would introduce explicit, auditable business rules that can be tuned without agent code changes.

### 5.2 Architecture Blueprint Skill `[PLANNED]`

Transforms selected REUSE/ADAPT/BUILD decisions into an implementation architecture with technology stack, integration points, data flows, and implementation phases. Currently handled by `BlueprintAgent`.

### 5.3 Validation Skill `[PLANNED]`

Validates a generated blueprint against:
- Requirement coverage
- Component coverage
- Decision consistency
- Architecture consistency
- Data flow coherence
- Integration completeness
- Risk completeness

Currently handled by `ValidationAgent`. A Skill version would be independently testable and configurable without agent code changes.

### 5.4 Requirement Clarification Skill `[PLANNED]`

Identifies ambiguous or missing requirements in the user's original request and surfaces them as structured missing-information signals. Must never invent requirements.

### 5.5 Skill Selection / Planning Skill `[PLANNED]`

Determines which Skills should be executed for a given user request, based on request type, domain, and constraints.

**Example**:

Input: `"Build a secure AWS document intelligence platform."`

Planned skill execution order:
```
Requirement Clarification  →  Solution Discovery  →  Architecture Research
    →  Security Assessment  →  License Compliance  →  Solution Evaluation
    →  Solution Comparison  →  Reuse Decision  →  Architecture Blueprint
    →  Validation
```

---

## 6. Skill Composition `[DESIGNED]`

Skills are composable. A higher-order skill can invoke lower-order skills, which invoke tools. Tool implementations are never duplicated between skills — all execution routes through `UnifiedToolGateway`.

**Composition Example 1 — Research pipeline:**

```
Solution Discovery Skill
    ↓ (candidates)
Security Assessment Skill   ←─── parallel or sequential
License Compliance Skill    ←───
    ↓ (enriched candidates)
Solution Evaluation Skill
    ↓
Evaluated candidates
```

**Composition Example 2 — Technology recommendation:**

```
Technology Recommendation Skill
    ↓ calls
    ├── Solution Discovery Skill
    ├── Solution Evaluation Skill
    ├── Architecture Research Skill
    └── Solution Comparison Skill
    ↓
Ranked technology recommendations
```

**Composition rule**: All tool execution — at every depth — must pass through `UnifiedToolGateway`. No skill or composed skill may bypass the gateway, the MCP allow-list, or the secret masking applied by `MCPManager`.

---

## 7. Skill Contract `[DESIGNED]`

Every V2 Skill must conform to the following contract structure:

```yaml
skill_name: <snake_case string>        # Unique identifier
description: <string>                  # Human-readable purpose
version: <semver>                      # e.g., "1.0.0"
purpose: <string>                      # One-sentence business objective

inputs:
  - name: <string>
    type: <string>                     # string | int | list | object
    required: <bool>
    description: <string>

required_capabilities:                 # Gateway must resolve these; skill fails if unavailable
  - <capability_name>

optional_capabilities:                 # Skill degrades gracefully if unavailable
  - <capability_name>

execution_strategy:
  mode: <sequential | parallel | adaptive>
  max_tool_calls: <int>                # Hard cap on tool invocations
  context_limit_chars: <int>           # Truncate combined raw results above this

output_schema:
  type: object
  properties:
    results: list
    skill_trace: object                # Mandatory telemetry

validation_rules:
  - "Each output item must have a non-empty url."
  - "Metadata must not be fabricated."
  - "missing_evidence must be populated for every absent dimension."

failure_behavior:
  on_required_capability_unavailable: FAIL | DEGRADE
  on_all_tools_fail: RETURN_EMPTY | RAISE
  on_context_overflow: TRUNCATE

observability_requirements:
  emit_skill_start: true
  emit_skill_end: true
  emit_tool_call_count: true
  emit_latency_ms: true
  emit_result_count: true
  emit_provider_used: true             # MCP or LOCAL
```

**Example — Solution Discovery:**

```yaml
skill_name: solution_discovery
description: Find open-source candidates for a technical component
version: "1.0.0"
purpose: Discover reusable open-source solutions via GitHub and web search

inputs:
  - name: component_id
    type: string
    required: true
  - name: component_name
    type: string
    required: true
  - name: component_description
    type: string
    required: true
  - name: limit
    type: int
    required: false

required_capabilities:
  - github.search
  - web.search

optional_capabilities:
  - license.get
  - security.get

execution_strategy:
  mode: sequential
  max_tool_calls: 4
  context_limit_chars: 14000

output_schema:
  type: object
  properties:
    candidates: list                   # list[ResearchCandidate]
    skill_trace: object

failure_behavior:
  on_required_capability_unavailable: DEGRADE
  on_all_tools_fail: RETURN_EMPTY
  on_context_overflow: TRUNCATE
```

---

## 8. Skill Lifecycle `[DESIGNED]`

The intended full lifecycle for a single skill invocation:

```
1.  Skill Discovery
    Agent queries SkillRegistry for available skills.

2.  Skill Selection
    Agent (or Skill Planner) selects the appropriate skill for the task.

3.  Input Preparation
    Agent prepares the skill's declared input schema from BuildSmartState.

4.  Capability Check
    Skill verifies required capabilities are available via UnifiedToolGateway.
    Required capability unavailable → FAIL or DEGRADE per failure_behavior.

5.  skill_start Event
    Skill emits telemetry: skill_name, version, analysis_id, timestamp.

6.  Tool Execution
    Skill executes tool calls via UnifiedToolGateway (never directly).
    MCPManager enforces timeouts, retries, secret masking, result truncation.

7.  Result Normalization
    Skill normalizes heterogeneous tool outputs into its declared output schema.
    Context-size protection applied (truncation at context_limit_chars).

8.  Output Validation
    Skill validates output against validation_rules.
    Anti-hallucination checks: metadata must not be fabricated.

9.  skill_end Event
    Skill emits: latency_ms, tools_used, result_count, provider, status.

10. Output Returned to Agent
    Skill returns SkillResult to the invoking agent.

11. Agent Reasoning
    Agent interprets SkillResult and updates BuildSmartState.

12. Human Feedback (Future)
    User reviews result. Feedback stored and applied to future runs.

13. Memory Persistence (Future)
    Skill result and feedback stored in Memory Store for context retrieval.
```

---

## 9. V2 Architecture — Full Target `[DESIGNED]`

```
User Request
    ↓
Memory / Context Retrieval  [DESIGNED]
    │   Retrieve relevant previous analyses, candidates, decisions, user preferences
    ↓
Prompt Optimizer  [IMPLEMENTED — V1 lightweight]
    │   Deterministic preprocessing + optional LLM normalization
    │   Future V2: feedback-driven optimization, GEPA/DSPy
    ↓
Skill Planner  [DESIGNED]
    │   Determines which skills to execute for this request
    ↓
Selected Skills  [DESIGNED]
    │   Solution Discovery, Architecture Research, Security Assessment, ...
    ↓
UnifiedToolGateway  [IMPLEMENTED]
    │   Routes to MCP or local implementations
    ↓
MCP / Local Tools  [IMPLEMENTED]
    ↓
Skill Results
    ↓
Agent Reasoning  [IMPLEMENTED — V1 LangGraph]
    │   Evaluation → Decision → Blueprint → Validation
    ↓
Final Result
    ↓
Human Feedback  [DESIGNED]
    ↓
Memory Store  [DESIGNED]
    ↓ (feeds into next request)
```

---

## 10. Human Feedback `[DESIGNED]`

> **NOT IMPLEMENTED IN V1.** This section defines the intended future design.

BuildSmart should eventually allow users to provide explicit feedback on analysis results:

- "This candidate is not relevant to our use case."
- "Prefer AWS-native services."
- "Avoid GPL and AGPL licensed projects."
- "Use this specific repository instead."
- "This recommendation is incorrect."
- "BUILD this component instead of REUSE."
- "The generated architecture is too complex — simplify."
- "Prefer open-source over proprietary."

### How Feedback Influences the System

| Feedback Signal | Effect |
|---|---|
| "Prefer AWS" | `Architecture Research` skill weights AWS results higher; `Prompt Optimizer` includes preference |
| "No GPL" | `License Compliance` skill applies hard filter before returning candidates |
| "Candidate not relevant" | `Solution Evaluation` skill adjusts relevance scoring weights for similar queries |
| "Use this candidate" | Specific candidate pinned; skill result overridden by user choice |
| "BUILD not REUSE" | Constraint propagated to `Reuse Decision` skill and `DecisionAgent` |
| "Architecture too complex" | `Architecture Blueprint` skill receives a simplification constraint |

### Feedback Storage Design `[DESIGNED]`

Feedback will be persisted to Lakebase per `analysis_id`. Schema will include:

```json
{
  "feedback_id": "<uuid>",
  "analysis_id": "<uuid>",
  "timestamp": "<iso8601>",
  "feedback_type": "CANDIDATE_REJECTION | TECHNOLOGY_PREFERENCE | DECISION_OVERRIDE | ...",
  "target_id": "<candidate_id | component_id | decision_id | null>",
  "signal": "<string>",
  "user_note": "<string>"
}
```

### Feedback Guardrails

Feedback must never:
- Cause agents to fabricate evidence or invent metadata.
- Bypass the MCP allow-list or secret masking.
- Override validation results that detect genuine architectural inconsistencies.
- Introduce prompt injection vulnerabilities.

---

## 11. Memory / Context Retrieval `[DESIGNED]`

> **NOT IMPLEMENTED IN V1.** V1 persists analyses to Lakebase and supports retrieval by `analysis_id` via `GET /api/v1/analyses/{id}`. There is no automatic retrieval of relevant historical context for new requests.

### Current V1 Persistence

```
POST /api/v1/analyses
    → AnalysisRepository.save_analysis(session, final_state)
    → Lakebase (analyses + requirements + components + candidates
                + evaluations + decisions + blueprint + agent_runs + llm_calls)

GET /api/v1/analyses/{id}
    → AnalysisRepository.get_analysis_result(session, uuid)
    → Read-only retrieval, never re-invokes LangGraph or agents
```

### V2 Memory Design

V2 will introduce active, automatic context retrieval:

```
New User Request
    ↓
Memory Store Query
    │   Semantic search over previous analyses
    │   Filter by domain, technology, component similarity
    ↓
Relevant Context Retrieved
    │   Similar previous components, their candidate findings, decisions
    │   Previous user feedback signals for this user/team
    ↓
Prompt Optimizer
    │   Context injected as optional structured input
    ↓
Skill Planner + Skills
    │   Skills can skip redundant searches if recent relevant results exist
    ↓
Result (personalized by history)
```

**V2 Memory capabilities `[DESIGNED]`:**
- Semantic retrieval over previous analyses
- Historical candidate retrieval (avoid re-searching known solutions)
- Previous decision retrieval (reinforce consistent decisions across analyses)
- User feedback signals (preferences, rejections, overrides)
- Contextual recommendations ("Last time you built similar functionality with X")

---

## 12. Prompt Optimizer — V1 and V2 `[IMPLEMENTED]` / `[DESIGNED]`

### V1 Implementation `[IMPLEMENTED]`

The `PromptOptimizer` in `backend/services/prompt_optimizer.py` is a preprocessing service, not a LangGraph agent:

- **Deterministic preprocessing**: Length validation, whitespace normalization
- **Optional LLM call**: Structured extraction via `invoke_with_retry` using existing Groq client
- **Output**: `PromptOptimizationResult` (optimized_request, intent, requirements, constraints, known_technologies, missing_information, confidence)
- **Fallback**: On any failure, original request passed through unchanged — the workflow is never blocked
- **Anti-hallucination**: Never injects technology assumptions not stated by the user
- **Observability**: Token usage flows automatically into `llm/metrics.py` records
- **Integration**: Runs before `SupervisorAgent`, result stored in state

### V2 Prompt Optimizer Evolution `[DESIGNED]`

| Capability | V1 Status | V2 Plan |
|---|---|---|
| Deterministic preprocessing | `[IMPLEMENTED]` | Retained |
| Single LLM normalization call | `[IMPLEMENTED]` | Retained |
| Intent detection | `[IMPLEMENTED]` | Retained, improved |
| Constraint extraction | `[IMPLEMENTED]` | Retained |
| Technology identification | `[IMPLEMENTED]` | Retained |
| Feedback-driven optimization | `[FUTURE]` | Apply user preferences to reframe requests |
| Prompt versioning | `[FUTURE]` | Version and A/B test optimizer prompts |
| GEPA / DSPy experimentation | `[FUTURE]` | Automated prompt quality improvement |
| Prompt quality scoring | `[FUTURE]` | Measure optimizer quality from feedback signals |
| Memory-augmented optimization | `[FUTURE]` | Inject historical context into optimization |

---

## 13. The V2 Learning Loop `[DESIGNED]`

The central architectural goal of BuildSmart V2 is a self-improving learning loop:

```
User Request
    ↓
Memory Retrieval          [DESIGNED]
    │   Relevant context from past analyses + user preferences
    ↓
Prompt Optimizer          [IMPLEMENTED — V1]
    │   Optimized, structured request
    ↓
Skill Planner             [DESIGNED]
    │   Selects skills based on request + memory context
    ↓
Skills                    [DESIGNED]
    │   Execute tools, normalize results, validate outputs
    ↓
Agent Reasoning           [IMPLEMENTED — V1]
    │   Evaluation → Decision → Blueprint → Validation
    ↓
Recommendation
    ↓
Human Feedback            [DESIGNED]
    │   User accepts, rejects, or overrides recommendations
    ↓
Feedback persisted to Memory
    │   Updates user preferences, candidate signals, decision history
    ↓
Influences next request (loop closes)
```

Each iteration of the loop makes BuildSmart more accurate for the user's context, technology stack, and preferences.

---

## 14. Observability for Skills `[DESIGNED]`

Skills must emit structured telemetry that integrates with the existing LLM observability infrastructure.

### Skill Telemetry Fields

| Field | Description |
|---|---|
| `skill_name` | Identifier (e.g., `solution_discovery`) |
| `skill_version` | Semver |
| `analysis_id` | Correlated to the active analysis |
| `execution_time_ms` | Total skill latency |
| `tools_used` | List of capabilities invoked |
| `providers_used` | MCP or LOCAL per tool |
| `result_count` | Number of results produced |
| `status` | SUCCESS / DEGRADED / FAILED |
| `retry_count` | MCP retries consumed |
| `error_type` | If failed |

### What Must NOT Be Logged

- API keys, tokens, secrets, passwords
- Raw prompts or prompt templates
- Sensitive user information beyond what is necessary
- Raw provider responses before masking

Skills must respect the secret masking enforced by `MCPManager._mask_secrets()`.

### Integration Path

When Skills are implemented, their telemetry should extend the existing `llm/metrics.py` infrastructure or introduce a parallel `skills/telemetry.py` module, using the same analysis-scoped correlation pattern.

---

## 15. Security — Skills Must Preserve All V1 Controls

Skills must never relax any security control currently enforced by V1:

| Control | V1 Enforcement | Skills Requirement |
|---|---|---|
| MCP allow-list | `MCPRegistry.is_tool_allowed()` | Skills invoke gateway only; never bypass |
| Secret masking | `MCPManager._mask_secrets()` | Skills never see raw credentials |
| Timeout enforcement | `MCPManager` → `asyncio.wait_for()` | Skills do not call MCP tools directly |
| Result-size truncation | `MCPManager.max_result_size` | Skills apply additional `context_limit_chars` |
| Arbitrary command prevention | `MCPRegistry` allow-list | Skills cannot register new MCP servers at runtime |
| Input validation | Tool `execute()` method | Skills validate inputs per declared schema |

---

## 16. Failure and Fallback Model `[DESIGNED]`

```
Skill Invoked
    ↓
Required capabilities available?
    ├── Yes → Execute via UnifiedToolGateway
    └── No  → FAIL (if failure_behavior == FAIL)
              DEGRADE (if failure_behavior == DEGRADE)
                  ↓ use only available capabilities
    ↓
UnifiedToolGateway
    ↓
MCP server reachable?
    ├── Yes → MCP execution → result
    └── No  → Local fallback (if defined)
               No fallback → FAILED trace returned
    ↓
Result too large?
    └── Yes → Truncate at context_limit_chars (not at MCPManager max_result_size)
    ↓
Output validation passes?
    ├── Yes → Return SkillResult to agent
    └── No  → Log validation failure
              Return degraded SkillResult with warnings
```

A Skill must **never** propagate raw provider-specific errors to the agent or the user. All failures are normalized into a `SkillResult` with `status: FAILED | DEGRADED` and an `error_reason` field.

---

## 17. Skill Versioning `[DESIGNED]`

Every skill carries a semver version field:

```yaml
skill_name: solution_discovery
version: "1.0.0"
status: ACTIVE
```

Versioning enables:
- Controlled evolution of skill execution strategy without breaking existing agents
- A/B testing between skill versions
- Rollback if a new skill version degrades results
- Audit trail: which skill version produced which analysis result

The `SkillRegistry` will store version history and allow agents to request a specific version or always use the latest stable.

---

## 18. Proposed Directory Structure `[DESIGNED]`

**Not to be created until V2 implementation begins.**

```
backend/skills/
├── __init__.py
├── base.py                            # Abstract Skill base class, SkillResult model
├── registry.py                        # SkillRegistry — indexes and resolves skills
├── discovery/
│   └── solution_discovery/
│       ├── __init__.py
│       ├── skill.py                   # SolutionDiscoverySkill implementation
│       └── skill.md                   # Mirrors YAML contract (human-readable)
├── evaluation/
│   └── solution_evaluation/
│       ├── __init__.py
│       ├── skill.py
│       └── skill.md
├── compliance/
│   ├── license_compliance/
│   │   ├── __init__.py
│   │   ├── skill.py
│   │   └── skill.md
│   └── security_assessment/
│       ├── __init__.py
│       ├── skill.py
│       └── skill.md
├── architecture/
│   └── architecture_research/
│       ├── __init__.py
│       ├── skill.py
│       └── skill.md
├── comparison/
│   └── solution_comparison/
│       ├── __init__.py
│       ├── skill.py
│       └── skill.md
└── recommendation/
    └── technology_recommendation/
        ├── __init__.py
        ├── skill.py
        └── skill.md
```

---

## 19. V1 vs V2 Feature Map

| Feature | V1 | V2 |
|---|---|---|
| Multi-agent workflow (LangGraph) | `[IMPLEMENTED]` | Retained |
| UnifiedToolGateway | `[IMPLEMENTED]` | Retained as the sole tool execution layer |
| GitHub MCP | `[IMPLEMENTED]` | Retained |
| Tavily Web Search MCP | `[IMPLEMENTED]` | Retained |
| Local tool fallbacks | `[IMPLEMENTED]` | Retained |
| Databricks Lakebase persistence | `[IMPLEMENTED]` | Retained + feedback + memory tables |
| FastAPI REST API | `[IMPLEMENTED]` | Retained + feedback endpoint |
| LLM retry framework | `[IMPLEMENTED]` | Retained |
| LLM observability | `[IMPLEMENTED]` | Extended with skill-level telemetry |
| Lightweight Prompt Optimizer | `[IMPLEMENTED]` | Evolved (feedback-driven, versioned) |
| Named Skill abstraction | — | `[DESIGNED]` |
| SkillRegistry | — | `[DESIGNED]` |
| Skill Planner | — | `[DESIGNED]` |
| Human Feedback | — | `[DESIGNED]` |
| Memory / context retrieval | — | `[DESIGNED]` |
| Historical analysis intelligence | — | `[DESIGNED]` |
| Feedback-driven recommendations | — | `[DESIGNED]` |
| Skill versioning | — | `[DESIGNED]` |
| Skill composition | — | `[DESIGNED]` |
| Advanced Prompt Optimization | — | `[PLANNED]` (GEPA/DSPy) |
| Personalized recommendations | — | `[PLANNED]` |
| More MCP providers | — | `[PLANNED]` |

---

## 20. V2 Implementation Priority

The recommended implementation order for V2, explaining the rationale:

| Phase | Deliverable | Rationale |
|---|---|---|
| **Phase 1** | Skill contract + abstract base class + SkillRegistry | Foundation; nothing else can be built without this |
| **Phase 2** | `solution_discovery` Skill | Highest-value migration; replaces ad-hoc capability calls in `ResearchAgent` |
| **Phase 3** | `solution_evaluation` Skill | Second-highest value; enables independent evaluation testing |
| **Phase 4** | `license_compliance` + `security_assessment` Skills | Fills evidence gaps that currently produce `UNKNOWN` scores in evaluations |
| **Phase 5** | `architecture_research` Skill | Enables better cloud/infrastructure component decisions |
| **Phase 6** | `solution_comparison` + `technology_recommendation` Skills | Composite skills; require Phase 2–5 to be stable |
| **Phase 7** | `reuse_decision` + `architecture_blueprint` + `validation` Skills | Completes the full skill coverage of all 7 agents |
| **Phase 8** | Skill Planner | Requires all skills to be stable and testable |
| **Phase 9** | Memory / Context Retrieval | Requires stable Skill Planner and defined feedback schema |
| **Phase 10** | Human Feedback (API + storage + application) | Requires Memory layer to be in place |
| **Phase 11** | Feedback-driven Prompt Optimization | Requires human feedback to have accumulated enough signals |

**Why this order?**

Skills must precede the Skill Planner (Phase 8) because the Planner needs concrete skills to select from. Memory (Phase 9) must precede Human Feedback (Phase 10) because feedback signals need a storage and retrieval substrate. Prompt Optimization evolution (Phase 11) is last because it requires accumulated feedback signal volume to be meaningful.

---

## 21. Current Status Summary

```
V1 IMPLEMENTED
──────────────────────────────────────────
✅ LangGraph multi-agent workflow
✅ UnifiedToolGateway
✅ GitHub MCP + Tavily MCP
✅ Local tool fallbacks
✅ Databricks Lakebase persistence
✅ FastAPI REST API
✅ LLM retry framework (3 retries, exp backoff, 413 compaction)
✅ LLM observability (token metrics, latency, cost, dual logs)
✅ Lightweight Prompt Optimizer

V2 DESIGNED — NOT IMPLEMENTED
──────────────────────────────────────────
📐 Skills runtime (base class, registry, 7 initial skills)
📐 Skill Planner
📐 Human Feedback (API endpoint, storage, signal application)
📐 Memory / context retrieval
📐 Skill versioning
📐 Skill composition

PLANNED — NOT YET SPECIFIED
──────────────────────────────────────────
📋 Advanced Prompt Optimization (GEPA/DSPy)
📋 Personalized recommendations
📋 Additional MCP providers
📋 Feedback-driven learning models
```

---

## 22. Relationship to Existing Documentation

| Document | Relationship to Skills Architecture |
|---|---|
| [architecture.md](architecture.md) | V1 system architecture. Skills add a new layer between agents and gateway. |
| [agent_workflow.md](agent_workflow.md) | Current LangGraph DAG. Skills are invoked by agents within this pipeline. |
| [mcp.md](mcp.md) | MCP/Gateway layer. Skills invoke this layer; they never replace or bypass it. |
| [mcp_tool_specification.md](mcp_tool_specification.md) | Individual tool contracts. Skills compose from these tools. |
| [agent_specification.md](agent_specification.md) | Agent responsibilities. Skills are not agents; agents select and invoke skills. |
| [api.md](api.md) | Current API. V2 adds `POST /api/v1/analyses/{id}/feedback`. |
| [llm_observability.md](llm_observability.md) | LLM metrics infrastructure. Skill telemetry will extend this. |

---

*Last updated: 2026-08-19*
*Status: DRAFT — Design Document Only*
*Version: 2.0-draft*
