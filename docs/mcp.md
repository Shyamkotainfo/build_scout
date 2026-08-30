# BuildSmart — MCP Foundation

> **Status:** MCP Foundation Client/Adapter is **IMPLEMENTED**.
> **Status:** GitHub MCP Integration is **IMPLEMENTED**.
> **Status:** Tavily Web MCP Integration is **IMPLEMENTED**.
> **Status:** AWS, Package, License, and Security MCP integrations are **NOT YET IMPLEMENTED**.

## 1. Overview

Model Context Protocol (MCP) allows BuildSmart's agents to interface with external tools (GitHub search, web search, package registries, vulnerability databases) in a standardized way.

- Connects natively to local/remote stdio servers via generic MCP protocols.
- **Unified Tool Gateway (`backend/tools/gateway.py`)**:
  - Serves as the single point of entry for agents to execute capabilities.
  - Dynamically routes requests to external MCP servers (via `MCPManager`) or local Python implementations (`BuildSmartTool`).
  - Provides graceful fallback (e.g., if external GitHub MCP times out, falls back to local `github.py` HTTP implementation).
- **Local Tools (`backend/tools/*.py`)**:
  - Implement specific capabilities like `security.get` or `license.get` that don't need full MCP servers.
- **Agents (`backend/agents/`)**:
  - `ResearchAgent` orchestrates queries using abstract tools like `github.search`, without knowing their backing implementation.
  - Normalizes results while enforcing strict context limits (14k chars) to prevent LLM `413` errors.

## 2. Architecture

```
Agent (e.g. ResearchAgent)
       │
       ▼
UnifiedToolGateway (tools/gateway.py) ──► Local Tools (BuildSmartTool)
       │
       ▼
MCPManager (mcp_integration/manager.py)
       │  (Handles timeouts, retries, truncations, tracing)
       ▼
MCPRegistry (mcp_integration/registry.py)
       │  (Enforces allow-lists for servers and tools)
       ▼
MCPToolClient (mcp_integration/client.py)
       │  (Manages stdio connection lifecycle)
       ▼
External MCP Server (e.g., @modelcontextprotocol/server-github)
```

## 3. Allow-List and Configuration

To prevent arbitrary execution and ensure safety, BuildSmart enforces a strict allow-list via `MCPRegistry`.

Currently allowed servers (conceptual until connected):
- `github`
- `web_search`
- `documentation`
- `package_metadata`
- `license`
- `security`

If an agent attempts to invoke a tool that is not explicitly allowed for a server, an `MCPConfigurationException` is raised.

Server commands are configured via `.env` (e.g., `MCP_GITHUB_COMMAND`). If the command is not configured, the server cannot be initialized.

## 4. Execution Protections

The `MCPManager` enforces several boundaries on tool execution:

- **Timeouts**: Configured via `MCP_REQUEST_TIMEOUT_SECONDS` (default: 30s). Throws `MCPTimeoutException` if exceeded.
- **Retries**: Configured via `MCP_MAX_RETRIES` (default: 2). Uses exponential backoff.
- **Result Size**: Configured via `MCP_MAX_RESULT_SIZE` (default: 50,000 chars). Truncates excessively large responses with `... [TRUNCATED]`.
- **Secret Masking**: Automatically masks common secret keys (`token`, `password`, `secret`, `key`, `authorization`) in tool arguments before returning the execution trace to the agent.

## 5. Tool Trace Format

Every successful or failed tool invocation returns a normalized trace dictionary suitable for appending to the agent's context or logging:

```json
{
  "server_name": "github",
  "tool_name": "search_repositories",
  "arguments": {"q": "fastapi"},
  "status": "SUCCESS",
  "latency_ms": 421,
  "result_summary": {
    "content": "...",
    "size": 1500
  },
  "error": null
}
```

## 6. Testing

The foundation is fully unit-tested in `backend/tests/test_mcp.py` without requiring live external MCP servers. Mocks are used to simulate timeouts, retries, and result truncation.

## 7. Unified Tool Layer

* `backend/tools/gateway.py`: The single unified orchestrator.
* `backend/tools/github.py`: Local fallback for `github.search`.
* `backend/tools/web_search.py`: Local fallback for `web.search`.
* `backend/tools/documentation.py`: Local tool for `docs.search`.
* `backend/tools/cloud_architecture.py`: Local tool for `aws.documentation`.
* `backend/tools/license.py`: Local tool for `license.get`.
* `backend/tools/security.py`: Local tool for `security.get`.

## 8. Current Integrations

- **GitHub MCP**: `IMPLEMENTED`. ResearchAgent uses `github.search`, hitting MCP and falling back to the local tool if needed.
- **Tavily Web MCP**: `IMPLEMENTED`. ResearchAgent uses `web.search`, hitting MCP and falling back to the local tool.
- **License / Security / Docs**: `IMPLEMENTED` via local tools in the unified gateway.

## 8. Next Steps

Future sub-steps will modify other agents (e.g., EvaluationAgent) to utilize the `MCPManager` and integrate more specialized servers like Documentation or License MCP.
