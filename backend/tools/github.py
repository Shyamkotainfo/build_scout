"""
github.py — GitHub specific tool adapter.

Hides provider-specific MCP connection details from the agents.
"""
from typing import Any, Dict
from mcp_integration.manager import mcp_manager

async def search_github(query: str, per_page: int = 5) -> Dict[str, Any]:
    """
    Execute a GitHub repository search via MCPManager.
    
    Args:
        query: The search query string.
        per_page: Number of results to return.
        
    Returns:
        A dict representing the MCP trace containing status and result_summary.
    """
    return await mcp_manager.call_tool(
        server_name="github",
        tool_name="search_repositories",
        arguments={"query": query, "perPage": per_page}
    )
