# BuildSmart — Evaluation Plan

## 1. Purpose

The evaluation plan measures whether BuildSmart actually solves the intended problem:

> Given a new solution requirement, can BuildSmart identify useful reusable assets, evaluate them responsibly, make defensible Build / Reuse / Adapt decisions, and produce a consistent implementation blueprint?

---

## 2. Evaluation Layers

```text
Input Understanding
        ↓
Component Decomposition
        ↓
Candidate Retrieval
        ↓
Candidate Relevance
        ↓
Evidence Quality
        ↓
Evaluation Quality
        ↓
Decision Quality
        ↓
Blueprint Consistency
        ↓
Agent Reliability
```

---

## 3. Test Dataset

Create a small synthetic benchmark for the hackathon.

Recommended:

```text
10 solution ideas
5–10 expected components per idea
3–5 expected reusable candidates per important component
```

Examples:

```text
AI document intelligence
AI customer support assistant
Image classification service
RAG knowledge assistant
API observability platform
Data quality monitoring platform
Invoice extraction system
Semantic search platform
Meeting intelligence platform
Developer documentation assistant
```

Do not include confidential internal projects.

---

## 4. Metric 1 — Component Identification Accuracy

Measures whether the Decomposition Agent identifies the important technical capabilities.

### Formula

```text
Component Recall =
Correct Expected Components / Total Expected Components
```

Also measure precision:

```text
Component Precision =
Correct Identified Components / Total Identified Components
```

Target:

```text
Recall ≥ 85%
Precision ≥ 80%
```

---

## 5. Metric 2 — Candidate Relevance

For each component, evaluate the top candidates.

Human evaluator gives:

```text
0 = irrelevant
1 = weak
2 = useful
3 = strong
4 = excellent
```

Calculate:

```text
Average Top-3 Relevance
```

Target:

```text
≥ 3.0 / 4
```

---

## 6. Metric 3 — Evidence Coverage

Measures how many important factual claims have supporting evidence.

Formula:

```text
Evidence Coverage =
Supported Claims / Total Factual Claims
```

Target:

```text
≥ 90%
```

Important claims include:

```text
License
Project activity
Compatibility
Security signal
Release information
Architecture capability
```

---

## 7. Metric 4 — Decision Quality

Human reviewers classify the final decision:

```text
Correct
Acceptable
Incorrect
```

Evaluate:

```text
REUSE accuracy
ADAPT accuracy
BUILD accuracy
```

Target:

```text
≥ 80% correct/acceptable
```

---

## 8. Metric 5 — Decision Consistency

Check whether the final decision is logically consistent with evaluation scores.

Examples:

```text
High compatibility
High health
Low risk
Good license
        ↓
REUSE
```

Potential inconsistency:

```text
Low compatibility
Critical security issue
        ↓
REUSE
```

Target:

```text
≥ 95% internally consistent
```

---

## 9. Metric 6 — Blueprint Consistency

The Blueprint Agent must use the selected decisions.

Check:

```text
Every REUSE candidate appears in blueprint where relevant.
ADAPT components show customization.
BUILD components are represented as custom development.
```

Target:

```text
≥ 95%
```

---

## 10. Metric 7 — Effort Estimation

For the hackathon, effort is a comparative estimate.

Measure:

```text
Estimated from-scratch effort
Estimated reuse effort
```

The objective is not to prove exact project duration.

Instead:

> Does the model identify where reuse can remove implementation work?

---

## 11. Metric 8 — Agent Reliability

Track:

```text
Agent completion rate
Tool success rate
Validation pass rate
Retry rate
Average tool calls
Average analysis latency
```

Suggested MVP targets:

```text
Agent completion       ≥ 95%
Tool success           ≥ 90%
Validation pass        ≥ 90%
```

---

## 12. Metric 9 — Hallucination / Unsupported Claims

Create a manual evaluation:

```text
Total externally verifiable claims
Supported claims
Unsupported claims
Contradictory claims
```

Formula:

```text
Unsupported Claim Rate =
Unsupported Claims / Total Claims
```

Target:

```text
< 10%
```

For high-risk claims such as license/security, target substantially lower.

---

## 13. Metric 10 — Agentic Behavior

The hackathon should explicitly demonstrate that agents are using tools and reasoning rather than only generating a static response.

Evaluate whether the trace shows:

