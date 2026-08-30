import sys
import logging
from unittest.mock import patch
from run_step import main
import asyncio

handler = logging.StreamHandler(sys.stdout)
handler.setLevel(logging.INFO)
logging.getLogger("buildsmart_token").addHandler(handler)
logging.getLogger("buildsmart_token").setLevel(logging.INFO)
logging.getLogger("agents").addHandler(handler)
logging.getLogger("agents").setLevel(logging.INFO)

import mcp_integration.manager
original_call_tool = mcp_integration.manager.mcp_manager.call_tool

async def mocked_call_tool(server, tool, args):
    if tool == "search_repositories":
        raise Exception("Mocked MCP failure for github.search")
    return await original_call_tool(server, tool, args)

from tools.gateway import GithubSearchTool
original_github_execute = GithubSearchTool.execute

async def mocked_github_execute(self, arguments):
    huge_str = "x" * 15000
    return {"results": [{"name": "Mocked Huge Repo", "description": huge_str, "url": "https://github.com/mock/huge", "stars": 100, "source": "github"}]}

sys.argv = ["run_step.py", "research", "--state", "test_runs/calc_test_v2/03_decomposition.json", "--run-id", "calc_test_fallback"]

print("--- Running Fallback and Truncation Test ---")
with patch.object(mcp_integration.manager.mcp_manager, "call_tool", new=mocked_call_tool), \
     patch.object(GithubSearchTool, "execute", new=mocked_github_execute):
    main()
