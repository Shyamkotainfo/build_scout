"""
test_graph.py — Integration tests for the BuildSmart LangGraph workflow.

These are REAL integration tests. They execute the compiled LangGraph graph
using the real Groq API. Do NOT mock Groq here.

Run with:
    pytest -v

Requires GROQ_API_KEY to be set in backend/.env.
"""

import pytest

from agents.graph import (
    DECOMPOSITION_NODE,
    EVALUATION_NODE,
    RESEARCH_NODE,
    SUPERVISOR_NODE,
    build_buildsmart_graph,
)
from agents.state import BuildSmartState, create_initial_state

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

USER_REQUEST = "I want to build an AI customer-support assistant."

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def compiled_graph():
    """Build the graph once for the entire test module (no API call)."""
    return build_buildsmart_graph()


@pytest.fixture(scope="module")
def result_state(compiled_graph) -> BuildSmartState:
    """Run the full LangGraph workflow ONCE and share the result.

    Uses a real Groq API call. Module scope avoids repeated API calls.
    """
    initial = create_initial_state(USER_REQUEST)
    try:
        return compiled_graph.invoke(initial)
    except Exception as exc:
        pytest.fail(
            f"LangGraph workflow failed during test setup.\n"
            f"Make sure GROQ_API_KEY is set in backend/.env\n"
            f"Original error: {exc}"
        )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_graph_can_be_imported() -> None:
    """TEST 1 — graph module can be imported from agents.graph."""
    from agents.graph import build_buildsmart_graph as _fn  # noqa: F401


def test_graph_can_be_compiled() -> None:
    """TEST 2 — build_buildsmart_graph() compiles without error."""
    graph = build_buildsmart_graph()
    assert graph is not None


def test_graph_contains_expected_nodes(compiled_graph) -> None:
    """TEST 3 — Compiled graph contains 'supervisor' and 'decomposition' nodes."""
    node_names = list(compiled_graph.get_graph().nodes.keys())
    assert SUPERVISOR_NODE in node_names, (
        f"Expected '{SUPERVISOR_NODE}' in graph nodes. Got: {node_names}"
    )
    assert DECOMPOSITION_NODE in node_names, (
        f"Expected '{DECOMPOSITION_NODE}' in graph nodes. Got: {node_names}"
    )
    assert RESEARCH_NODE in node_names, (
        f"Expected '{RESEARCH_NODE}' in graph nodes. Got: {node_names}"
    )
    assert EVALUATION_NODE in node_names, (
        f"Expected '{EVALUATION_NODE}' in graph nodes. Got: {node_names}"
    )


def test_graph_executes_successfully(result_state: BuildSmartState) -> None:
    """TEST 4 — Full graph executes and returns a valid BuildSmartState."""
    assert isinstance(result_state, dict), (
        "Graph invoke must return a dict (BuildSmartState)"
    )
    assert "status" in result_state
    assert "agent_history" in result_state


def test_supervisor_executed(result_state: BuildSmartState) -> None:
    """TEST 5 — SupervisorAgent is recorded in agent_history."""
    assert "SupervisorAgent" in result_state["agent_history"], (
        f"'SupervisorAgent' not found in agent_history: {result_state['agent_history']}"
    )


def test_supervisor_created_execution_plan(result_state: BuildSmartState) -> None:
    """TEST 6 — Supervisor created a non-empty execution_plan."""
    assert result_state["execution_plan"], (
        "execution_plan must be non-empty after Supervisor runs"
    )


def test_decomposition_executed(result_state: BuildSmartState) -> None:
    """TEST 7 — DecompositionAgent is recorded in agent_history."""
    assert "DecompositionAgent" in result_state["agent_history"], (
        f"'DecompositionAgent' not found in agent_history: {result_state['agent_history']}"
    )


def test_decomposition_populated_state(result_state: BuildSmartState) -> None:
    """TEST 8 — Decomposition populated all required state fields."""
    assert result_state["normalized_request"], (
        "normalized_request must be non-empty after Decomposition"
    )
    assert result_state["domain"], (
        "domain must be non-empty after Decomposition"
    )
    assert result_state["requirements"], (
        "requirements must be non-empty after Decomposition"
    )
    assert result_state["components"], (
        "components must be non-empty after Decomposition"
    )


def test_supervisor_output_preserved_after_decomposition(
    result_state: BuildSmartState,
) -> None:
    """TEST 9 — execution_plan from Supervisor is still present after Decomposition."""
    assert result_state["execution_plan"], (
        "execution_plan was lost after agents ran — "
        "Supervisor state must be preserved through the graph."
    )


def test_final_status_is_evaluated(result_state: BuildSmartState) -> None:
    """TEST 10 — Final status is 'EVALUATED'."""
    assert result_state["status"] == "EVALUATED", (
        f"Expected final status 'EVALUATED', got: {result_state['status']!r}"
    )


def test_final_current_agent_is_evaluation(result_state: BuildSmartState) -> None:
    """TEST 11 — Final current_agent is 'EvaluationAgent'."""
    assert result_state["current_agent"] == "EvaluationAgent", (
        f"Expected 'EvaluationAgent', got: {result_state['current_agent']!r}"
    )


def test_agent_history_contains_all_agents(result_state: BuildSmartState) -> None:
    """TEST 12 — agent_history contains all agents up to EvaluationAgent."""
    history = result_state["agent_history"]
    assert "SupervisorAgent" in history
    assert "DecompositionAgent" in history
    assert "ResearchAgent" in history
    assert "EvaluationAgent" in history
    
    assert history.index("SupervisorAgent") < history.index("DecompositionAgent")
    assert history.index("DecompositionAgent") < history.index("ResearchAgent")
    assert history.index("ResearchAgent") < history.index("EvaluationAgent")

def test_research_and_evaluation_populated_state(result_state: BuildSmartState) -> None:
    """TEST 13 — Research and Evaluation populated their state fields."""
    assert "candidates" in result_state
    assert isinstance(result_state["candidates"], list)
    
    assert "evaluations" in result_state
    assert isinstance(result_state["evaluations"], list)
