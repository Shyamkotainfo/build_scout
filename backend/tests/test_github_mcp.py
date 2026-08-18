import pytest
from unittest.mock import AsyncMock, patch

from agents.research import ResearchAgent
from mcp_integration.manager import mcp_manager
from api.exceptions import MCPTimeoutException


@pytest.fixture
def mock_llm_for_github():
    with patch("agents.research.get_llm") as mock_get_llm:
        mock_llm = mock_get_llm.return_value
        mock_llm_json = mock_llm.bind.return_value
        
        # When LLM is called, return a fake list of candidates
        mock_llm_json.ainvoke = AsyncMock(return_value=type("Obj", (), {"content": '''
        {
            "candidates": [
                {
                    "id": "CAND-GH-001",
                    "component_id": "COMP-001",
                    "name": "FastAPI",
                    "source": "github",
                    "url": "https://github.com/tiangolo/fastapi",
                    "description": "FastAPI framework",
                    "relevance_reason": "Matches Python REST API",
                    "metadata": {"stars": 50000}
                }
            ]
        }
        '''})())
        yield mock_get_llm

@pytest.mark.asyncio
@patch("agents.research.search_github", new_callable=AsyncMock)
@patch("agents.research.search_web", new_callable=AsyncMock)
async def test_github_mcp_successful_search(mock_search_web, mock_search_github, mock_llm_for_github):
    mock_search_github.return_value = {
        "status": "SUCCESS",
        "result_summary": {"content": "some valid result"},
        "latency_ms": 100
    }
    mock_search_web.return_value = {
        "status": "SUCCESS",
        "result_summary": {"content": "some web result"},
        "latency_ms": 100
    }
    
    agent = ResearchAgent()
    comp = {
        "id": "COMP-001",
        "name": "python_rest_api",
        "description": "REST API framework"
    }
    
    candidates, traces = await agent._research_component(comp)
    
    assert len(candidates) == 1
    assert candidates[0]["name"] == "FastAPI"
    assert candidates[0]["url"] == "https://github.com/tiangolo/fastapi"
    
    assert len(traces) == 2
    assert traces[0]["status"] == "SUCCESS"
    assert traces[1]["status"] == "SUCCESS"
    
    mock_search_github.assert_any_call(
        query="python rest api REST API framework",
        per_page=5
    )

@pytest.mark.asyncio
@patch("agents.research.search_github", new_callable=AsyncMock)
@patch("agents.research.search_web", new_callable=AsyncMock)
async def test_github_mcp_empty_result(mock_search_web, mock_search_github, mock_llm_for_github):
    # MCP returns empty result
    mock_search_github.return_value = {
        "status": "SUCCESS",
        "result_summary": {"content": ""},
        "latency_ms": 100
    }
    mock_search_web.return_value = {
        "status": "SUCCESS",
        "result_summary": {"content": ""},
        "latency_ms": 100
    }
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "unknown_tool", "description": "rare"}
    
    candidates, traces = await agent._research_component(comp)
    
    assert len(candidates) == 0
    assert len(traces) == 2
    assert traces[0]["status"] == "SUCCESS"
    assert traces[1]["status"] == "SUCCESS"

@pytest.mark.asyncio
@patch("agents.research.search_github", new_callable=AsyncMock)
@patch("agents.research.search_web", new_callable=AsyncMock)
async def test_github_mcp_timeout_degraded_behavior(mock_search_web, mock_search_github, mock_llm_for_github):
    mock_search_github.side_effect = MCPTimeoutException("Timeout")
    mock_search_web.side_effect = MCPTimeoutException("Timeout")
    
    agent = ResearchAgent()
    comp = {"id": "COMP-001", "name": "python_rest_api", "description": "REST API framework"}
    
    candidates, traces = await agent._research_component(comp)
    
    # Should not crash, just return 0 candidates
    assert len(candidates) == 0
    assert len(traces) == 0
