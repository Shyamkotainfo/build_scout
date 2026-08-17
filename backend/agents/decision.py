import json
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, model_validator

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from config.settings import get_settings
from llm.client import get_llm
from llm.prompts import DECISION_SYSTEM_PROMPT


class RawDecisionResult(BaseModel):
    """Pydantic model for the raw LLM output of a decision."""
    component_id: str
    decision: Literal["REUSE", "ADAPT", "BUILD"]
    selected_candidate_id: Optional[str] = None
    selected_candidate_name: Optional[str] = None
    confidence: int = Field(ge=0, le=100)
    reason: str
    alternatives_considered: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    implementation_notes: List[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_selection(self) -> "RawDecisionResult":
        if self.decision in ("REUSE", "ADAPT"):
            if not self.selected_candidate_id:
                raise ValueError(f"selected_candidate_id is required for decision {self.decision}")
        elif self.decision == "BUILD":
            if self.selected_candidate_id is not None:
                raise ValueError("selected_candidate_id must be null for BUILD decision")
            if self.selected_candidate_name is not None:
                raise ValueError("selected_candidate_name must be null for BUILD decision")
        return self


class RawDecisionsResponse(BaseModel):
    """Container for multiple decisions."""
    decisions: List[RawDecisionResult]


class DecisionAgent:
    """Agent responsible for deciding whether to REUSE, ADAPT, or BUILD components."""

    def __init__(self):
        self.settings = get_settings()
        self.llm = get_llm()
        self.llm_json = self.llm.bind(response_format={"type": "json_object"})

    def run(self, state: BuildSmartState) -> BuildSmartState:
        """Process evaluations and make REUSE/ADAPT/BUILD decisions."""
        # 1. Update status
        state["status"] = "DECIDING"
        state["current_agent"] = "DecisionAgent"
        if "decisions" not in state:
            state["decisions"] = []

        components = state.get("components", [])
        evaluations = state.get("evaluations", [])
        candidates = state.get("candidates", [])
        
        # We process components individually or collectively.
        # It's better to isolate components that have no evaluations to decide deterministically.
        components_with_evals = []
        final_decisions = []
        
        evals_by_comp = {}
        for ev in evaluations:
            comp_id = ev["component_id"]
            if comp_id not in evals_by_comp:
                evals_by_comp[comp_id] = []
            evals_by_comp[comp_id].append(ev)

        for comp in components:
            comp_id = comp["id"]
            if comp_id not in evals_by_comp or not evals_by_comp[comp_id]:
                # Deterministic BUILD decision
                final_decisions.append({
                    "component_id": comp_id,
                    "decision": "BUILD",
                    "selected_candidate_id": None,
                    "selected_candidate_name": None,
                    "confidence": 100,
                    "reason": "No evaluated reusable candidate is available for this component.",
                    "alternatives_considered": [],
                    "risks": ["Building from scratch will increase development time."],
                    "implementation_notes": [f"Implement the {comp['name']} capability internally."]
                })
            else:
                components_with_evals.append(comp)

        if components_with_evals:
            # 2. Prepare payload for the LLM for remaining components
            payload = {
                "requirements": state.get("requirements", []),
                "components": components_with_evals,
                "candidates": candidates,
                "evaluations": [ev for comp in components_with_evals for ev in evals_by_comp.get(comp["id"], [])]
            }

            messages = [
                SystemMessage(content=DECISION_SYSTEM_PROMPT),
                HumanMessage(content=json.dumps(payload, indent=2))
            ]

            # 3. Call LLM
            response = self.llm_json.invoke(messages)
            
            try:
                content = json.loads(response.content)
                parsed_response = RawDecisionsResponse.model_validate(content)
                for raw_dec in parsed_response.decisions:
                    final_decisions.append(raw_dec.model_dump())
            except Exception as e:
                print(f"Error parsing DecisionAgent response: {e}")

        # 5. Update state
        state["decisions"] = final_decisions
        state["status"] = "DECIDED"
        state["agent_history"].append("DecisionAgent")

        return state
