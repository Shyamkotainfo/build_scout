# BuildScout Backend Performance Optimization Plan

## Status

**Planned — execute after frontend work is complete.**

Current certified baseline:
- Full E2E runtime: ~7 minutes
- Total tokens: 100K+
- Requirements: 9
- Components: 8
- Candidates: 20
- Evaluations: 20
- MCP / LOCAL / FALLBACK: 16 / 48 / 0
- Full pipeline: PASS

## Objective

Reduce BuildScout runtime and token usage without reducing evidence quality, real MCP/tool usage, agent responsibilities, REUSE / ADAPT / BUILD reasoning, validation quality, observability, or API/frontend compatibility.

Do not remove agents or replace LLM reasoning with hardcoded decisions.

## 1. Research Context Compaction

Keep raw tool responses for traces/observability, but create compact candidate/evidence representations for LLM reasoning.

Retain useful fields such as:
- candidate name
- URL
- description
- source
- stars
- language
- license
- last updated
- relevant evidence
- relevance reason

Avoid passing raw search payloads between agents.

Do not use blind string slicing that can cut JSON or evidence in the middle.

## 2. Candidate Shortlisting

Research can discover multiple candidates, but Evaluation does not need to deeply evaluate every candidate.

Planned flow:

```text
Search → Discover → Deduplicate → Deterministic ranking → Top 3–5/component → Deep Evaluation
```

Missing metadata must not automatically eliminate a candidate. Never fabricate metadata.

## 3. Security and License Checks

Perform expensive security/license checks only for shortlisted candidates.

```text
Candidates → Shortlist → Security + License evidence → Evaluation
```

Evidence must remain real and traceable. Missing evidence must remain explicit.

## 4. Compact Agent State

Each downstream agent should receive only what it needs.

**Evaluation:** requirements, component, shortlisted candidates, candidate evidence, relevant metadata.

**Decision:** requirements, component, shortlisted candidates, evaluation scores, strengths, concerns, missing evidence.

**Blueprint:** requirements, components, final decisions, selected candidates, important trade-offs.

**Validation:** requirements, component mapping, decisions, blueprint.

Do not repeatedly carry raw research/tool payloads through the entire state.

## 5. Deterministic Work vs LLM Work

Use Python for:
- deduplication
- URL normalization
- filtering
- sorting
- candidate limits
- metadata extraction
- counting
- structural validation

Use LLM reasoning for:
- semantic relevance
- candidate comparison
- trade-offs
- evaluation reasoning
- REUSE / ADAPT / BUILD decisions
- architecture synthesis
- semantic validation

## 6. Bounded Parallel Evaluation

Independent candidate evaluations can potentially run concurrently.

Use bounded async concurrency, respecting provider rate limits and existing retry behavior. Do not create unlimited parallel calls.

## 7. Better Research Queries

Evaluate query generation using:
- component name
- component description
- relevant requirements
- user constraints
- preferred technologies
- domain terminology

Goal: fewer, more targeted searches with less irrelevant evidence.

## 8. Token and Latency Telemetry

Preserve or improve telemetry for:
- input tokens
- output tokens
- total tokens
- latency
- LLM call count
- tool call count
- candidate count
- retry count
- context size

Produce a before/after benchmark.

## 9. Research Caching

Investigate caching repeated/equivalent research requests.

Potential key:

```text
normalized component + research query + relevant constraints
```

Use freshness rules. Never present stale security/license information as current.

## 10. Evidence Store / Reference-Based State

Consider a later optimization where large evidence objects are stored separately and agents pass compact references:

```text
candidate_id
evidence_id
evaluation_id
decision_id
```

Implement only after measuring whether state size is a major bottleneck.

## 11. Target Performance

Goals only; do not guarantee them before benchmarking.

| Metric | Current | Target |
|---|---:|---:|
| Full E2E runtime | ~7 min | ~2–3 min |
| Total tokens | 100K+ | ~30–50K |
| Candidates discovered | 20 | ~20 |
| Candidates deeply evaluated | 20 | ~3–5/component |
| Security/license checks | Broad | Shortlisted |
| Blueprint context | Large | Compact |
| Validation context | Large | Compact |

## 12. Implementation Order

After frontend completion:

1. Establish repeatable baseline.
2. Measure per-agent tokens/latency.
3. Optimize Research context.
4. Add candidate shortlisting.
5. Restrict security/license checks to shortlisted candidates.
6. Compact downstream state.
7. Add bounded parallel evaluation.
8. Improve research queries.
9. Evaluate caching.
10. Consider reference-based evidence storage.
11. Run the same E2E benchmark.
12. Compare before vs after.
13. Run regression tests.
14. Re-certify the full pipeline.

## 13. Quality Gates

Optimization is successful only if:
- Full pipeline completes successfully.
- Requirements/components are preserved.
- Candidates remain evidence-backed.
- Security/license evidence is not fabricated.
- REUSE / ADAPT / BUILD remains evidence-based.
- Blueprint remains consistent.
- Validation remains meaningful.
- MCP/tool traces remain available.
- API/frontend contracts remain compatible.
- Runtime and token usage decrease.

A faster pipeline with worse decisions is **not** an acceptable optimization.

## 14. Manual Benchmark Command

Use the existing certified prompt and step runner:

```bash
cd /Users/Shyam/Desktop/Hackathon_2026/build_scout/backend

PYTHONPATH=. .venv/bin/python run_step.py   prompt_optimizer supervisor decomposition research evaluation decision blueprint validation   --prompt "Build an AI document intelligence platform using AWS. It should allow users to upload PDF documents, extract text using OCR, store documents securely, provide semantic search and question answering using RAG, support user authentication, and expose APIs for integration with other enterprise systems. Prefer reusable open-source solutions where appropriate, but ensure the selected components have suitable licenses and acceptable security/maturity."   --run-id performance_benchmark
```

Inspect:

```bash
python -m json.tool test_runs/performance_benchmark/08_validation.json
```

## 15. Required Final Report

After optimization, create:

`backend/performance_optimization_report.md`

Include:
- baseline vs optimized runtime
- baseline vs optimized tokens
- per-agent comparison
- tool-call comparison
- candidate/evaluation counts
- REUSE / ADAPT / BUILD comparison
- validation score comparison
- quality regressions
- remaining bottlenecks
- exact manual reproduction command

## Important Project Constraint

**Do not implement these optimizations yet. Frontend development comes first.**

This document is the backlog/reference plan for the backend performance optimization phase after the frontend is completed.
