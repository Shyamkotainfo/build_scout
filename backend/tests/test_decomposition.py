"""
test_decomposition.py — Integration tests for the BuildSmart Decomposition Agent.

These are REAL integration tests. They call the Groq API using the key
configured in backend/.env. Do NOT mock Groq here.

Run with:
    pytest -v

Requires GROQ_API_KEY to be set in backend/.env.
"""

import pytest

from agents.decomposition import VALID_CATEGORIES, DecompositionAgent
from agents.state import BuildSmartState, create_initial_state

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

USER_REQUEST = "I want to build an AI customer-support assistant."

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def agent() -> DecompositionAgent:
    """Create a single DecompositionAgent for the entire test module.

    Fails clearly if GROQ_API_KEY is missing.
    """
    try:
        return DecompositionAgent()
    except Exception as exc:
        pytest.fail(
            f"Failed to create DecompositionAgent.\n"
            f"Make sure GROQ_API_KEY is set in backend/.env\n"
            f"Original error: {exc}"
        )


@pytest.fixture(scope="module")
def result_state(agent: DecompositionAgent) -> BuildSmartState:
    """Run the Decomposition Agent once and share the result across all tests.

    Module scope avoids paying Groq API latency 15 times.
    """
    initial = create_initial_state(USER_REQUEST)
    return agent.run(initial)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_decomposition_agent_can_be_imported() -> None:
    """TEST 1 — DecompositionAgent can be imported."""
    from agents.decomposition import DecompositionAgent as _DA  # noqa: F401


def test_decomposition_agent_can_be_instantiated() -> None:
    """TEST 2 — DecompositionAgent can be instantiated with the Groq client."""
    da = DecompositionAgent()
    assert da is not None


def test_valid_state_can_be_passed(agent: DecompositionAgent) -> None:
    """TEST 3 — A valid BuildSmartState can be passed to the agent."""
    state = create_initial_state("Build a simple web API.")
    # Just verifying run() accepts the state and returns one — uses real Groq.
    result = agent.run(state)
    assert isinstance(result, dict)


def test_normalized_request_is_not_empty(result_state: BuildSmartState) -> None:
    """TEST 4 — The agent returns a non-empty normalized_request."""
    assert result_state["normalized_request"], (
        "normalized_request must not be empty after decomposition."
    )


def test_domain_is_not_empty(result_state: BuildSmartState) -> None:
    """TEST 5 — The agent returns a non-empty domain."""
    assert result_state["domain"], (
        "domain must not be empty after decomposition."
    )


def test_at_least_one_requirement(result_state: BuildSmartState) -> None:
    """TEST 6 — The agent returns at least one requirement."""
    assert len(result_state["requirements"]) >= 1, (
        "requirements list must contain at least one item."
    )


def test_at_least_one_component(result_state: BuildSmartState) -> None:
    """TEST 7 — The agent returns at least one component."""
    assert len(result_state["components"]) >= 1, (
        "components list must contain at least one item."
    )


def test_every_requirement_has_required_fields(result_state: BuildSmartState) -> None:
    """TEST 8 — Every requirement contains id, description, and priority."""
    for req in result_state["requirements"]:
        assert "id" in req, f"Missing 'id' in requirement: {req}"
        assert "description" in req, f"Missing 'description' in requirement: {req}"
        assert "priority" in req, f"Missing 'priority' in requirement: {req}"
        assert req["id"], "requirement 'id' must not be empty"
        assert req["description"], "requirement 'description' must not be empty"
        assert req["priority"] in ("HIGH", "MEDIUM", "LOW"), (
            f"Invalid priority '{req['priority']}' — must be HIGH, MEDIUM, or LOW"
        )


def test_every_component_has_required_fields(result_state: BuildSmartState) -> None:
    """TEST 9 — Every component contains id, name, description, and category."""
    for comp in result_state["components"]:
        assert "id" in comp, f"Missing 'id' in component: {comp}"
        assert "name" in comp, f"Missing 'name' in component: {comp}"
        assert "description" in comp, f"Missing 'description' in component: {comp}"
        assert "category" in comp, f"Missing 'category' in component: {comp}"
        assert comp["id"], "component 'id' must not be empty"
        assert comp["name"], "component 'name' must not be empty"
        assert comp["description"], "component 'description' must not be empty"
        assert comp["category"] in VALID_CATEGORIES, (
            f"Invalid category '{comp['category']}' — "
            f"must be one of {sorted(VALID_CATEGORIES)}"
        )


def test_component_ids_are_unique(result_state: BuildSmartState) -> None:
    """TEST 10 — Component IDs are unique across the list."""
    ids = [c["id"] for c in result_state["components"]]
    assert len(ids) == len(set(ids)), (
        f"Duplicate component IDs found: {ids}"
    )


def test_requirement_ids_are_unique(result_state: BuildSmartState) -> None:
    """TEST 11 — Requirement IDs are unique across the list."""
    ids = [r["id"] for r in result_state["requirements"]]
    assert len(ids) == len(set(ids)), (
        f"Duplicate requirement IDs found: {ids}"
    )


def test_user_request_is_unchanged(result_state: BuildSmartState) -> None:
    """TEST 12 — The original user_request is preserved unchanged."""
    assert result_state["user_request"] == USER_REQUEST


def test_status_is_decomposed(result_state: BuildSmartState) -> None:
    """TEST 13 — After execution, status is 'DECOMPOSED'."""
    assert result_state["status"] == "DECOMPOSED", (
        f"Expected status 'DECOMPOSED', got: {result_state['status']!r}"
    )


def test_current_agent_is_decomposition(result_state: BuildSmartState) -> None:
    """TEST 14 — current_agent is 'DecompositionAgent' after execution."""
    assert result_state["current_agent"] == "DecompositionAgent"


def test_decomposition_agent_in_history(result_state: BuildSmartState) -> None:
    """TEST 15 — 'DecompositionAgent' is recorded in agent_history."""
    assert "DecompositionAgent" in result_state["agent_history"], (
        f"Expected 'DecompositionAgent' in agent_history, "
        f"got: {result_state['agent_history']}"
    )
