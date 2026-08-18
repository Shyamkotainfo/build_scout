# LLM Observability & Token Metrics

BuildSmart includes a centralized LLM Observability framework that ensures comprehensive tracking of AI agent behavior, token usage, latency, and cost without modifying the underlying agent implementation loops.

## Core Features
1. **Centralized Retry & Metrics Hooks**: All LLM calls route through `backend/llm/retry.py`, which is instrumented to capture token metrics, statuses, and exceptions.
2. **Analysis-scoped Correlation**: Every LLM invocation is mapped directly to the active `analysis_id`.
3. **Dual Log Architecture**:
   - `buildsmart.log`: Contains full application traces, errors, and metadata.
   - `llm_tokens.log`: A JSON Lines (JSONL) file specifically for machine-readable token events.
4. **Lakebase Persistence**: Metrics are aggregated and stored permanently in Databricks Lakebase, attached to the `AnalysisResultResponse` schema via the `LLMCall` model.
5. **Cost Calculation**: Tracks exact cost dynamically using customizable USD pricing via `settings.py`.

## Configuration
LLM Metrics are configured via environment variables in `backend/config/settings.py`:
- `BUILDSMART_FULL_LOG_FILE`: Path to the standard application log (e.g., `logs/buildsmart.log`).
- `BUILDSMART_TOKEN_LOG_FILE`: Path to the JSONL token log (e.g., `logs/llm_tokens.log`).
- `INPUT_PRICE_PER_1M_TOKENS`: USD cost per 1M input tokens.
- `OUTPUT_PRICE_PER_1M_TOKENS`: USD cost per 1M output tokens.

## Architecture & Flow
1. **Agents**: Pass `analysis_id` into `invoke_with_retry` / `ainvoke_with_retry`.
2. **Retry Service**: Computes tokens from `response_metadata` and triggers `record_llm_call`.
3. **Metrics Collector**: In-memory aggregator (`metrics.py`) stores calls during an analysis.
4. **Analysis Service**: Upon graph completion, extracts `aggregate_workflow_metrics()`, cleans memory, and attaches the summary to the `AnalysisResultResponse`.
5. **Repositories**: Inspects `_llm_calls` in the final state and inserts individual `LLMCall` records into Lakebase.

## Secrets & PII Protection
The LLM Metrics collector explicitly filters out raw prompts, secrets, and environment variables. Only metadata (token counts, latency, attempt count, model) is logged to the `buildsmart_token` and `buildsmart_full` targets.
