"""
web_search.py — Tavily Web Search specific tool adapter.

Hides provider-specific MCP connection details from the agents.
"""
from typing import Any, Dict
from mcp_integration.manager import mcp_manager

async def search_web(query: str, search_depth: str = "advanced", max_results: int = 5) -> Dict[str, Any]:
    """
    Execute a Web search via Tavily MCP via MCPManager.
    
    Args:
        query: The search query string.
        search_depth: The depth of the search ('basic' or 'advanced').
        max_results: Number of results to return.
        
    Returns:
        A dict representing the MCP trace containing status and result_summary.
    """
    return await mcp_manager.call_tool(
        server_name="tavily",
        tool_name="tavily-search",
        arguments={
            "query": query,
            "search_depth": search_depth,
            "max_results": max_results
        }
    )
