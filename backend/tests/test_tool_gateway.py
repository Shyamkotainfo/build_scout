import pytest
from unittest.mock import patch, AsyncMock
from tools.gateway import tool_gateway
from mcp_integration.registry import registry

@pytest.mark.asyncio
async def test_tool_gateway_security_local():
    # Should resolve to local security tool and normalize results
    args = {"query": "owner/repo", "repository": "owner/repo"}
    result = await tool_gateway.execute_tool("security.get", args)
    
    assert result["status"] == "SUCCESS"
    assert result["tool_name"] == "security.get"
    assert result["provider"] == "LOCAL"
    assert "results" in result
    assert isinstance(result["results"], list)

@pytest.mark.asyncio
async def test_tool_gateway_invalid_tool():
    # Non-existent abstract tool
    result = await tool_gateway.execute_tool("invalid.tool", {})
    assert result["status"] == "FAILED"
    assert result["error"]["code"] == "TOOL_NOT_FOUND"

@pytest.mark.asyncio
@patch("mcp_integration.manager.mcp_manager.call_tool", new_callable=AsyncMock)
async def test_tool_gateway_mcp_routing(mock_call_tool):
    mock_call_tool.return_value = {
        "status": "SUCCESS",
        "latency_ms": 100,
        "result_summary": {"content": "mock github search result"}
    }
    
    result = await tool_gateway.execute_tool("github.search", {"query": "test", "limit": 5})
    
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "MCP"
    assert mock_call_tool.called
    assert result["results"] == ["mock github search result"]

@pytest.mark.asyncio
@patch("mcp_integration.manager.mcp_manager.call_tool", new_callable=AsyncMock)
async def test_tool_gateway_mcp_fallback(mock_call_tool):
    # Simulate MCP failure to trigger fallback to local execution
    mock_call_tool.side_effect = Exception("MCP Connection Refused")
    
    result = await tool_gateway.execute_tool("github.search", {"query": "test", "limit": 5})
    
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "FALLBACK"
    assert "results" in result
