# BuildSmart — Lightweight Prompt Optimizer

> **Status:** `[IMPLEMENTED]` — V1 lightweight hybrid approach.
>
> **File:** `backend/services/prompt_optimizer.py`
>
> **Tests:** `backend/tests/test_prompt_optimizer.py` (20 tests, all passing)

---

## 1. Purpose

Users often provide vague, ambiguous, or poorly structured requests:

> "I want some AI thing for customer support."

The **Prompt Optimizer** converts this into a clearer, structured representation before `SupervisorAgent` receives it. It extracts intent, explicit requirements, explicit constraints, and known technologies from the raw request — without ever inventing information the user did not state.

**The optimizer is NOT a LangGraph agent.** It is a preprocessing service that runs before the agent pipeline.

---

## 2. Architecture

```
POST /api/v1/analyses
    ↓
AnalysisService.analyze(user_request)
    ↓
PromptOptimizer.optimize(user_request, analysis_id)     ← NEW
    │   Step 1: Deterministic preprocessing
    │   Step 2: Optional LLM call (via invoke_with_retry)
    │   Fallback: passthrough on any failure
    ↓
BuildSmartState
    │   state["user_request"]       = original (never overwritten)
    │   state["normalized_request"] = optimized_request (if optimization succeeded)
    ↓
LangGraph graph (SupervisorAgent receives the optimized request)
    ↓
... rest of pipeline unchanged ...
```

The optimizer is surgically inserted in `AnalysisService.analyze()` between `create_initial_state()` and `graph.invoke()`. No agent code is changed.

---

## 3. Hybrid Strategy

### Step 1 — Deterministic Preprocessing

Always runs, costs zero tokens:

- Normalize whitespace runs to single spaces.
- Truncate to `MAX_REQUEST_CHARS_FOR_LLM` (2,000 chars) **for the LLM call only** — the original request is preserved in full.
- Detect trivially empty or too-short requests and skip the LLM call.

### Step 2 — Optional LLM Call

Runs only when the preprocessed request meets the minimum length threshold:

- Uses the existing `ChatGroq` instance from `backend/llm/client.py`.
- Uses the existing `invoke_with_retry` from `backend/llm/retry.py` (3 retries, exponential backoff, 413 compaction).
- Uses `response_format={"type": "json_object"}` for structured output.
- Validates the parsed JSON with Pydantic.
- Agent name is `"PromptOptimizer"` — token usage appears in `llm_tokens.log` and Lakebase under this identifier.

### Step 3 — Fallback

If the LLM call fails for any reason (network error, rate limit, invalid JSON, Pydantic validation error):

- The original request is returned unchanged as `optimized_request`.
- `intent` = `UNKNOWN`, `confidence` = `0.0`, `optimization_applied` = `False`.
- The workflow continues normally. Prompt optimization failure never blocks BuildSmart.

---

## 4. Input / Output Contract

### Input

| Parameter | Type | Description |
|---|---|---|
| `user_request` | `str` | Raw user input, 1–5,000 chars (validated by API) |
| `analysis_id` | `str` | UUID for metrics correlation |
| `feedback_context` | `str \| None` | **V2 placeholder** — reserved for human feedback integration, always `None` in V1 |

### Output — `PromptOptimizationResult`

```python
class PromptOptimizationResult(BaseModel):
    original_request: str          # Raw input, always preserved
    optimized_request: str         # Clearer version, or original on fallback
    intent: str                    # BUILD | MIGRATE | REPLACE | INTEGRATE | IMPROVE | EVALUATE | UNKNOWN
    objective: str                 # Concise one-sentence description
    requirements: list[str]        # Explicitly stated requirements only
    constraints: list[str]         # Explicitly stated constraints only
    known_technologies: list[str]  # Explicitly mentioned technologies only
    missing_information: list[str] # Info that would help BuildSmart
    confidence: float              # 0.0–1.0; 0.0 = fallback
    optimization_applied: bool     # True if LLM call succeeded
```

---

## 5. No-Hallucination Rule

This is the most important behavioral constraint:

> **NEVER invent, infer, or assume requirements, technologies, or constraints.**
> Only capture what the user explicitly stated.

### Example

User says:
```
"I want an AI chatbot."
```

**CORRECT output:**
```json
{
  "requirements": ["AI chatbot"],
  "known_technologies": [],
  "constraints": [],
  "intent": "BUILD"
}
```

**WRONG — hallucination:**
```json
{
  "known_technologies": ["AWS", "React", "PostgreSQL"],
  "constraints": ["Kubernetes"],
  "requirements": ["authentication", "RAG pipeline"]
}
```

