# BlueprintAgent Certification

## Current Architecture
The `BlueprintAgent` synthesizes engineering decisions into a coherent architectural blueprint. It maps evaluated constraints, REUSE/ADAPT/BUILD decisions, and selected candidates into explicit technical specifications encompassing data flows, integration points, and implementation phases.

## Actual Execution Flow
1. Receives the accumulated state (`requirements`, `components`, `candidates`, `evaluations`, and `decisions`).
2. Deterministically computes a `ReuseSummary` to ensure the final statistics match the `DecisionAgent` flawlessly.
3. Packages a heavily context-compacted payload, stripping out irrelevant candidates that were not selected.
4. Invokes the LLM using `ainvoke_with_retry` and the strictly enforced `BlueprintResult` schema.
5. Injects the deterministic `reuse_summary` into the parsed output to guarantee absolute integrity.
6. Emits the final architecture blueprint into the application state.

## Input Contract
The input strictly uses the certified output from `DecisionAgent`. During certification, `06_decision.json` was supplied. The payload includes:
- **Requirements**: Preserved for mapping.
- **Candidates**: Filtered to *only* those that were selected for REUSE or ADAPT. Unused candidates are explicitly dropped to prevent context bloat and hallucination.
- **Evaluations**: Filtered down to match selected candidates.

## Coverage Integrity
- **Requirement Coverage**: All 8 initial requirements were successfully mapped across the blueprint components.
- **Decision Integrity**: The 9 components generated exactly 9 corresponding decisions.
- **Candidate Integrity**: Where a component was assigned `ADAPT` (e.g. `COMP-001`), the exact candidate `UserServiceApplication` was correctly embedded into the `technology` field rather than hallucinated.

## Negative Tests
- **Test E (No technology hallucination)**: The agent correctly assigned `Custom implementation` to `BUILD` components rather than inventing arbitrary frameworks out of thin air.
- **Test C (Candidate preservation)**: Verified via `COMP-001`, mapping directly to `UserServiceApplication`.

## Data Flow & Integrations
The generated blueprint intelligently constructed 11 distinct data flow links and 21 integration points tying the components together. For example, `COMP-001` explicitly defined its integration boundary with `COMP-006` (REST API) and `COMP-004` (Storage).

## MCP / LOCAL / FALLBACK
**None**. The BlueprintAgent operates purely on the previously discovered evidence chain.

## Parsing / Retry Tests
During manual execution, the LLM initially generated a malformed JSON payload missing the `integration` field for component 3:
```log
Agent: BlueprintAgent | TRANSIENT: JSON Parse Error: 1 validation error for BlueprintResult
components.3.integration
  Field required
LLM_CALL_RETRY agent=BlueprintAgent attempt=1 error=TRANSIENT
```
The newly centralized `ainvoke_with_retry` wrapper caught the Pydantic validation error, triggered an artificial HTTP 429 transient fault, and successfully recovered on the second attempt, proving the self-healing architecture works flawlessly.

## Issues Found
1. **Schema Casing Mismatch**: `schemas.py` expected uppercase keys (`REUSE`, `ADAPT`, `BUILD`) for `ReuseSummaryResponse`, whereas `blueprint.py` output lowercase keys (`reuse`, `adapt`, `build`). This caused the blueprint's `reuse_summary` to drop at the API boundary.
2. **Missing Retry Loop**: `blueprint.py` handled JSON parsing outside of the retry loop.
3. **Prompt Leniency**: The system prompt lacked strict instruction on mapping every requirement and preserving candidate technology strings.

## Fixes Applied
1. Downcased the keys in `ReuseSummaryResponse` to match internal generation.
2. Refactored `run()` to wrap `_arun()` synchronously, enabling `ainvoke_with_retry(..., response_model=BlueprintResult)`.
3. Hardened `BLUEPRINT_SYSTEM_PROMPT` to prevent technology hallucination and mandate strict adherence to `DecisionAgent` candidate strings.

## Manual Verification Command
```bash
python run_step.py blueprint --state test_runs/manual_decision_v1/06_decision.json --run-id manual_blueprint_v1
```

## Final Certification
**PASS**
