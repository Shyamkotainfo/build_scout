import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from agents.state import BuildSmartState
from mcp_integration.client import MCPToolClient


@pytest.fixture
def mock_mcp_client():
    client = MagicMock(spec=MCPToolClient)
    client.name = "test_mcp"
    client.list_tools = AsyncMock(return_value=[{"name": "search_repositories", "description": "search"}])
    client.call_tool = AsyncMock(return_value="raw search result text")
    return client


@pytest.fixture
def mock_research_agent(mock_mcp_client):
    with patch("agents.research.MCPToolClient") as mcp_cls:
        mcp_cls.return_value = mock_mcp_client
        
        # Mock the LLM to return a predictable JSON string
        mock_response = MagicMock()
        mock_response.content = '''
        {
            "candidates": [
                {
                    "id": "CAND-001",
                    "component_id": "COMP-001",
                    "name": "TestCandidate",
                    "source": "github",
                    "url": "https://github.com/test/test",
                    "description": "Test candidate",
                    "relevance_reason": "Matches test",
                    "metadata": {"stars": 100}
                }
            ]
        }
        '''
        
        # Mock get_llm to return a fake LLM that has bind().ainvoke()
        mock_llm = MagicMock()
        mock_llm_json = MagicMock()
        mock_llm_json.ainvoke = AsyncMock(return_value=mock_response)
        mock_llm.bind.return_value = mock_llm_json
        
        with patch("agents.research.get_llm", return_value=mock_llm):
            from agents.research import ResearchAgent
            agent = ResearchAgent()
            agent.settings.mcp_github_command = "mock_command"
            yield agent


def test_research_agent_instantiation():
    from agents.research import ResearchAgent
    agent = ResearchAgent()
    assert agent.llm is not None
    assert agent.settings is not None


def test_research_agent_run_updates_state(mock_research_agent):
    initial_state: BuildSmartState = {
        "user_request": "test request",
        "status": "DECOMPOSED",
        "domain": "Test",
        "requirements": [],
        "components": [
            {
                "id": "COMP-001",
                "name": "TEST_COMP",
                "category": "AI",
                "description": "Test description"
            }
        ],
        "candidates": [],
        "execution_plan": [],
        "agent_history": ["DecompositionAgent"]
    }
    
    final_state = mock_research_agent.run(initial_state)
    
    assert final_state["status"] == "RESEARCHED"
    assert "ResearchAgent" in final_state["agent_history"]
    
    candidates = final_state.get("candidates")
    assert candidates is not None
    assert len(candidates) == 1
    
    cand = candidates[0]
    assert cand["id"] == "CAND-001"
    assert cand["component_id"] == "COMP-001"
    assert cand["name"] == "TestCandidate"
    assert cand["metadata"]["stars"] == 100