```text
Planning
Delegation
Tool selection
Evidence gathering
Additional research when needed
Decision
Validation
Correction / retry when required
```

A simple score:

| Behavior | Points |
|---|---:|
| Planning | 1 |
| Delegation | 1 |
| Tool selection | 1 |
| Evidence gathering | 1 |
| Iteration | 1 |
| Decision | 1 |
| Validation | 1 |

Target:

```text
≥ 6 / 7
```

---

## 14. Golden Test Example

### Input

```text
Build an AI document intelligence platform with PDF ingestion,
semantic search and an API.
```

Expected components:

```text
DOCUMENT_INGESTION
DOCUMENT_PARSING
CHUNKING
EMBEDDING
VECTOR_DATABASE
RETRIEVAL
LLM
API
```

Expected decision pattern:

```text
Generic infrastructure:
REUSE / ADAPT where suitable.

Business-specific rules:
BUILD.
```

The exact project names should not be hard-coded because external ecosystem information changes.

---

## 15. Evaluation Test Cases

### Test 1 — Clear reuse opportunity

Input:

```text
Build a Python API.
```

Expected:

```text
API
→ strong existing frameworks
→ REUSE / ADAPT
```

### Test 2 — Domain-specific requirement

Input:

```text
Build a proprietary business scoring engine.
```

Expected:

```text
Domain logic
→ BUILD
```

### Test 3 — License risk

Candidate has an incompatible/restricted license for the intended use.

Expected:

```text
Do not recommend blind REUSE.
Potential ADAPT / BUILD / review.
```

### Test 4 — Security risk

Candidate has serious security concerns.

Expected:

```text
High risk
→ avoid automatic REUSE
```

### Test 5 — No good candidate

Expected:

```text
BUILD
```

with explicit evidence that the search did not identify a suitable candidate.

### Test 6 — Conflicting sources

Example:

```text
README says active.
Repository activity says inactive.
```

Expected:

```text
Flag conflict.
Reduce confidence.
Request/perform additional verification.
```

---

## 16. Evaluation Harness

Recommended structure:

```text
evaluation/
├── test_cases.json
├── expected_results.json
├── run_evals.py
└── reports/
```

Example `test_cases.json`:

```json
[
  {
    "id": "TC-001",
    "input": "Build an AI document intelligence platform",
    "expected_components": [
      "DOCUMENT_PARSING",
      "EMBEDDING",
      "VECTOR_DATABASE",
      "RETRIEVAL",
      "API"
    ]
  }
]
```

---

## 17. Human Evaluation Form

For each result:

```text
Candidate relevance:       0–4
Evidence quality:          0–4
Decision quality:          0–4
Rationale quality:         0–4
Blueprint usefulness:      0–4
Overall usefulness:        0–4
```

Add:

```text
Would you trust this recommendation as a starting point?
YES / NO

What was missing?
____________________
```

---

## 18. Benchmark Report

Final report should contain:

```text
Test cases                  10
Component recall            91%
Candidate relevance         3.5 / 4
Evidence coverage           94%
Decision quality             88%
Decision consistency         96%
Blueprint consistency        97%
Tool success                 93%
Validation pass              95%
Unsupported claim rate        4%
```

Numbers above are examples only and must be replaced by actual evaluation results.

---

## 19. Regression Testing

After every major agent/prompt/tool change:

```text
Run decomposition tests
Run candidate retrieval tests
Run decision tests
Run validation tests
Run end-to-end demo
```

Keep the benchmark fixed so improvements can be compared.

---

## 20. Production Readiness Gap

The hackathon evaluation is not a production security/compliance certification.

Before enterprise deployment, add:

```text
Private source access control
Enterprise license policy
SBOM analysis
Dependency vulnerability scanning
Human approval for high-risk adoption
Audit retention
RBAC
Data classification
Prompt-injection defense
MCP server trust verification
Vendor/source governance
```

---

## 21. Final Success Definition

BuildSmart succeeds when a reviewer can provide a new solution idea and observe:

```text
The system understood the idea.
        ↓
It decomposed the solution.
        ↓
It autonomously selected research tools.
        ↓
It found credible reusable candidates.
        ↓
It gathered evidence.
        ↓
It made a defensible REUSE / ADAPT / BUILD decision.
        ↓
It explained why.
        ↓
It generated a consistent implementation blueprint.
        ↓
It validated the result.
```

That is the core evaluation definition for the hackathon.
