"""
test_state.py — Unit tests for BuildSmart shared agent state.

Tests cover:
  - Correct initial field values (17 tests — includes execution_plan).
  - UUID validity.
  - State mutability (LangGraph dict-based update pattern).

No LLM calls, no network calls, no external dependencies.

Run with:
    pytest -v
"""

import uuid

import pytest

from agents.state import BuildSmartState, create_initial_state

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

USER_REQUEST = "I want to build an AI customer-support assistant."


@pytest.fixture
def state() -> BuildSmartState:
    """Return a fresh initial state for each test."""
    return create_initial_state(USER_REQUEST)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_create_initial_state_returns_valid_state(state: BuildSmartState) -> None:
    """TEST 1 — create_initial_state() returns a valid BuildSmartState."""
    assert isinstance(state, dict), (
        "BuildSmartState must be a dict (TypedDict). "
        f"Got: {type(state)}"
    )


def test_user_request_is_stored_correctly(state: BuildSmartState) -> None:
    """TEST 2 — user_request is stored exactly as provided."""
    assert state["user_request"] == USER_REQUEST


def test_analysis_id_is_generated_and_not_empty(state: BuildSmartState) -> None:
    """TEST 3 — analysis_id is generated and non-empty."""
    assert state["analysis_id"], "analysis_id must not be empty"


def test_analysis_id_is_valid_uuid(state: BuildSmartState) -> None:
    """TEST 4 — analysis_id is a valid UUID v4 string."""
    try:
        parsed = uuid.UUID(state["analysis_id"])
    except ValueError as exc:
        pytest.fail(f"analysis_id is not a valid UUID: {exc}")
    assert str(parsed) == state["analysis_id"], (
        "analysis_id round-trip mismatch — check UUID generation"
    )


def test_status_starts_as_created(state: BuildSmartState) -> None:
    """TEST 5 — status starts as 'CREATED'."""
    assert state["status"] == "CREATED"


def test_current_agent_starts_as_supervisor(state: BuildSmartState) -> None:
    """TEST 6 — current_agent starts as 'SupervisorAgent'."""
    assert state["current_agent"] == "SupervisorAgent"


def test_requirements_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 7 — requirements starts as an empty list."""
    assert state["requirements"] == []


def test_components_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 8 — components starts as an empty list."""
    assert state["components"] == []


def test_candidates_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 9 — candidates starts as an empty list."""
    assert state["candidates"] == []


def test_evaluations_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 10 — evaluations starts as an empty list."""
    assert state["evaluations"] == []


def test_decisions_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 11 — decisions starts as an empty list."""
    assert state["decisions"] == []


def test_blueprint_starts_as_empty_dict(state: BuildSmartState) -> None:
    """TEST 12 — blueprint starts as an empty dict."""
    assert state["blueprint"] == {}


def test_validation_result_starts_as_empty_dict(state: BuildSmartState) -> None:
    """TEST 13 — validation_result starts as an empty dict."""
    assert state["validation_result"] == {}


def test_retry_count_starts_as_zero(state: BuildSmartState) -> None:
    """TEST 14 — retry_count starts as 0."""
    assert state["retry_count"] == 0


def test_agent_history_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 15 — agent_history starts as an empty list."""
    assert state["agent_history"] == []


def test_execution_plan_starts_as_empty_list(state: BuildSmartState) -> None:
    """TEST 17 — execution_plan starts as an empty list."""
    assert state["execution_plan"] == []


def test_state_can_be_updated(state: BuildSmartState) -> None:
    """TEST 16 — state dict supports mutation (LangGraph update pattern)."""
    state["components"].append({"name": "DOCUMENT_PARSING"})

    assert len(state["components"]) == 1
    assert state["components"][0]["name"] == "DOCUMENT_PARSING"


# ---------------------------------------------------------------------------
# Additional sanity: each run produces a unique analysis_id
# ---------------------------------------------------------------------------

def test_each_run_produces_unique_analysis_id() -> None:
    """Bonus — two separate runs should never share an analysis_id."""
    state_a = create_initial_state(USER_REQUEST)
    state_b = create_initial_state(USER_REQUEST)
    assert state_a["analysis_id"] != state_b["analysis_id"]
