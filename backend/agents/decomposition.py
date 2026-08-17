"""
decomposition.py — BuildSmart Decomposition Agent.

The Decomposition Agent is the second agent in the BuildSmart pipeline.

Responsibilities:
  - Receive the raw user_request from BuildSmartState.
  - Normalise the request into a concise technical description.
  - Identify the broad technical/business domain.
  - Identify functional requirements.
  - Identify technical components with canonical names and categories.
  - Store results in BuildSmartState.
  - Update status: PLAN_CREATED → DECOMPOSING → DECOMPOSED.
  - Record itself in agent_history.

The Decomposition Agent does NOT:
  - Search GitHub, the web, or any external source.
  - Recommend specific libraries or packages.
  - Make REUSE / ADAPT / BUILD decisions.
  - Evaluate candidate implementations.
  - Call MCP tools.

No LangGraph graph is created here — that is a future step.
"""

import json
from typing import Any, Literal

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from pydantic import BaseModel, Field

from agents.state import BuildSmartState
from llm.client import get_llm
from llm.prompts import DECOMPOSITION_SYSTEM_PROMPT


# ---------------------------------------------------------------------------
# Pydantic models for structured LLM output
# ---------------------------------------------------------------------------

Priority = Literal["HIGH", "MEDIUM", "LOW"]

VALID_CATEGORIES = {
    "INGESTION", "PROCESSING", "AI", "STORAGE", "RETRIEVAL",
    "BACKEND", "FRONTEND", "SECURITY", "INTEGRATION", "OBSERVABILITY",
}


class Requirement(BaseModel):
    """A single functional requirement for the solution."""

    id: str = Field(description="Unique ID in the format REQ-001.")
    description: str = Field(description="What the solution must do.")
    priority: Priority = Field(description="Priority: HIGH, MEDIUM, or LOW.")


class Component(BaseModel):
    """A discrete technical component required by the solution."""

    id: str = Field(description="Unique ID in the format COMP-001.")
    name: str = Field(description="Canonical component name in UPPER_SNAKE_CASE.")
    description: str = Field(description="What this component does in this solution.")
    category: str = Field(description="Component category from the controlled list.")


class DecompositionResult(BaseModel):
    """Full structured output from the Decomposition Agent LLM call."""

    normalized_request: str = Field(
        description="Concise technical restatement of the user request."
    )
    domain: str = Field(
        description="Broad technical/business domain of the solution."
    )
    requirements: list[Requirement] = Field(
        description="Functional requirements the solution must satisfy."
    )
    components: list[Component] = Field(
        description="Technical components needed to fulfil the requirements."
    )


# ---------------------------------------------------------------------------
# DecompositionAgent
# ---------------------------------------------------------------------------

class DecompositionAgent:
    """Transforms a user solution idea into structured requirements and components.

    Usage:
        agent = DecompositionAgent()
        updated_state = agent.run(state)
    """

    def __init__(self) -> None:
        self._llm = get_llm()

    def run(self, state: BuildSmartState) -> BuildSmartState:
        """Execute decomposition on the current state.

        Args:
            state: BuildSmartState containing at least user_request.

        Returns:
            BuildSmartState: Updated with normalized_request, domain,
            requirements, components, status, current_agent, agent_history.

        Raises:
            RuntimeError: If the Groq call fails or the response cannot
            be parsed into a valid DecompositionResult.
        """
        user_request: str = state["user_request"]

        state["status"] = "DECOMPOSING"

        result = self._call_llm(user_request)

        # Write structured results back into shared state
        state["normalized_request"] = result.normalized_request
        state["domain"] = result.domain
        state["requirements"] = [r.model_dump() for r in result.requirements]
        state["components"] = [c.model_dump() for c in result.components]

        state["status"] = "DECOMPOSED"
        state["current_agent"] = "DecompositionAgent"
        state["agent_history"].append("DecompositionAgent")

        return state

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _call_llm(self, user_request: str) -> DecompositionResult:
        """Send user_request to Groq in JSON mode and parse the result.

        Uses json_object response format (same pattern as SupervisorAgent)
        to avoid Groq tool-calling issues. Validates via Pydantic.

        Args:
            user_request: The raw text submitted by the user.

        Returns:
            DecompositionResult: Validated structured decomposition.

        Raises:
            RuntimeError: If the API call fails or JSON cannot be parsed.
        """
        json_llm = self._llm.bind(response_format={"type": "json_object"})

        messages: list[Any] = [
            SystemMessage(content=DECOMPOSITION_SYSTEM_PROMPT),
            HumanMessage(content=user_request),
        ]

        try:
            response: AIMessage = json_llm.invoke(messages)
            raw: dict = json.loads(response.content)
            return DecompositionResult.model_validate(raw)
        except Exception as exc:
            raise RuntimeError(
                f"DecompositionAgent failed to parse LLM response.\n"
                f"Original error: {exc}"
            ) from exc
