import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from mcp_integration.client import MCPToolClient
from mcp_integration.registry import registry
from mcp_integration.manager import mcp_manager
from api.exceptions import MCPTimeoutException, MCPConfigurationException, MCPServiceException


def test_mcp_client_init():
    client = MCPToolClient("npx -y @modelcontextprotocol/server-github", "github")
    assert client.name == "github"
    assert client.command == "npx"
    assert "-y" in client.args
    assert "@modelcontextprotocol/server-github" in client.args


def test_mcp_client_init_empty_command():
    with pytest.raises(ValueError, match="Command string cannot be empty"):
        MCPToolClient("")


@pytest.mark.asyncio
async def test_mcp_client_list_tools():
    client = MCPToolClient("dummy_command", "dummy")
    
    mock_session = AsyncMock()
    mock_tool = MagicMock()
    mock_tool.name = "test_tool"
    mock_tool.description = "test desc"
    mock_tool.inputSchema = {}
    mock_session.list_tools.return_value.tools = [mock_tool]
    
    @patch("mcp_integration.client.MCPToolClient.connect")
    async def run_test(mock_connect):
        from contextlib import asynccontextmanager
        @asynccontextmanager
        async def mock_cm():
            yield mock_session
        mock_connect.side_effect = mock_cm
        
        tools = await client.list_tools()
        assert len(tools) == 1
        assert tools[0]["name"] == "test_tool"
        assert tools[0]["description"] == "test desc"
        
    await run_test()

# --- Registry Tests ---

def test_registry_allow_list():
    assert registry.is_tool_allowed("github", "search_repositories") is True
    assert registry.is_tool_allowed("tavily", "tavily-search") is True
    assert registry.is_tool_allowed("tavily", "unauthorized_tool") is False
    assert registry.is_tool_allowed("unknown_server", "search") is False

def test_registry_server_config():
    config = registry.get_server_config("github")
    assert config.name == "github"
    assert "search_repositories" in config.allowed_tools

def test_registry_server_config_unknown():
    with pytest.raises(ValueError, match="is not in the allow-list"):
        registry.get_server_config("malicious_server")

# --- Manager Tests ---

def test_manager_mask_secrets():
    data = {
        "query": "something",
        "github_token": "secret123",
        "password": "mypassword",
        "nested": {"api_key": "hidden"}
    }
    masked = mcp_manager._mask_secrets(data)
    assert masked["query"] == "something"
    assert masked["github_token"] == "***MASKED***"
    assert masked["password"] == "***MASKED***"
    assert masked["nested"]["api_key"] == "***MASKED***"

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_success(mock_call):
    mock_call.return_value = "Success Result"
    
    # Needs to match an allowed server/tool that has a command
    mcp_manager.settings.mcp_github_command = "dummy_command"
    registry._servers["github"].command = "dummy_command"

    trace = await mcp_manager.call_tool("github", "search_repositories", {"q": "test"})
    assert trace["status"] == "SUCCESS"
    assert trace["result_summary"]["content"] == "Success Result"
    assert trace["result_summary"]["size"] == len("Success Result")
    assert trace["latency_ms"] >= 0

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_not_allowed_tool(mock_call):
    with pytest.raises(MCPConfigurationException, match="is not allowed for server"):
        await mcp_manager.call_tool("github", "malicious_tool", {})

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_not_allowed_server(mock_call):
    with pytest.raises(MCPConfigurationException, match="is not in the allow-list"):
        await mcp_manager.call_tool("unknown", "search_repositories", {})

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_timeout(mock_call):
    # If wait_for triggers a timeout, it raises TimeoutError
    import asyncio
    mock_call.side_effect = asyncio.TimeoutError()
    mcp_manager.settings.mcp_github_command = "dummy_command"
    registry._servers["github"].command = "dummy_command"
    
    # Temporarily set max retries to 0 for faster test
    original_retries = mcp_manager.max_retries
    mcp_manager.max_retries = 0
    
    with pytest.raises(MCPTimeoutException, match="timed out"):
        await mcp_manager.call_tool("github", "search_repositories", {})
        
    mcp_manager.max_retries = original_retries

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_retry_exhausted(mock_call):
    mock_call.side_effect = Exception("Tool crashed")
    mcp_manager.settings.mcp_github_command = "dummy_command"
    registry._servers["github"].command = "dummy_command"
    
    original_retries = mcp_manager.max_retries
    mcp_manager.max_retries = 1
    
    with pytest.raises(MCPServiceException, match="execution failed"):
        await mcp_manager.call_tool("github", "search_repositories", {})
        
    # Expect it to have been called max_retries + 1 times
    assert mock_call.call_count == 2
    mcp_manager.max_retries = original_retries

@pytest.mark.asyncio
@patch("mcp_integration.client.MCPToolClient.call_tool", new_callable=AsyncMock)
async def test_manager_call_tool_result_size_protection(mock_call):
    mcp_manager.settings.mcp_github_command = "dummy_command"
    registry._servers["github"].command = "dummy_command"
    
    # Return a very large result
    large_result = "x" * 60000
    mock_call.return_value = large_result
    
    original_size = mcp_manager.max_result_size
    mcp_manager.max_result_size = 100
    
    trace = await mcp_manager.call_tool("github", "search_repositories", {})
    assert trace["status"] == "SUCCESS"
    assert len(trace["result_summary"]["content"]) == 100 + len("... [TRUNCATED]")
    assert "... [TRUNCATED]" in trace["result_summary"]["content"]
    
    mcp_manager.max_result_size = original_size
