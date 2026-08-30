"""
state.py — BuildSmart shared agent state.

Defines the single TypedDict that flows through every agent in the
BuildSmart pipeline:

    User → Supervisor → Decomposition → Research → Evaluation
         → Decision → Blueprint → Validation

All agents read from and write to this same state contract.

Compatible with LangGraph's StateGraph(BuildSmartState) for future use.
No external calls are made in this module.
"""

import uuid
from typing import TypedDict


# ---------------------------------------------------------------------------
# Shared state contract
# ---------------------------------------------------------------------------

class BuildSmartState(TypedDict):
    """Shared state for all BuildSmart agents.

    Fields are grouped by the agent pipeline stage that primarily owns them.
    All agents may read any field; only the owning agent should write to it.
    """

    # ------------------------------------------------------------------
    # Analysis — owned by Supervisor
    # ------------------------------------------------------------------
    analysis_id: str
    """Unique identifier for this analysis run (UUID v4)."""

    user_request: str
    """The raw, unmodified request text submitted by the user."""

    normalized_request: str
    """Cleaned / normalised version of the user request (set by Decomposition)."""

    domain: str
    """High-level domain label e.g. 'document_intelligence' (set by Decomposition)."""

    status: str
    """
    Pipeline status. Allowed values:
      CREATED | PLANNING | PLAN_CREATED | DECOMPOSING | SEARCHING |
      EVALUATING | DECIDING | BLUEPRINT_GENERATING | VALIDATING |
      COMPLETED | FAILED
    """

    # ------------------------------------------------------------------
    # Requirements — owned by Decomposition Agent
    # ------------------------------------------------------------------
    requirements: list[dict]
    """
    Business/technical requirements derived from the user request.
    Each dict maps to the `requirement` entity in the data model.
    """

    # ------------------------------------------------------------------
    # Components — owned by Decomposition Agent
    # ------------------------------------------------------------------
    components: list[dict]
    """
    Normalised technical components (e.g. DOCUMENT_PARSING, VECTOR_DATABASE).
    Each dict maps to the `component` entity in the data model.
    """

    # ------------------------------------------------------------------
    # Candidates — owned by Research Agent
    # ------------------------------------------------------------------
    candidates: list[dict]
    """
    Reusable open-source candidates found for each component.
    Each dict maps to the `candidate` entity in the data model.
    """

    # ------------------------------------------------------------------
    # Evaluations — owned by Evaluation Agent
    # ------------------------------------------------------------------
    evaluations: list[dict]
    """
    Scored evaluations for each candidate.
    Each dict maps to `candidate_evaluation` in the data model.
    Includes compatibility, health, security, license, adoption, maintenance scores.
    """

    # ------------------------------------------------------------------
    # Decisions — owned by Decision Agent
    # ------------------------------------------------------------------
    decisions: list[dict]
    """
    REUSE / ADAPT / BUILD decisions, one per component.
    Each dict maps to the `decision` entity in the data model.
    """

    # ------------------------------------------------------------------
    # Execution plan — owned by Supervisor Agent
    # ------------------------------------------------------------------
    execution_plan: list[dict]
    """
    Ordered sequence of agent tasks created by the Supervisor.
    Each dict has: step (int), agent (str), objective (str).
    """

    # ------------------------------------------------------------------
    # Blueprint — owned by Blueprint Agent
    # ------------------------------------------------------------------
    blueprint: dict
    """
    Final implementation blueprint (architecture, component mapping,
    integration flow, tech stack, effort estimate, risks).
    Maps to the `blueprint` entity in the data model.
    """

    # ------------------------------------------------------------------
    # Validation — owned by Validation Agent
    # ------------------------------------------------------------------
    validation_result: dict
    """
    Outcome of the Validation Agent's checks.
    Contains pass/fail status, failed checks, and remediation hints.
    """

    # ------------------------------------------------------------------
    # Agent execution — owned by Supervisor / runtime
    # ------------------------------------------------------------------
    current_agent: str
    """Name of the agent currently executing (e.g. 'SupervisorAgent')."""

    agent_history: list[str]
    """Ordered list of agent names that have executed in this pipeline run."""

    traces: list[dict]
    """Ordered list of execution traces (Agent Trace + MCP tool calls)."""

    retry_count: int
    """Number of retry loops performed (bounded by Supervisor guardrails)."""


# ---------------------------------------------------------------------------
# Factory
# ---------------------------------------------------------------------------

def create_initial_state(user_request: str) -> BuildSmartState:
    """Create a fresh BuildSmartState for a new analysis run.

    Args:
        user_request: The raw text submitted by the user.

    Returns:
        BuildSmartState: A fully initialised state with a generated
        analysis_id and all collection fields set to empty defaults.

    No external calls are made — no LLM, no API, no DB.
    """
    return BuildSmartState(
        # Analysis
        analysis_id=str(uuid.uuid4()),
        user_request=user_request,
        normalized_request="",
        domain="",
        status="CREATED",
        # Pipeline data
        requirements=[],
        components=[],
        candidates=[],
        evaluations=[],
        decisions=[],
        execution_plan=[],
        # Outputs
        blueprint={},
        validation_result={},
        # Agent execution
        current_agent="SupervisorAgent",
        agent_history=[],
        traces=[],
        retry_count=0,
    )
