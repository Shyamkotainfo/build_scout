import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from mcp_integration.client import MCPToolClient


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
    
    # Mock the connect context manager
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
