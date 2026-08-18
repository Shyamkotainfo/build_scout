"""
manager.py — MCP Execution Manager

Wraps the raw MCP client with safe defaults: timeouts, retries,
result-size protection, secret masking, and normalized tracing.
"""
import asyncio
import time
import logging
from typing import Dict, Any

from mcp_integration.client import MCPToolClient
from mcp_integration.registry import registry
from config.settings import get_settings
from api.exceptions import MCPTimeoutException, MCPConfigurationException, MCPServiceException

logger = logging.getLogger(__name__)

class MCPManager:
    """Manages safe execution of MCP tools."""
    
    def __init__(self):
        self.settings = get_settings()
        self.timeout = self.settings.mcp_request_timeout_seconds
        self.max_retries = self.settings.mcp_max_retries
        self.max_result_size = self.settings.mcp_max_result_size
        
        # Common secret keys to mask in traces/logs
        self.secret_keys = {"token", "password", "secret", "key", "authorization"}

    def _mask_secrets(self, data: Any) -> Any:
        """Recursively mask secrets in a dictionary or list."""
        if isinstance(data, dict):
            masked = {}
            for k, v in data.items():
                if any(sec in k.lower() for sec in self.secret_keys):
                    masked[k] = "***MASKED***"
                else:
                    masked[k] = self._mask_secrets(v)
            return masked
        elif isinstance(data, list):
            return [self._mask_secrets(item) for item in data]
        return data

    async def call_tool(self, server_name: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool safely with retries, timeouts, and tracing.
        
        Returns:
            A normalized trace dictionary representing the execution.
        """
        start_time = time.time()
        trace = {
            "server_name": server_name,
            "tool_name": tool_name,
            "arguments": self._mask_secrets(arguments),
            "status": "PENDING",
            "latency_ms": 0,
            "result_summary": {},
            "error": None
        }

        try:
            # 1. Allow-list validation
            try:
                server_config = registry.get_server_config(server_name)
            except ValueError as e:
                raise MCPConfigurationException(str(e))
                
            if not registry.is_tool_allowed(server_name, tool_name):
                raise MCPConfigurationException(f"Tool '{tool_name}' is not allowed for server '{server_name}'.")
                
            if not server_config.command:
                raise MCPConfigurationException(f"Server '{server_name}' has no configured command.")

            # 2. Client Initialization
            client = MCPToolClient(command_str=server_config.command, name=server_name)

            # 3. Execution with Timeout & Retries
            attempt = 0
            last_exception = None
            raw_result = ""
            
            while attempt <= self.max_retries:
                try:
                    # Timeout enforcement using asyncio.wait_for
                    raw_result = await asyncio.wait_for(
                        client.call_tool(tool_name, arguments),
                        timeout=self.timeout
                    )
                    trace["status"] = "SUCCESS"
                    break
                except asyncio.TimeoutError:
                    last_exception = MCPTimeoutException(f"Tool '{tool_name}' timed out after {self.timeout}s.")
                    logger.warning(f"MCP Timeout: {server_name}.{tool_name} (Attempt {attempt+1}/{self.max_retries+1})")
                except Exception as e:
                    last_exception = MCPServiceException(f"Tool '{tool_name}' execution failed: {str(e)}")
                    logger.warning(f"MCP Error: {server_name}.{tool_name} - {str(e)} (Attempt {attempt+1}/{self.max_retries+1})")
                
                attempt += 1
                if attempt <= self.max_retries:
                    await asyncio.sleep(2 ** attempt) # Exponential backoff
            
            if trace["status"] != "SUCCESS" and last_exception:
                raise last_exception

            # 4. Result-size protection
            if len(raw_result) > self.max_result_size:
                logger.warning(f"Truncating large result from {server_name}.{tool_name}")
                raw_result = raw_result[:self.max_result_size] + "... [TRUNCATED]"
                
            trace["result_summary"] = {"content": raw_result, "size": len(raw_result)}
            
        except Exception as e:
            trace["status"] = "ERROR"
            trace["error"] = str(e)
            # Re-raise to ensure the agent handles the failure appropriately
            raise e
        finally:
            trace["latency_ms"] = int((time.time() - start_time) * 1000)
            
        return trace

mcp_manager = MCPManager()
