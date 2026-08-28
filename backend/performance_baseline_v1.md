# Performance Baseline V1

## 1. Executive Summary

- **Total Runtime**: ~6 minutes 51 seconds
- **Total Tokens**: *Not currently measurable (requires standard python logging to be enabled or DB persistence in `run_step.py`)*
- **LLM Calls**: 8
- **MCP Calls**: 16
- **LOCAL Calls**: 50
- **FALLBACK Calls**: 0
- **Validation Status**: WARNING
- **Validation Score**: 83

## 2. Per-Agent Table

| Agent | Runtime | Input Tokens | Output Tokens | Total Tokens | LLM Calls | Tool Calls |
|---|---:|---:|---:|---:|---:|---:|
| Prompt Optimizer | ~0s | N/A | N/A | N/A | N/A | 0 |
| Supervisor | ~5s | N/A | N/A | N/A | N/A | 0 |
| Decomposition | ~7s | N/A | N/A | N/A | N/A | 0 |
| Research | ~108s | N/A | N/A | N/A | N/A | 25 |
| Evaluation | ~68s | N/A | N/A | N/A | N/A | 42 |
| Decision | ~47s | N/A | N/A | N/A | N/A | 0 |
| Blueprint | ~60s | N/A | N/A | N/A | N/A | 0 |
| Validation | ~116s | N/A | N/A | N/A | N/A | 0 |

*(Note: Token counts and LLM calls are not currently measurable via `run_step.py` because it does not configure the standard python logger to print the `buildsmart_token` metrics. Instrumenting `run_step.py` with `logging.basicConfig(level=logging.INFO)` is required to capture these.)*

## 3. Research Breakdown

| Component | Candidates | Tool Calls | Raw Context | LLM Context | Runtime |
|---|---:|---:|---:|---:|---:|
| PDF_UPLOAD_AND_FILE_MANAGEMENT | 5 | 3 | N/A | N/A | N/A |
| OCR_AND_TEXT_EXTRACTION | 5 | 3 | N/A | N/A | N/A |
| DOCUMENT_STORAGE_AND_SECURITY | 0 | 3 | N/A | N/A | N/A |
| USER_AUTHENTICATION_AND_AUTHORIZATION | 5 | 3 | N/A | N/A | N/A |
| SEMANTIC_SEARCH_AND_RAG | 4 | 3 | N/A | N/A | N/A |
| ENTERPRISE_REST_API_LAYER | 0 | 3 | N/A | N/A | N/A |
| AUDIT_LOGGING_AND_OBSERVABILITY | 0 | 3 | N/A | N/A | N/A |
| WEB_USER_INTERFACE | 2 | 3 | N/A | N/A | N/A |

## 4. Evaluation Breakdown

| Component | Candidates Evaluated | Context Size | Tokens | Runtime |
|---|---:|---:|---:|---:|
| PDF_UPLOAD_AND_FILE_MANAGEMENT | 5 | N/A | N/A | N/A |
| OCR_AND_TEXT_EXTRACTION | 5 | N/A | N/A | N/A |
| DOCUMENT_STORAGE_AND_SECURITY | 0 | N/A | N/A | N/A |
| USER_AUTHENTICATION_AND_AUTHORIZATION | 5 | N/A | N/A | N/A |
| SEMANTIC_SEARCH_AND_RAG | 4 | N/A | N/A | N/A |
| ENTERPRISE_REST_API_LAYER | 0 | N/A | N/A | N/A |
| AUDIT_LOGGING_AND_OBSERVABILITY | 0 | N/A | N/A | N/A |
| WEB_USER_INTERFACE | 2 | N/A | N/A | N/A |

## 5. Downstream Context

*Context sizes are approximated by the serialized byte size of the state JSON passed into each node.*

- **Decision Input Size**: ~372 KB
- **Blueprint Input Size**: ~388 KB
- **Validation Input Size**: ~434 KB

## 6. Bottleneck Analysis

1. **State Accumulation & Massive Context Overload**
   - *What is expensive*: State size balloons from 6KB to 463KB.
   - *Why*: The LangGraph state accumulates every artifact (candidates, evaluations, decisions) and passes the entirety to downstream agents.
   - *Impact*: Validation runtime is ~116s (the slowest agent) purely because it has to process 434KB of text. High token usage.
   - *Safe to optimize*: Yes, by pruning or projecting the state before sending it to each agent (e.g., Validation doesn't need raw candidates, only decisions and blueprint).

2. **Sequential MCP Tool Execution in Research**
   - *What is expensive*: `web.search` (Tavily) takes ~3.5s to 6.9s per call.
   - *Why*: The Research Agent loops over capabilities (`license.get`, `github.search`, `web.search`) sequentially.
   - *Impact*: High idle I/O time during research (~108s total runtime).
   - *Safe to optimize*: Yes, fetching from multiple MCP tools concurrently via `asyncio.gather` is safe and preserves data.

3. **Sequential Component Processing in Research & Evaluation**
   - *What is expensive*: Processing 8 components sequentially.
   - *Why*: The agents loop over `components` using `for comp in components:` sequentially instead of concurrently.
   - *Impact*: Multiplies the total runtime by the number of components.
   - *Safe to optimize*: Yes, components are completely independent until the Blueprint phase.

4. **Mass Evaluation Prompting**
   - *What is expensive*: 21 candidates evaluated in one giant prompt/response.
   - *Why*: `EvaluationAgent` receives the entire list of candidates and components at once, forcing the LLM to output massive JSON for 21 evaluations.
   - *Impact*: 68s runtime, likely hitting output token limits or significantly increasing TTFT (Time To First Token) and generation time.
   - *Safe to optimize*: Yes, evaluating candidates in parallel smaller batches would be faster.

5. **Inefficient Deduplication of Research Results**
   - *What is expensive*: Extracting candidates using an LLM on raw search results.
   - *Why*: Context budget is capped at ~14,000 characters and lower-ranked results are dropped, potentially causing the LLM to miss good candidates while wasting tokens on duplicates.
   - *Impact*: Token waste and suboptimal candidate discovery.
   - *Safe to optimize*: Yes, programmatic deduplication and scoring before LLM extraction would reduce token usage.

## 7. Baseline Quality

- Requirements preserved: Yes (9)
- Components preserved: Yes (8)
- Candidates preserved: Yes (21)
- Evaluations preserved: Yes (21)
- Decisions preserved: Yes (8)
- Blueprint generated: Yes
- Validation generated: Yes
- MCP traces preserved: Yes
- No pipeline failure: Confirmed

## 8. Exact Reproduction Command

```bash
PYTHONPATH=. .venv/bin/python scripts/test_harnesses/run_step.py prompt_optimizer supervisor decomposition research evaluation decision blueprint validation --prompt "Build an AI document intelligence platform using AWS. It should allow users to upload PDF documents, extract text using OCR, store documents securely, provide semantic search and question answering using RAG, support user authentication, and expose APIs for integration with other enterprise systems. Prefer reusable open-source solutions where appropriate, but ensure the selected components have suitable licenses and acceptable security/maturity." --run-id performance_baseline_v1
```

Final output JSON path:
`backend/scripts/test_harnesses/test_runs/performance_baseline_v1/08_validation.json`
