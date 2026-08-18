"""
registry.py — MCP Allow-list and Configuration Registry

Validates allowed servers and tools to prevent arbitrary execution.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel
from config.settings import get_settings

class MCPServerConfig(BaseModel):
    name: str
    command: Optional[str]
    allowed_tools: List[str]

class MCPRegistry:
    """Registry of allowed MCP servers and their permitted tools."""
    
    def __init__(self):
        settings = get_settings()
        
        # Define the allowed servers and their explicitly allowed tools.
        # Even if a server exposes other tools, only these will be permitted.
        # This prevents arbitrary tool execution (e.g., shell access).
        self._servers: Dict[str, MCPServerConfig] = {
            "github": MCPServerConfig(
                name="github",
                command=settings.mcp_github_command,
                allowed_tools=[
                    "search_repositories",
                    "get_repository",
                    "get_file_contents"
                ]
            ),
            "tavily": MCPServerConfig(
                name="tavily",
                command=settings.mcp_tavily_command,
                allowed_tools=[
                    "tavily-search"
                ]
            ),
            "documentation": MCPServerConfig(
                name="documentation",
                command=None,
                allowed_tools=["search_docs"]
            ),
            "package_metadata": MCPServerConfig(
                name="package_metadata",
                command=None,
                allowed_tools=["get_package_info"]
            ),
            "license": MCPServerConfig(
                name="license",
                command=None,
                allowed_tools=["analyze_license"]
            ),
            "security": MCPServerConfig(
                name="security",
                command=None,
                allowed_tools=["check_vulnerabilities"]
            )
        }

    def get_server_config(self, server_name: str) -> MCPServerConfig:
        """Get the configuration for a server if it's allowed.
        
        Raises:
            ValueError if the server is not allowed.
        """
        if server_name not in self._servers:
            raise ValueError(f"MCP Server '{server_name}' is not in the allow-list.")
        return self._servers[server_name]

    def is_tool_allowed(self, server_name: str, tool_name: str) -> bool:
        """Check if a specific tool is allowed for a given server."""
        try:
            config = self.get_server_config(server_name)
            return tool_name in config.allowed_tools or "*" in config.allowed_tools
        except ValueError:
            return False

# Singleton instance for easy import
registry = MCPRegistry()
