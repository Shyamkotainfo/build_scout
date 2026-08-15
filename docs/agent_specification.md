# BuildSmart — Agent Specification

## 1. Purpose

BuildSmart is an agentic system. Agents are responsible for reasoning, planning, delegation, research, evaluation, decision-making, blueprint generation and validation.

The system contains seven agents:

```text
1. Supervisor Agent
2. Decomposition Agent
3. Research Agent
4. Evaluation Agent
5. Decision Agent
6. Blueprint Agent
7. Validation Agent
```

The agents use MCP/tools to obtain factual information.

---

## 2. Agentic Design Principles

### Agents do reasoning

Agents decide:

- What information is required.
- Which specialist should handle a task.
- Which tools are relevant.
- Whether evidence is sufficient.
- Whether another search is necessary.
- What decision is justified.
- Whether validation has passed.

### Tools provide facts

Tools provide:

- Repository metadata.
- License information.
- Security signals.
- Package information.
- Documentation.
- Search results.
- Reference architectures.

### Deterministic code enforces policy

Code should enforce:

- Score weights.
- Thresholds.
- Maximum retries.
- Tool allow-lists.
- Timeouts.
- Required fields.
- Validation rules.

---

## 3. Supervisor Agent

### Responsibility

The Supervisor is the coordinator.

It should not perform every task itself.

### Inputs

```json
{
  "analysis_id": "...",
  "user_request": "Build an AI document intelligence platform"
}
```

### Outputs

```json
{
  "plan": [
    {
      "step": 1,
      "agent": "DecompositionAgent",
      "objective": "Identify technical components"
    },
    {
      "step": 2,
      "agent": "ResearchAgent",
      "objective": "Find reusable candidates"
    }
  ]
}
```

### Responsibilities

- Understand objective.
- Create execution plan.
- Delegate.
- Monitor progress.
- Handle retries.
- Detect missing evidence.
- Trigger validation.
- Produce final response.

### Must not

- Invent repository facts.
- Invent licenses.
- Bypass validation.
- directly execute arbitrary external actions.

---

## 4. Decomposition Agent

### Responsibility

Convert the user's idea into normalized requirements and components.

### Example

Input:

```text
Build an AI document intelligence system.
```

Output:

```text
DOCUMENT_INGESTION
DOCUMENT_PARSING
OCR
CHUNKING
EMBEDDING
VECTOR_DATABASE
RETRIEVAL
LLM
API
```

### Rules

- Separate business capability from implementation choice.
- Do not choose a library yet.
- Normalize synonyms.
- Identify required versus optional components.
- Ask for clarification only when ambiguity materially changes the architecture.

---

## 5. Research Agent

### Responsibility

Find reusable candidates across public ecosystems.

### Tools

```text
GitHub MCP
Web Search
Documentation Search
Package Metadata
AWS Documentation / Architecture
```

### Behavior

For each component:

1. Generate search strategy.
2. Select relevant sources.
3. Search.
4. Collect candidate projects.
5. Deduplicate.
6. Rank initial candidates.
7. Return top candidates to Evaluation Agent.

### Example

```text
DOCUMENT_PARSING
        ↓
GitHub search
        ↓
Package search
        ↓
Documentation search
        ↓
Candidate list
```

### Must not

- Treat popularity as suitability.
- declare REUSE before evaluation.
- assume a project's license without evidence.

---

## 6. Evaluation Agent

### Responsibility

Deeply evaluate candidate projects.

### Evidence dimensions

```text
Compatibility
Health
Security
License
Adoption
Maintenance
```

### Tools

```text
Repository metadata
License Evidence
Security Evidence
Package Metadata
Documentation
```

### Output

```json
{
  "candidate": "Candidate Name",
  "scores": {
    "compatibility": 92,
    "health": 87,
    "security": 90,
    "license": 95,
    "adoption": 82,
    "maintenance": 91
  },
  "overall_score": 90.1,
  "confidence": 0.93,
  "risk": "LOW",
  "evidence_ids": ["..."]
}
```

### Important

Every score that depends on an external fact should be backed by evidence.

