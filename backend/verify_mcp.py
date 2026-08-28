import asyncio
import logging
from config.settings import get_settings
from tools.gateway import UnifiedToolGateway
from mcp_integration.registry import registry

logging.basicConfig(level=logging.INFO)

async def test_mcp():
    gateway = UnifiedToolGateway()
    
    print("\n--- Registered Capabilities ---")
    capabilities = registry.get_all_tools()
    for cap in capabilities:
        print(f"{cap.name} (Type: {cap.provider})")
        
    print("\n--- Testing Tavily (web.search) ---")
    try:
        result = await gateway.execute_tool("web.search", {"query": "Latest LangChain MCP tools release", "limit": 1})
        print("Tavily Result:")
        print(result)
    except Exception as e:
        print(f"Tavily Error: {e}")
        
    print("\n--- Testing GitHub (github.search) ---")
    try:
        result = await gateway.execute_tool("github.search", {"query": "repo:hwchase17/langchain-mcp"})
        print("GitHub Result:")
        print(result)
    except Exception as e:
        print(f"GitHub Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_mcp())
