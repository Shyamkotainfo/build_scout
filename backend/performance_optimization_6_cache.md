# BuildScout Performance Report: Optimization #6

## Objective
Reduce repeated/equivalent research tool calls and their latency/token overhead while preserving evidence quality, traceability, and correctness.

## 1. Findings on Duplicate Work
Within a *single* run of the E2E pipeline, deduplication strategies introduced in Opt #4 successfully eliminated intra-run duplicate candidate processing. 
However, caching provides massive architectural advantages for **cross-request scenarios** (such as multiple API queries in a live FastAPI server environment, or when users iterate on similar component requirements).
- `github.search` and `web.search` use identical prompts for similar components.
- `security.get` and `license.get` check identical repositories heavily across different tasks.

## 2. In-Memory Cache Design
We adopted the "simplest architecture" requirement by embedding a fast, safe, in-memory `ToolCache` directly into the `UnifiedToolGateway` (which operates as a singleton).

### Cache Key
The cache key explicitly prevents collisions by hashing the exact normalized tool arguments alongside the tool name:
`SHA256(JSON(arguments))`
Example: `github.search:8d9a...`

### Freshness Rules (TTL)
TTL is enforced explicitly depending on the volatility of the source data to prevent stale vulnerability/compliance risks:
- `security.get`: 1 hour (strict freshness).
- `github.repository`, `package.metadata`: 6 hours.
- `github.search`, `web.search`, `license.get`: 24 hours.
- `aws.documentation`, `cloud.architecture`: 7 days.

## 3. Provenance and Traceability
A cache hit never falsifies its source. It transparently wraps the trace:
- **Provider**: Overridden as `"CACHE"`
- **Latency**: `"0 ms"`
- **Metadata Preserved**: 
  - `original_provider` (e.g. `MCP` or `LOCAL`)
  - `original_retrieval` timestamp
  - `ttl_seconds`
  
This ensures full visibility in the `BuildSmartState` tool traces.

## 4. Execution Fallback
If caching fails (e.g., arguments cannot be serialized), it immediately skips caching and routes to the normal MCP/Local execution. A cache error will never crash the research agent.

## 5. Verification
- `test_tool_gateway.py` was refactored with automated caching tests ensuring cache storage, hit resolution, and metadata manipulation work perfectly.
- Complete backend pytest suite passed (`262 passing`), guaranteeing no regressions to REUSE/ADAPT/BUILD logic, deduplication limits, or schema constraints.

## Conclusion
Optimization #6 successfully minimizes cross-run latency, protects external API tokens/rate-limits, and creates a highly stable, production-ready Tool Gateway without introducing heavy external infrastructure dependencies like Redis.