---

## 7. Decision Agent

### Responsibility

Make the Build / Reuse / Adapt decision.

### Decisions

```text
REUSE
ADAPT
BUILD
```

### REUSE

Use when:

- Strong compatibility.
- Acceptable security.
- Acceptable license.
- Healthy project.
- Low/acceptable integration effort.

### ADAPT

Use when:

- Strong base exists.
- Customization is required.
- Integration effort is manageable.

### BUILD

Use when:

- No strong candidate exists.
- Candidate has a blocking risk.
- Domain logic is unique.
- License/security constraints prevent use.
- Candidate fit is too weak.

### Decision output

```json
{
  "component": "DOCUMENT_PARSING",
  "decision": "REUSE",
  "candidate": "Candidate Name",
  "confidence": 0.94,
  "risk": "LOW",
  "rationale": "Strong compatibility and acceptable evidence."
}
```

### Feedback loop

If evidence is insufficient:

```text
Decision Agent
      ↓
REQUEST_MORE_EVIDENCE
      ↓
Research Agent
      ↓
Evaluation Agent
      ↓
Decision Agent
```

Bound the number of loops.

---

## 8. Blueprint Agent

### Responsibility

Generate the implementation blueprint using the actual decisions.

### Inputs

- Components.
- Candidates.
- Evaluations.
- Decisions.
- Risks.
- Evidence.

### Output

```text
Architecture
Component mapping
Integration flow
Data flow
API interfaces
Technology stack
Implementation phases
Effort estimate
Risks
```

### Critical rule

The Blueprint Agent must not independently invent technology choices that contradict Decision Agent outputs.

---

## 9. Validation Agent

### Responsibility

Validate the final result.

### Checks

```text
Candidate exists
        ↓
URL valid
        ↓
License evidence exists
        ↓
Security evidence exists where required
        ↓
Decision is consistent with score
        ↓
Blueprint uses selected components
        ↓
Effort estimate is internally consistent
```

### Failure

If validation fails:

```text
Validation Agent
      ↓
failure reason
      ↓
Supervisor
      ↓
relevant agent
      ↓
correction
      ↓
validation
```

---

## 10. Agent Communication

Use structured messages.

```json
{
  "message_type": "RESEARCH_REQUEST",
  "from_agent": "SupervisorAgent",
  "to_agent": "ResearchAgent",
  "analysis_id": "...",
  "payload": {
    "components": [
      "DOCUMENT_PARSING",
      "VECTOR_DATABASE"
    ]
  }
}
```

Recommended message types:

```text
PLAN_CREATED
DECOMPOSITION_COMPLETE
RESEARCH_REQUEST
RESEARCH_COMPLETE
EVALUATION_REQUEST
EVALUATION_COMPLETE
DECISION_REQUEST
DECISION_COMPLETE
MORE_EVIDENCE_REQUIRED
BLUEPRINT_REQUEST
VALIDATION_REQUEST
VALIDATION_FAILED
ANALYSIS_COMPLETE
```

---

## 11. Agent State

Minimum state:

```json
{
  "analysis_id": "...",
  "current_stage": "EVALUATING",
  "current_agent": "EvaluationAgent",
  "components": [],
  "candidate_ids": [],
  "decision_ids": [],
  "retry_count": 0,
  "validation_status": "PENDING"
}
```

---

## 12. Tool-Calling Policy

Agents may call only tools allowed for their role.

| Agent | Tools |
|---|---|
| Supervisor | Agent delegation |
| Decomposition | LLM / taxonomy |
| Research | GitHub, Web, Docs, Package, Cloud |
| Evaluation | Repository, License, Security, Package, Docs |
| Decision | Evidence retrieval, ranking/policy |
| Blueprint | Decision/context retrieval |
| Validation | Verification tools |

---

## 13. Agent Guardrails

- Maximum tool calls per component.
- Maximum research/evaluation loops.
- External tool timeout.
- No credential disclosure.
- No unsupported factual claims.
- Evidence required for important external facts.
- No internal/confidential sources in V1.
- Validation required before final result.