The optimizer's system prompt enforces this explicitly with numbered rules. The `test_no_hallucinated_technologies` test verifies it.

---

## 6. State Integration

`user_request` in `BuildSmartState` is **never overwritten**. The optimized result is placed in `normalized_request`:

```python
# analysis_service.py
if opt_result.optimization_applied and opt_result.optimized_request:
    initial_state["normalized_request"] = opt_result.optimized_request
```

`SupervisorAgent` and `DecompositionAgent` naturally read `user_request` — `normalized_request` is available if they or future agents choose to use it. The API response includes both fields (`user_request` and `normalized_request`) unchanged.

---

## 7. Retry Behavior

The optimizer delegates retry handling to the existing centralized service:

```python
response = invoke_with_retry(
    llm_callable=json_llm.invoke,
    messages=messages,
    agent_name="PromptOptimizer",
    analysis_id=analysis_id,
)
```

This provides:
- Up to 3 retries (configured via `settings.llm_max_retries`)
- Exponential backoff (configurable via `settings.llm_retry_base_delay_seconds`)
- 413 context compaction (if a compactor is provided — the optimizer uses `None`)
- Automatic token and latency recording via `record_llm_call()`

No separate retry mechanism was introduced.

---

## 8. Observability

Token usage flows automatically into the existing LLM observability stack:

| Observable | Where |
|---|---|
| Token counts (input/output/total) | `llm_tokens.log` (JSONL), `buildsmart.log`, Lakebase `llm_calls` table |
| Latency (ms) | Same |
| Retry count | Same |
| Cost (USD) | Calculated via `calculate_cost()` |
| Agent name | `"PromptOptimizer"` — visible in all logs and Lakebase |
| Analysis ID | Correlated to the active analysis |

Nothing additional was implemented. Existing infrastructure handles it automatically.

**What is NOT logged:**
- Raw API keys or secrets
- Raw prompt text sent to the LLM
- Sensitive user data beyond the token counts

---

## 9. Failure Behavior Summary

| Failure Mode | Behavior |
|---|---|
| LLM call raises exception | Fallback: original request passes through |
| LLM returns invalid JSON | Fallback: original request passes through |
| Pydantic validation fails | Fallback: original request passes through |
| `optimized_request` is empty string | Fallback: original request used for `optimized_request` |
| Request too short (<5 chars) | LLM call skipped; fallback result returned |
| Any other exception | Fallback: original request passes through, error logged |

In all fallback cases, `optimization_applied = False` and `confidence = 0.0`.

---

## 10. V1 Limitations

| Limitation | Note |
|---|---|
| No conversation memory | Optimizer has no access to previous analyses |
| No user preferences | Optimizer cannot apply "prefer AWS" from previous sessions |
| Single LLM call only | No iterative prompt refinement |
| No human feedback integration | `feedback_context` parameter exists but is unused in V1 |
| No prompt versioning | The system prompt is hardcoded in `prompt_optimizer.py` |

---

## 11. V2 Future Evolution

> None of the following are implemented. Document only.

| V2 Capability | Description |
|---|---|
| **Memory-augmented optimization** | Inject relevant historical context (previous similar analyses) before the LLM call |
| **Feedback-driven optimization** | Supply user preference signals (e.g. "prefer AWS", "avoid GPL") as optional context via the `feedback_context` parameter — already reserved in the V1 signature |
| **Prompt versioning** | Version and A/B test optimizer system prompts independently of the codebase |
| **GEPA / DSPy** | Automated prompt quality improvement using gradient-based or evaluation-driven techniques |
| **Prompt quality scoring** | Measure optimizer quality from human feedback signals accumulated over time |
| **Requirement clarification** | If `missing_information` is non-empty, surface questions to the user before launching the full pipeline |

The `feedback_context: Optional[str] = None` parameter in `PromptOptimizer.optimize()` is the designed V2 extension point. In V2, the Memory layer will populate this parameter with relevant context before invoking the optimizer.

---

## 12. Files

| File | Role | Status |
|---|---|---|
| `backend/services/prompt_optimizer.py` | PromptOptimizer implementation | `[NEW]` |
| `backend/services/analysis_service.py` | Integration point | `[MODIFIED]` — optimizer called before graph.invoke() |
| `backend/tests/test_prompt_optimizer.py` | Unit tests (20 tests) | `[NEW]` |
| `docs/prompt_optimizer.md` | This document | `[NEW]` |

---

*Last updated: 2026-08-19*
*Status: IMPLEMENTED — V1*
