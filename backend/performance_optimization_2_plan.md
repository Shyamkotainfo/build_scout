# Performance Optimization 2: Bounded Parallel Execution Plan

## 1. Current Execution Flow & Sequential Bottlenecks

### `ResearchAgent`
- **Components are sequential:** `COMP-001` completes before `COMP-002` starts.
- **Tools are sequential:** For a component, it loops through `capabilities` (e.g., `github.search`, then `web.search`).
- **Impact:** With `web.search` taking ~4–7 seconds and 8 components, this results in an unavoidable 32-56 second delay just from sequential blocking.

### `EvaluationAgent`
- **Evidence fetching is sequential:** It loops through all 31 candidates one by one, calling `security.get` and `license.get` synchronously.
- **LLM inference is monolithic:** All 31 candidates across 8 components are evaluated in one massive LLM call, which blocks for ~94 seconds.

## 2. Safe Parallelization Opportunities

### In `ResearchAgent`
1. **Concurrent Components:** Use `asyncio.Semaphore(RESEARCH_CONCURRENCY)` to research components in parallel.
2. **Concurrent Tool Calls:** Inside `_research_component`, use `asyncio.gather` to fire independent capabilities (`web.search`, `github.search`, `license.get`) concurrently.

### In `EvaluationAgent`
1. **Concurrent Evidence Fetching:** Use `asyncio.Semaphore(EVIDENCE_CONCURRENCY)` to fetch security and license data for candidates concurrently.
2. **Concurrent LLM Evaluations (Batched by Component):** Group candidates by component and evaluate each group concurrently.
   - Use `asyncio.Semaphore(EVALUATION_CONCURRENCY)` to bound concurrent LLM calls.

## 3. Unsafe Operations (Must Remain Sequential)
- **Agent Pipeline Order:** The logic must remain strictly sequential (`Research` completes fully before `Evaluation` starts).
- **State Writes:** Parallel tasks must return values rather than mutating the shared `state` dictionary to prevent race conditions. The caller (`_arun`) will collect, sort, and explicitly append.
- **Trace Integrity:** The aggregated traces must be sorted deterministically before persistence.

## 4. Proposed Concurrency Limits
To avoid rate limits and memory spikes, bounded semaphores will be introduced (either in settings or safely defaulted):
- `RESEARCH_CONCURRENCY = 4` 
- `EVALUATION_CONCURRENCY = 4` 
- `EVIDENCE_CONCURRENCY = 10` 

## 5. Expected Impact & Risks
- **Expected Impact:** Research runtime should drop by >50%. Evaluation runtime should drop by >50%.
- **Risks:** Hitting Groq API rate limits due to parallel LLM calls, and trace non-determinism.

## 6. Verification Strategy
1. **Run Unit Tests:** Ensure schemas remain valid and tests pass.
2. **Run E2E Benchmark:** Execute `performance_opt2_parallel` run.
3. **Report Results:** Summarize differences in `backend/performance_optimization_2_parallel.md`.
