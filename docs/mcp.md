# BuildSmart — MCP Foundation

> **Status:** MCP Foundation Client/Adapter is **IMPLEMENTED**.
> **Status:** GitHub MCP Integration is **IMPLEMENTED**.
> **Status:** Tavily Web MCP Integration is **IMPLEMENTED**.
> **Status:** AWS, Package, License, and Security MCP integrations are **NOT YET IMPLEMENTED**.

## 1. Overview

Model Context Protocol (MCP) allows BuildSmart's agents to interface with external tools (GitHub search, web search, package registries, vulnerability databases) in a standardized way.

Rather than hardcoding provider-specific logic (e.g., calling the GitHub API directly from `ResearchAgent`), agents will use the MCP foundation to invoke normalized "tools" exposed by local or remote MCP servers.

## 2. Architecture

```
Agent (e.g. ResearchAgent)
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
       │
       ▼
External Provider (GitHub API)
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

## 7. Provider Tools Layer

* `backend/tools/github.py`: Encapsulates GitHub MCP execution context.
* `backend/tools/web_search.py`: Encapsulates Tavily MCP execution context.
* `backend/tools/documentation.py`: FUTURE.
* `backend/tools/cloud_architecture.py`: FUTURE.
* `backend/tools/license.py`: FUTURE.
* `backend/tools/security.py`: FUTURE.

## 8. Current Integrations

- **GitHub MCP**: `IMPLEMENTED`. ResearchAgent uses `tools/github.py` to search GitHub for repositories.
- **Tavily Web MCP**: `IMPLEMENTED`. ResearchAgent uses `tools/web_search.py` to query the web.
- **Documentation MCP**: `NOT IMPLEMENTED`
- **Package Metadata MCP**: `NOT IMPLEMENTED`
- **License/Security MCP**: `NOT IMPLEMENTED`

## 8. Next Steps

Future sub-steps will modify other agents (e.g., EvaluationAgent) to utilize the `MCPManager` and integrate more specialized servers like Documentation or License MCP.
