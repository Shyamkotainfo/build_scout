"""
client.py — Generic MCP Tool Client abstraction.

Provides a clean interface for invoking Model Context Protocol (MCP) servers
using stdio. Handles connection lifecycle, tool discovery, and execution.
Does not contain agent-specific logic or hardcoded tool behavior.
"""

import contextlib
import logging
import shlex
import sys
from typing import Any, AsyncIterator, Dict, List

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Suppress noisy MCP logs unless debugging
logging.getLogger("mcp").setLevel(logging.WARNING)


class MCPToolClient:
    """A generic client for connecting to and executing tools on an MCP server."""

    def __init__(self, command_str: str, name: str = "mcp_server"):
        """Initialize the client with a stdio command string.

        Args:
            command_str: Shell command to start the server (e.g., "npx -y @modelcontextprotocol/server-github").
            name: Human-readable name for logging.
        """
        self.name = name
        if not command_str:
            raise ValueError(f"Command string cannot be empty for MCP client '{name}'")

        parts = shlex.split(command_str)
        self.command = parts[0]
        self.args = parts[1:]

        # Use the current process environment so tokens (like GITHUB_PERSONAL_ACCESS_TOKEN) are passed through.
        import os
        self.env = dict(os.environ)

        self.server_parameters = StdioServerParameters(
            command=self.command,
            args=self.args,
            env=self.env,
        )

    @contextlib.asynccontextmanager
    async def connect(self) -> AsyncIterator[ClientSession]:
        """Context manager to establish a session with the MCP server.

        Yields:
            An initialized ClientSession.
        """
        try:
            async with stdio_client(self.server_parameters) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    yield session
        except Exception as e:
            # We wrap the error to keep the underlying failure understandable without exposing secrets in logs.
            raise RuntimeError(f"Failed to connect to MCP server '{self.name}': {str(e)}") from e

    async def list_tools(self) -> List[Dict[str, Any]]:
        """Discover available tools on the MCP server.

        Returns:
            List of tool definitions.
        """
        async with self.connect() as session:
            result = await session.list_tools()
            # result.tools is a list of Tool objects
            return [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "inputSchema": getattr(tool, "inputSchema", getattr(tool, "input_schema", {})),
                }
                for tool in result.tools
            ]

    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> str:
        """Invoke a specific tool by name.

        Args:
            name: The tool name to invoke.
            arguments: The arguments required by the tool.

        Returns:
            The raw text/content result from the tool.
        """
        async with self.connect() as session:
            try:
                result = await session.call_tool(name, arguments)
                # We expect the result to have 'content' which is a list of text objects
                if not result.content:
                    return ""
                
                # Join all text contents (usually there is just one)
                texts = []
                for content_item in result.content:
                    if content_item.type == "text":
                        texts.append(content_item.text)
                
                return "\n".join(texts)
            except Exception as e:
                raise RuntimeError(f"Error executing tool '{name}' on '{self.name}': {str(e)}") from e
