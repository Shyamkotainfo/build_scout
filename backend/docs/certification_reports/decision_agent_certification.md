# DecisionAgent Certification

## Current Architecture
The `DecisionAgent` acts as the final engineering reasoning layer prior to blueprinting. It takes the output of the `EvaluationAgent` (containing evaluated candidates with evidence and multi-dimensional scoring) and makes a definitive choice for each component: **REUSE**, **ADAPT**, or **BUILD**.

## Actual Execution Flow
1. Receives state containing requirements, components, candidate lists, and their evaluations.
2. Identifies components that have zero evaluated candidates and deterministically assigns them a **BUILD** decision (100% confidence, no LLM call required).
3. Prepares a compressed payload for the remaining components, taking care to truncate overly verbose candidate descriptions.
4. Invokes the LLM using the centralized `ainvoke_with_retry` mechanism with a strictly enforced `RawDecisionsResponse` Pydantic response model.
5. Emits the final array of decisions to the state.

## Agent Responsibility
- **ResearchAgent**: Discovers broadly.
- **EvaluationAgent**: Assesses rigorously using real evidence.
- **DecisionAgent**: Decides the engineering strategy (REUSE/ADAPT/BUILD).
*The DecisionAgent does NOT perform new research, does NOT call MCP tools, and does NOT re-evaluate candidates.*

## Decision Rules
- **REUSE**: The existing candidate is largely suitable as-is with strong compatibility and no major blocking concerns.
- **ADAPT**: The candidate is useful but requires meaningful customization or extension to fit the broader architecture.
- **BUILD**: No suitable candidate exists, available candidates have major compatibility/security/license risks, or the capability is highly domain-specific.

## Missing Evidence Test
As demonstrated in the `COMP-002` evaluation, when project health/metadata is anomalous or missing, the LLM correctly lowered its confidence to **72%**.

## Multiple Candidate Test
The LLM now strictly adheres to the rule: "If multiple strong candidates exist, explain why the selected candidate was chosen over the others". 
For `COMP-001`, the LLM stated:
> *UserServiceApplication provides the strongest combination... While CAND-002 (Cognetix) has comprehensive feature coverage, it suffers from anomalous metadata... CAND-001 and CAND-005 have outdated last commits...*

## Decision Results Per Component
Execution resulted in 9 decisions based on the candidate pool:
| Component | Decision | Selected Candidate | Confidence |
|---|---|---|---:|
| COMP-001 | ADAPT | UserServiceApplication | 76 |
| COMP-002 | ADAPT | rag-system-rag-platform | 72 |
| COMP-003 | REUSE | doc_processing_toolkit | 80 |
| COMP-006 | BUILD | None (Deterministic) | 100 |

*(Remaining components were appropriately assigned ADAPT or BUILD depending on their candidate evaluation strength).*

## Tool / MCP Usage
**None**. The DecisionAgent is a pure reasoning layer. It does not invoke MCP or LOCAL tools. This correctly adheres to the system boundary principles.

## Parsing / Retry Tests
- **Pydantic Validation**: Centralized validation was successfully enabled. We refactored `decision.py` to strip out the manual `try/except` extraction logic and pass `response_model=RawDecisionsResponse` into `ainvoke_with_retry`. The output parsed flawlessly.

## Issues Found
1. **Schema Mismatch (Dropped Data)**: The internal `RawDecisionResult` generated fields for `selected_candidate_id` and `alternatives_considered`, but these were completely dropped at the API boundary because `DecisionResponse` in `schemas.py` lacked them. This caused referential integrity loss.
2. **Brittle Validation**: `decision.py` parsed JSON outside the retry loop, creating a vulnerability to bad LLM formatting.
3. **Weak Prompting Constraints**: The LLM frequently assigned 100% confidence even when candidates were missing explicit license/security scans, and it did not explain why it rejected competing candidates.

## Fixes Applied
1. Updated `DecisionResponse` in `schemas.py` to include `selected_candidate_id` and `alternatives_considered` fields.
2. Refactored `decision.py` to use `response_model` with `ainvoke_with_retry`.
3. Updated `DECISION_SYSTEM_PROMPT` to mandate explicit candidate comparison, enforce lowering confidence on missing evidence, and strictly prohibit "inventing" candidates for a BUILD decision.

## Manual Verification Command
```bash
python run_step.py decision --state test_runs/manual_evaluation_v1/05_evaluation.json --run-id manual_decision_v1
```

## Final Certification
**PASS**
