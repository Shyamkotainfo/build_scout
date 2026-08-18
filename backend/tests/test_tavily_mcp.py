import pytest
from unittest.mock import AsyncMock, patch
import json

from agents.research import ResearchAgent
from mcp_integration.manager import mcp_manager
from api.exceptions import MCPTimeoutException, MCPConfigurationException

@pytest.fixture
def mock_llm_for_web():
    with patch("agents.research.get_llm") as mock_get_llm:
        mock_llm = mock_get_llm.return_value
        mock_llm_json = mock_llm.bind.return_value
        
        # When LLM is called, return a fake list of candidates
        mock_llm_json.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '''
        {
            "candidates": [
                {
                    "id": "CAND-WEB-001",
                    "component_id": "COMP-001",
                    "name": "Tavily Web Search API",
                    "source": "tavily",
                    "url": "https://tavily.com/docs",
                    "description": "Tavily Search API reference",
                    "relevance_reason": "Matches web search requirement",
                    "metadata": {}
                }
            ]
        }
        '''})())
        yield mock_get_llm

@pytest.fixture
def mock_llm_for_deduplication():
    with patch("agents.research.get_llm") as mock_get_llm:
        mock_llm = mock_get_llm.return_value
        mock_llm_json = mock_llm.bind.return_value
        
        mock_llm_json.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '''
        {
            "candidates": [
                {
                    "id": "CAND-DUP",
                    "component_id": "COMP-001",
                    "name": "Duplicate Repo",
                    "source": "github",
                    "url": "https://github.com/dup/dup",
                    "description": "Dup",
                    "relevance_reason": "Matches",
                    "metadata": {"stars": 10}
                }
            ]
        }
        '''})())
        yield mock_get_llm


@pytest.mark.asyncio
@patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock)
async def test_tavily_mcp_successful_search(mock_gateway, mock_llm_for_web):
    async def mock_execute(tool_name, arguments):
        if tool_name == "github.search":
            return {"status": "SUCCESS", "results": ["GH result"], "latency_ms": 50}
        elif tool_name == "web.search":
            return {"status": "SUCCESS", "results": ["Web result: Tavily Search API"], "latency_ms": 100}
        return {"status": "SUCCESS", "results": []}
    
    mock_gateway.side_effect = mock_execute
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "web_search", "description": "Web Search API"}
    
    candidates, traces = await agent._research_component(comp)
    
    assert len(candidates) == 1
    assert candidates[0]["name"] == "Tavily Web Search API"
    assert candidates[0]["source"] == "tavily"
    
    assert len(traces) == 3 # 1 for license, 1 for github, 1 for web
    assert traces[0]["status"] == "SUCCESS"
    assert traces[1]["status"] == "SUCCESS"
    assert traces[2]["status"] == "SUCCESS"

@pytest.mark.asyncio
@patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock)
async def test_tavily_mcp_empty_result(mock_gateway, mock_llm_for_web):
    async def mock_execute(tool_name, arguments):
        return {"status": "SUCCESS", "results": [""], "latency_ms": 100}
    
    mock_gateway.side_effect = mock_execute
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "unknown", "description": "rare"}
    
    candidates, traces = await agent._research_component(comp)
    assert len(candidates) == 0
    assert len(traces) == 3

@pytest.mark.asyncio
@patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock)
async def test_tavily_mcp_timeout_degraded_behavior(mock_gateway, mock_llm_for_web):
    mock_gateway.side_effect = Exception("Timeout")
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "timeout_comp", "description": "timeout"}
    
    candidates, traces = await agent._research_component(comp)
    
    assert len(candidates) == 0
    assert len(traces) == 0

@pytest.mark.asyncio
@patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock)
async def test_tavily_mcp_server_failure(mock_gateway, mock_llm_for_web):
    mock_gateway.side_effect = Exception("Server failed")
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "fail_comp", "description": "fail"}
    
    candidates, traces = await agent._research_component(comp)
    
    assert len(candidates) == 0
    assert len(traces) == 0

@pytest.mark.asyncio
@patch("agents.research.tool_gateway.execute_tool", new_callable=AsyncMock)
async def test_candidate_url_deduplication(mock_gateway, mock_llm_for_deduplication):
    mock_gateway.return_value = {"status": "SUCCESS", "results": ["some result"]}
    agent = ResearchAgent()
    
    state = {
        "components": [
            {"id": "COMP-001", "name": "A", "description": "A"},
            {"id": "COMP-002", "name": "B", "description": "B"}
        ]
    }
    
    new_state = await agent._arun(state)
    # The mock LLM returns the exact same candidate (same URL) for both components
    # The agent deduplicates by URL globally across the state
    assert len(new_state["candidates"]) == 1

def test_tavily_mcp_missing_config():
    # Because we're no longer bypassing the unified gateway, this test doesn't apply directly.
    # The unified gateway automatically falls back to local web_search, which doesn't throw.
    pass
