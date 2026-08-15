# BuildSmart — Demo Scenario Walkthrough

## 1. Demo Objective

Demonstrate that BuildSmart can take a new solution idea and autonomously answer:

> What can we reuse instead of building from scratch?

The demo should show agentic behavior, not just a search result.

---

## 2. Demo Scenario

User enters:

> "I want to build an AI document intelligence platform that accepts PDF documents, extracts text, creates embeddings, performs semantic search and exposes an API."

---

## 3. Step 1 — User Input

Frontend displays:

```text
BUILDSMART

What do you want to build?

[ I want to build an AI document intelligence platform... ]

              [ Analyze Solution ]
```

API:

```http
POST /api/v1/analyses
```

Response:

```json
{
  "analysis_id": "...",
  "status": "CREATED"
}
```

---

## 4. Step 2 — Supervisor Agent

The Supervisor creates the plan:

```text
1. Decompose requirement.
2. Identify technical components.
3. Research reusable candidates.
4. Evaluate candidates.
5. Make Build/Reuse/Adapt decisions.
6. Generate implementation blueprint.
7. Validate final result.
```

UI:

```text
✓ Supervisor created analysis plan
● Decomposing solution
○ Research
○ Evaluation
○ Decision
○ Blueprint
○ Validation
```

---

## 5. Step 3 — Decomposition Agent

The Decomposition Agent produces:

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

Important:

The agent has identified capabilities, not implementation choices.

---

## 6. Step 4 — Research Agent

The Research Agent decides which tools are needed.

Example:

```text
DOCUMENT_PARSING
    → GitHub MCP
    → Package Metadata
    → Documentation

VECTOR_DATABASE
    → GitHub MCP
    → Web Search
    → Documentation

API
    → GitHub MCP
    → Documentation
```

The Research Agent calls the tools.

Example GitHub query:

```text
Python PDF parser
```

Potential candidates:

```text
Candidate A
Candidate B
Candidate C
```

The exact live candidates must be retrieved during the demo and not hard-coded.

---

## 7. Step 5 — Candidate Enrichment

For each top candidate:

```text
Repository
Language
Release activity
License
Documentation
Security signals
Adoption
Maintenance
```

The system stores evidence.

UI:

```text
Candidate: <Project>

Compatibility     94
Health             89
Security           91
License            95
Maintenance        90

Evidence: 8 sources
```

---

## 8. Step 6 — Evaluation Agent

The Evaluation Agent investigates the strongest candidates.

It may decide:

```text
Need license evidence.
→ License Tool

Need security evidence.
→ Security Tool

Need recent release information.
→ Package Tool

Need capability confirmation.
→ Documentation Tool
```

This is one of the key agentic moments in the demo.

---

## 9. Step 7 — Decision Agent

Example output:

| Component | Decision | Candidate | Confidence |
|---|---|---|---:|
| PDF Parsing | REUSE | Candidate A | 94% |
| OCR | ADAPT | Candidate B | 81% |
| Chunking | REUSE | Candidate C | 87% |
| Vector DB | REUSE | Candidate D | 92% |
| Retrieval | REUSE | Candidate E | 85% |
| Domain Classification | BUILD | None | 89% |

The actual project names must come from the live research results.

---

## 10. Step 8 — Explainability

Clicking a decision shows:

```text
WHY REUSE?

Compatibility       94
Project Health      89
Security            91
License             95
Maintenance         90

Decision             REUSE

Evidence
✓ Official documentation supports required capability
✓ Repository is active
✓ License evidence available
✓ Package metadata verified

Risk
LOW
```

This is the strongest differentiator from a generic AI search engine.

---

## 11. Step 9 — Blueprint Agent

The Blueprint Agent uses the actual decisions.

Example:

```text
User
  ↓
API
  ↓
Document Ingestion
  ↓
PDF Parser       [REUSE]
  ↓
OCR              [ADAPT]
  ↓
Chunking         [REUSE]
  ↓
Embedding
  ↓
Vector Database  [REUSE]
  ↓
Retrieval        [REUSE]
  ↓
LLM
  ↓
Response
```

---

## 12. Step 10 — Effort Estimation

Example:

```text
Estimated implementation

From scratch:       40 days
With reuse:         22 days

Potential saving:   18 days
                    45%
```

This should be presented as an estimate, not a guarantee.

---

## 13. Step 11 — Validation Agent

Validation checks:

```text
✓ Candidate URLs verified
✓ License evidence available
✓ Security evidence collected
✓ Decision matches evaluation
✓ Blueprint matches decisions
✓ No unsupported technology claims
✓ Effort calculation consistent
```

If a check fails:

```text
Validation failed
      ↓
Supervisor
      ↓
Relevant agent
      ↓
Correction
      ↓
Validation
```

---

## 14. Step 12 — Final Result

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILDSMART REUSE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Components identified: 10

REUSE     6
ADAPT     2
BUILD     2

Reuse confidence: 87%

Estimated effort:
From scratch: 40 days
With reuse:   22 days

Estimated reduction: 45%

Top risks:
• License compatibility
• OCR customization
• Domain-specific classification

Status:
VALIDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 15. Agent Trace for Judges

Show a collapsible trace:

```text
Supervisor Agent
  └── Created plan

Decomposition Agent
  └── Identified 10 components

Research Agent
  ├── GitHub MCP → 25 candidates
  ├── Web Search → 12 candidates
  └── Package Tool → 8 candidates

Evaluation Agent
  ├── License Tool → 10 checks
  ├── Security Tool → 10 checks
  └── Documentation → 14 checks

Decision Agent
  ├── REUSE → 6
  ├── ADAPT → 2
  └── BUILD → 2

Blueprint Agent
  └── Generated architecture

Validation Agent
  └── 18 checks passed
```

---

## 16. Demo Script

### Opening

> "Before a team builds a new solution, the first question should not be 'How do we code it?' It should be 'What can we reuse?'"

### Input

> "Let's ask BuildSmart to design an AI document intelligence platform."

### During execution

Point out:

> "Notice that BuildSmart is not simply searching GitHub. The Research Agent is deciding which tools to use, and the Evaluation Agent is requesting additional evidence."

### Decision

> "BuildSmart has determined which components can be reused, which need adaptation, and which are genuinely domain-specific."

### Blueprint

> "It now turns those decisions into an implementation blueprint and estimates the potential effort reduction."

### Closing

> "BuildSmart moves reuse discovery from an ad-hoc developer activity to an agentic engineering workflow."

---

## 17. What Not to Claim

Do not claim:

```text
100% correct
Guaranteed cost savings
Guaranteed security
Guaranteed license compliance
```

Use:

```text
Evidence-backed recommendation
Estimated effort
Confidence score
Risk indicators
Human review recommended for production adoption
```

---

## 18. Demo Success Criteria

The demo is successful if judges can see:

1. Natural-language solution input.
2. Agent decomposition.
3. Real tool calls.
4. Candidate discovery.
5. Evidence gathering.
6. Build / Reuse / Adapt decision.
7. Explainable rationale.
8. Architecture blueprint.
9. Effort comparison.
10. Validation trace.
