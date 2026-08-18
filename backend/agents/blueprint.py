import json
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from config.settings import get_settings
from llm.client import get_llm
from llm.prompts import BLUEPRINT_SYSTEM_PROMPT
from llm.retry import invoke_with_retry


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
        self.llm_json = self.llm.bind(response_format={"type": "json_object"})

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
        """Generate a system blueprint based on REUSE/ADAPT/BUILD decisions."""
        # 1. Update status
        state["status"] = "BLUEPRINTING"
        state["current_agent"] = "BlueprintAgent"

        decisions = state.get("decisions", [])
        analysis_id = state.get("analysis_id", "unknown")
        
        # Only pass candidates and evaluations that were actually selected
        selected_candidate_ids = {
            d["selected_candidate_id"] for d in decisions if d.get("selected_candidate_id")
        }
        filtered_candidates = [
            c for c in state.get("candidates", []) if c["id"] in selected_candidate_ids
        ]
        
        # Only pass evaluations for components that we decided to reuse/adapt
        components_reused = {
            d["component_id"] for d in decisions if d.get("decision") in ("REUSE", "ADAPT")
        }
        filtered_evaluations = [
            e for e in state.get("evaluations", []) if e["component_id"] in components_reused and e["candidate_id"] in selected_candidate_ids
        ]

        # 2. Prepare payload for the LLM
        payload = {
            "user_request": state.get("user_request", ""),
            "normalized_request": state.get("normalized_request", ""),
            "domain": state.get("domain", ""),
            "requirements": state.get("requirements", []),
            "components": state.get("components", []),
            "candidates": filtered_candidates,
            "evaluations": filtered_evaluations,
            "decisions": decisions
        }

        messages = [
            SystemMessage(content=BLUEPRINT_SYSTEM_PROMPT),
            HumanMessage(content=json.dumps(payload, indent=2))
        ]

        # 3. Call LLM
        response = invoke_with_retry(
            llm_callable=self.llm_json.invoke,
            messages=messages,
            agent_name="BlueprintAgent",
            analysis_id=analysis_id,
            context_compactor=lambda msgs, limit: msgs  # Blueprint payload shouldn't be huge after filtering
        )
        
        try:
            content = json.loads(response.content)
            parsed_blueprint = BlueprintResult.model_validate(content)
            
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
        except Exception as e:
            print(f"Error parsing BlueprintAgent response: {e}")
            state["blueprint"] = {}
            state["status"] = "BLUEPRINT_FAILED"

        return state
