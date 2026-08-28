import json
import asyncio
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from config.settings import get_settings
from llm.client import get_llm
from llm.prompts import BLUEPRINT_SYSTEM_PROMPT
from llm.retry import ainvoke_with_retry
from agents.context import build_blueprint_context


class TechStackItem(BaseModel):
    component_id: str
    component_name: str
    decision: Literal["REUSE", "ADAPT", "BUILD"]
    technology: str
    reason: str

class BlueprintComponent(BaseModel):
    component_id: str
    component_name: str
    decision: Literal["REUSE", "ADAPT", "BUILD"]
    technology: str
    responsibility: str
    integration: str

class IntegrationPoint(BaseModel):
    source: str
    target: str
    purpose: str

class ImplementationPhase(BaseModel):
    phase: int
    name: str
    activities: List[str]

class ReuseSummary(BaseModel):
    reuse: List[str] = Field(default_factory=list)
    adapt: List[str] = Field(default_factory=list)
    build: List[str] = Field(default_factory=list)

class BlueprintResult(BaseModel):
    """Pydantic model for the generated Blueprint."""
    solution_summary: str
    architecture_style: str
    technology_stack: List[TechStackItem] = Field(default_factory=list)
    components: List[BlueprintComponent] = Field(default_factory=list)
    data_flow: List[str] = Field(default_factory=list)
    integration_points: List[IntegrationPoint] = Field(default_factory=list)
    implementation_phases: List[ImplementationPhase] = Field(default_factory=list)
    reuse_summary: ReuseSummary = Field(default_factory=ReuseSummary)
    risks: List[str] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)


class BlueprintAgent:
    """Agent responsible for designing the system architecture based on decisions."""

    def __init__(self):
        self.settings = get_settings()
        self.llm = get_llm()
        self.llm_json = self.llm

    def _build_reuse_summary(self, decisions: List[Dict[str, Any]], components: List[Dict[str, Any]]) -> ReuseSummary:
        """Deterministically build reuse_summary from state decisions."""
        reuse_list = []
        adapt_list = []
        build_list = []

        name_map = {comp["id"]: comp["name"] for comp in components}

        for d in decisions:
            # Use selected_candidate_name if available for REUSE/ADAPT
            comp_id = d["component_id"]
            decision = d["decision"]
            candidate_name = d.get("selected_candidate_name")
            
            # For BUILD, fallback to component name. For REUSE/ADAPT, use candidate name if available, else component name.
            display_name = candidate_name if (candidate_name and decision in ("REUSE", "ADAPT")) else name_map.get(comp_id, comp_id)

            if decision == "REUSE":
                reuse_list.append(display_name)
            elif decision == "ADAPT":
                adapt_list.append(display_name)
            elif decision == "BUILD":
                build_list.append(display_name)

        return ReuseSummary(reuse=reuse_list, adapt=adapt_list, build=build_list)

    def run(self, state: BuildSmartState) -> BuildSmartState:
        """Generate a system blueprint synchronously."""
        return asyncio.run(self._arun(state))

    async def _arun(self, state: BuildSmartState) -> BuildSmartState:
        """Generate a system blueprint based on REUSE/ADAPT/BUILD decisions."""
        # 1. Update status
        state["status"] = "BLUEPRINTING"
        state["current_agent"] = "BlueprintAgent"

        decisions = state.get("decisions", [])
        analysis_id = state.get("analysis_id", "unknown")
        # Filtering previously done here is no longer needed since build_blueprint_context 
        # drops candidates and evaluations entirely.

        # 2. Prepare payload for the LLM
        payload = build_blueprint_context(
            user_request=state.get("user_request", ""),
            normalized_request=state.get("normalized_request", ""),
            domain=state.get("domain", ""),
            requirements=state.get("requirements", []),
            components=state.get("components", []),
            decisions=decisions
        )

        messages = [
            SystemMessage(content=BLUEPRINT_SYSTEM_PROMPT),
            HumanMessage(content=json.dumps(payload, indent=2))
        ]

        try:
            # 3. Call LLM
            response = await ainvoke_with_retry(
                llm_callable=self.llm_json.ainvoke,
                messages=messages,
                agent_name="BlueprintAgent",
                analysis_id=analysis_id,
                context_compactor=lambda msgs, limit: msgs,  # Blueprint payload shouldn't be huge after filtering
                response_model=BlueprintResult
            )
            
            parsed_blueprint = getattr(response, "parsed_object", None)
            if parsed_blueprint:
                # Enforce decision consistency programmatically
                decisions = state.get("decisions", [])
                decision_map = {d["component_id"]: d["decision"] for d in decisions}
                name_map = {}
                for comp in state.get("components", []):
                    name_map[comp["id"]] = comp["name"]

                # Fix component mappings
                for b_comp in parsed_blueprint.components:
                    if b_comp.component_id in decision_map:
                        b_comp.decision = decision_map[b_comp.component_id]

                # Rebuild reuse_summary to ensure 100% consistency with state
                parsed_blueprint.reuse_summary = self._build_reuse_summary(
                    decisions=state.get("decisions", []),
                    components=state.get("components", [])
                )
                
                state["blueprint"] = parsed_blueprint.model_dump()
                state["status"] = "BLUEPRINT_CREATED"
                state["agent_history"].append("BlueprintAgent")
            else:
                print("Error parsing BlueprintAgent response: Empty parsed object")
                state["blueprint"] = {}
                state["status"] = "BLUEPRINT_FAILED"
        except Exception as e:
            print(f"Error in BlueprintAgent: {e}")
            state["blueprint"] = {}
            state["status"] = "BLUEPRINT_FAILED"

        return state
