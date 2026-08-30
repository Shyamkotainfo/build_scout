import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import json

from tools.gateway import tool_gateway

@pytest.fixture(autouse=True)
def clear_cache():
    tool_gateway._cache._store.clear()

from agents.research import ResearchAgent
from mcp_integration.registry import registry

@pytest.mark.asyncio
async def test_smoke_github_search():
    with patch("mcp_integration.manager.mcp_manager.call_tool", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = {
            "status": "SUCCESS",
            "latency_ms": 120,
            "result_summary": {"content": "mock github search result"}
        }
        
        args = {"query": "FastAPI authentication", "limit": 3}
        res = await tool_gateway.execute_tool("github.search", args)
        
        assert res["status"] == "SUCCESS"
        assert res["provider"] == "MCP"
        assert res["tool_name"] == "github.search"
        assert "results" in res
        
        # Verify argument normalization
        mock_call.assert_called_with("github", "search_repositories", {"query": "FastAPI authentication", "perPage": 3})

@pytest.mark.asyncio
async def test_smoke_github_search_fallback():
    with patch("mcp_integration.manager.mcp_manager.call_tool", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = Exception("MCP Failed")
        
        args = {"query": "FastAPI authentication", "limit": 3}
        res = await tool_gateway.execute_tool("github.search", args)
        
        assert res["status"] == "SUCCESS"
        assert res["provider"] == "FALLBACK"
        assert res["tool_name"] == "github.search"
        assert "results" in res

@pytest.mark.asyncio
async def test_smoke_web_search():
    with patch("mcp_integration.manager.mcp_manager.call_tool", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = {
            "status": "SUCCESS",
            "latency_ms": 150,
            "result_summary": {"content": "mock tavily search result"}
        }
        
        args = {"query": "FastAPI authentication best practices", "limit": 3}
        res = await tool_gateway.execute_tool("web.search", args)
        
        assert res["status"] == "SUCCESS"
        assert res["provider"] == "MCP"
        assert res["tool_name"] == "web.search"
        
        # Verify argument normalization
        mock_call.assert_called_with("tavily", "tavily-search", {
            "query": "FastAPI authentication best practices",
            "search_depth": "advanced",
            "max_results": 3
        })

@pytest.mark.asyncio
async def test_smoke_security_get():
    args = {"component": "API Authentication", "repository": "test/test"}
    res = await tool_gateway.execute_tool("security.get", args)
    
    assert res["status"] == "SUCCESS"
    assert res["provider"] == "LOCAL"
    assert res["tool_name"] == "security.get"
    assert "results" in res

@pytest.mark.asyncio
async def test_smoke_license_get():
    args = {"repository": "fastapi", "url": "https://github.com/fastapi/fastapi"}
    res = await tool_gateway.execute_tool("license.get", args)
    
    assert res["status"] == "SUCCESS"
    assert res["provider"] == "LOCAL"
    assert res["tool_name"] == "license.get"

@pytest.mark.asyncio
async def test_smoke_aws_documentation():
    args = {"service": "Amazon S3", "query": "Object storage"}
    res = await tool_gateway.execute_tool("aws.documentation", args)
    
    assert res["status"] == "SUCCESS"
    assert res["provider"] == "LOCAL"
    assert res["tool_name"] == "aws.documentation"

@pytest.mark.asyncio
async def test_smoke_cloud_architecture():
    args = {"component": "Document Processing Platform", "query": "Document Processing Platform"}
    res = await tool_gateway.execute_tool("cloud.architecture", args)
    
    assert res["status"] == "SUCCESS"
    assert res["provider"] == "LOCAL"
    assert res["tool_name"] == "cloud.architecture"

@pytest.mark.asyncio
async def test_smoke_secret_masking():
    args = {
        "query": "test",
        "authorization": "SUPER_SECRET_TEST_VALUE",
        "api_key": "FAKE_TEST_KEY"
    }
    
    # We pass it to local tool which won't use it, but trace will capture arguments
    res = await tool_gateway.execute_tool("security.get", args)
    
    assert res["status"] == "FAILED" or res["status"] == "SUCCESS"
    args_trace = res.get("arguments", {})
    assert args_trace.get("authorization") == "***MASKED***"
    assert args_trace.get("api_key") == "***MASKED***"
    assert args_trace.get("query") == "test"
    
    # ensure original wasn't mutated
    assert args["authorization"] == "SUPER_SECRET_TEST_VALUE"

@pytest.mark.asyncio
async def test_smoke_context_protection():
    comp = {"id": "COMP-001", "name": "huge_context", "category": "SECURITY"}
    
    with patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock) as mock_execute:
        # Simulate returning a massive string
        huge_string = "A" * 20000
        mock_execute.return_value = {
            "status": "SUCCESS",
            "provider": "LOCAL",
            "results": [huge_string]
        }
        
        with patch("agents.research.get_llm") as mock_get_llm:
            mock_llm = mock_get_llm.return_value
            mock_llm_json = mock_llm.bind.return_value
            
            mock_llm.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '{"candidates": []}'})())
            mock_llm_json.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '{"candidates": []}'})())
            agent = ResearchAgent()
            
            candidates, traces = await agent._research_component(comp)
            
            # The context protection truncates strings larger than 14,000 characters to ~14,000 + truncation msg
            # Check what got sent to the LLM (first argument to ainvoke)
            call_args = mock_llm.ainvoke.call_args[0][0]
            prompt_content = str(call_args)
            
            # verify it doesn't contain the full 20,000 A's
            assert huge_string not in prompt_content
            assert "[TRUNCATED" in prompt_content
            assert len(prompt_content) < 20000

@pytest.mark.asyncio
async def test_smoke_research_agent_integration():
    comp = {"id": "COMP-001", "name": "API Authentication", "category": "SECURITY"}
    
    with patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock) as mock_execute:
        mock_execute.return_value = {
            "status": "SUCCESS",
            "provider": "LOCAL",
            "results": ["Test result"]
        }
        
        with patch("agents.research.get_llm") as mock_get_llm:
            mock_llm = mock_get_llm.return_value
            mock_llm_json = mock_llm.bind.return_value
            
            mock_llm.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '{"candidates": []}'})())
            mock_llm_json.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '{"candidates": []}'})())
            agent = ResearchAgent()
            
            candidates, traces = await agent._research_component(comp)
            
            assert mock_execute.call_count == 2
            # We expect github.search, web.search for the SECURITY category
            called_tools = [call[0][0] for call in mock_execute.call_args_list]
            assert "github.search" in called_tools
            assert "web.search" in called_tools
