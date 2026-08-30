"""
supervisor.py — BuildSmart Supervisor Agent.

The Supervisor is the first agent to execute in every BuildSmart pipeline run.

Responsibilities:
  - Understand the user's high-level solution request.
  - Create a structured execution plan for the specialist agents.
  - Store the plan in BuildSmartState["execution_plan"].
  - Update status: CREATED → PLANNING → PLAN_CREATED.
  - Record itself in agent_history.

The Supervisor does NOT:
  - Search GitHub, the web, or any external source.
  - Make REUSE / ADAPT / BUILD decisions.
  - Generate the final architecture.
  - Call MCP tools.

No LangGraph graph is created here — that is a future step.
"""

import json
from utils.json_helpers import extract_json
from typing import Any

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from pydantic import BaseModel

from agents.state import BuildSmartState
from llm.client import get_llm
from llm.prompts import SUPERVISOR_SYSTEM_PROMPT
from llm.retry import invoke_with_retry


# ---------------------------------------------------------------------------
# Structured output models
# ---------------------------------------------------------------------------

class PlanStep(BaseModel):
    """A single step in the Supervisor's execution plan."""

    step: int
    agent: str
    objective: str


class SupervisorPlan(BaseModel):
    """The full execution plan returned by the Supervisor LLM call."""

    plan: list[PlanStep]


# ---------------------------------------------------------------------------
# Required agent sequence — used for plan validation in tests
# ---------------------------------------------------------------------------

REQUIRED_AGENTS: list[str] = [
    "DecompositionAgent",
    "ResearchAgent",
    "EvaluationAgent",
    "DecisionAgent",
    "BlueprintAgent",
    "ValidationAgent",
]


# ---------------------------------------------------------------------------
# SupervisorAgent
# ---------------------------------------------------------------------------

class SupervisorAgent:
    """Coordinator agent that turns a user request into an execution plan.

    Usage:
        agent = SupervisorAgent()
        updated_state = agent.run(state)
    """

    def __init__(self) -> None:
        self._llm = get_llm()

    def run(self, state: BuildSmartState) -> BuildSmartState:
        """Execute the Supervisor: plan the BuildSmart pipeline for this request.

        Args:
            state: The current BuildSmartState (must contain user_request).

        Returns:
            BuildSmartState: Updated state with execution_plan, status,
            current_agent, and agent_history populated.
        """
        user_request: str = state["user_request"]

        # Mark planning in progress
        state["status"] = "PLANNING"

        # Call Groq with structured output
        analysis_id = state.get("analysis_id", "unknown")
        plan = self._call_llm(user_request, analysis_id)

        # Write results into state
        state["execution_plan"] = [step.model_dump() for step in plan.plan]
        state["status"] = "PLAN_CREATED"
        state["current_agent"] = "SupervisorAgent"
        state["agent_history"].append("SupervisorAgent")

        return state

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _call_llm(self, user_request: str, analysis_id: str) -> SupervisorPlan:
        """Send user_request to Groq in JSON mode and parse the plan.

        Uses json_object response format so Groq returns clean JSON without
        tool-calling overhead. The response is validated via Pydantic.

        Args:
            user_request: The raw text submitted by the user.

        Returns:
            SupervisorPlan: Validated Pydantic model containing the plan steps.

        Raises:
            ValueError: If the response cannot be parsed as a SupervisorPlan.
        """
        json_llm = self._llm

        messages: list[Any] = [
            SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT),
            HumanMessage(content=user_request),
        ]

        response = invoke_with_retry(
            llm_callable=json_llm.invoke,
            messages=messages,
            agent_name="SupervisorAgent",
            analysis_id=analysis_id
        )
        
        raw: dict = extract_json(response.content)
        return SupervisorPlan.model_validate(raw)
