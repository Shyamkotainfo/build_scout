"""
test_supervisor.py — Integration tests for the BuildSmart Supervisor Agent.

These are REAL integration tests.  They call the Groq API using the key
configured in backend/.env.  Do NOT mock Groq here.

Run with:
    pytest -v

Requires GROQ_API_KEY to be set in backend/.env.
"""

import pytest

from agents.state import BuildSmartState, create_initial_state
from agents.supervisor import REQUIRED_AGENTS, SupervisorAgent

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

USER_REQUEST = "I want to build an AI customer-support assistant."

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def supervisor() -> SupervisorAgent:
    """Create a single SupervisorAgent for the entire test module.

    Fails clearly if GROQ_API_KEY is missing.
    """
    try:
        return SupervisorAgent()
    except Exception as exc:
        pytest.fail(
            f"Failed to create SupervisorAgent.\n"
            f"Make sure GROQ_API_KEY is set in backend/.env\n"
            f"Original error: {exc}"
        )


@pytest.fixture(scope="module")
def result_state(supervisor: SupervisorAgent) -> BuildSmartState:
    """Run the Supervisor once and share the result across all tests.

    Using module scope avoids paying the Groq API latency 10 times.
    """
    initial = create_initial_state(USER_REQUEST)
    return supervisor.run(initial)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_supervisor_can_be_imported() -> None:
    """TEST 1 — SupervisorAgent can be imported from agents.supervisor."""
    from agents.supervisor import SupervisorAgent as _SA  # noqa: F401


def test_supervisor_can_be_instantiated() -> None:
    """TEST 2 — SupervisorAgent can be instantiated with the existing Groq client."""
    agent = SupervisorAgent()
    assert agent is not None


def test_execution_plan_is_not_empty(result_state: BuildSmartState) -> None:
    """TEST 3 — Supervisor returns a non-empty execution_plan."""
    assert result_state["execution_plan"], (
        "execution_plan must not be empty after Supervisor runs"
    )


def test_plan_contains_all_required_agents(result_state: BuildSmartState) -> None:
    """TEST 4 — The plan contains all six required BuildSmart agents."""
    plan_agents = [step["agent"] for step in result_state["execution_plan"]]
    for required in REQUIRED_AGENTS:
        assert required in plan_agents, (
            f"Required agent '{required}' is missing from the execution plan.\n"
            f"Actual agents in plan: {plan_agents}"
        )


def test_each_plan_step_has_required_fields(result_state: BuildSmartState) -> None:
    """TEST 5 — Each plan step contains step, agent, and objective."""
    for step in result_state["execution_plan"]:
        assert "step" in step, f"Missing 'step' key in: {step}"
        assert "agent" in step, f"Missing 'agent' key in: {step}"
        assert "objective" in step, f"Missing 'objective' key in: {step}"
        assert isinstance(step["step"], int), (
            f"'step' must be an int, got {type(step['step'])}"
        )
        assert isinstance(step["agent"], str) and step["agent"], (
            f"'agent' must be a non-empty str, got: {step['agent']!r}"
        )
        assert isinstance(step["objective"], str) and step["objective"], (
            f"'objective' must be a non-empty str, got: {step['objective']!r}"
        )


def test_user_request_preserved_in_state(result_state: BuildSmartState) -> None:
    """TEST 6 — The returned state still contains the original user_request."""
    assert result_state["user_request"] == USER_REQUEST


def test_status_is_plan_created(result_state: BuildSmartState) -> None:
    """TEST 7 — After successful execution, status is 'PLAN_CREATED'."""
    assert result_state["status"] == "PLAN_CREATED", (
        f"Expected status 'PLAN_CREATED', got: {result_state['status']!r}"
    )


def test_current_agent_is_supervisor(result_state: BuildSmartState) -> None:
    """TEST 8 — current_agent remains 'SupervisorAgent' after execution."""
    assert result_state["current_agent"] == "SupervisorAgent"


def test_supervisor_is_in_agent_history(result_state: BuildSmartState) -> None:
    """TEST 9 — 'SupervisorAgent' is recorded in agent_history."""
    assert "SupervisorAgent" in result_state["agent_history"], (
        f"Expected 'SupervisorAgent' in agent_history, "
        f"got: {result_state['agent_history']}"
    )


def test_execution_plan_stored_in_state(result_state: BuildSmartState) -> None:
    """TEST 10 — execution_plan is stored as a list of dicts in state."""
    assert isinstance(result_state["execution_plan"], list)
    for step in result_state["execution_plan"]:
        assert isinstance(step, dict), (
            f"Each plan step must be a dict, got: {type(step)}"
        )
