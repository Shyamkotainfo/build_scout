import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from config.settings import get_settings
from llm.client import get_llm
from llm.prompts import EVALUATION_SYSTEM_PROMPT


class RawEvaluationResult(BaseModel):
    """Pydantic model for the raw LLM output of an evaluation."""
    candidate_id: str
    component_id: str
    relevance_score: Optional[float] = None
    compatibility_score: Optional[float] = None
    project_health_score: Optional[float] = None
    license_score: Optional[float] = None
    security_score: Optional[float] = None
    maintainability_score: Optional[float] = None
    strengths: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)


class RawEvaluationsResponse(BaseModel):
    """Container for multiple evaluations."""
    evaluations: List[RawEvaluationResult]


class EvaluationAgent:
    """Agent responsible for evaluating candidates against project requirements."""

    WEIGHTS = {
        "relevance_score": 0.25,
        "compatibility_score": 0.20,
        "project_health_score": 0.15,
        "license_score": 0.10,
        "security_score": 0.15,
        "maintainability_score": 0.15,
    }

    def __init__(self):
        self.settings = get_settings()
        self.llm = get_llm()
        self.llm_json = self.llm.bind(response_format={"type": "json_object"})

    def _calculate_overall_score(self, raw_eval: RawEvaluationResult) -> float:
        """Deterministically calculate the overall score based on available evidence."""
        total_score = 0.0
        total_weight = 0.0

        for field, weight in self.WEIGHTS.items():
            val = getattr(raw_eval, field)
            if val is not None:
                total_score += val * weight
                total_weight += weight

        if total_weight == 0.0:
            return 0.0

        # Normalize score based on the dimensions that had evidence
        return round(total_score / total_weight, 2)

    def run(self, state: BuildSmartState) -> BuildSmartState:
        """Evaluate candidates using LLM and deterministic scoring."""
        # 1. Update status
        state["status"] = "EVALUATING"
        state["current_agent"] = "EvaluationAgent"

        candidates = state.get("candidates", [])
        if not candidates:
            state["status"] = "EVALUATED"
            state["agent_history"].append("EvaluationAgent")
            return state

        # 2. Prepare payload
        payload = {
            "domain": state.get("domain", ""),
            "requirements": state.get("requirements", []),
            "components": state.get("components", []),
            "candidates": candidates,
        }

        messages = [
            SystemMessage(content=EVALUATION_SYSTEM_PROMPT),
            HumanMessage(content=json.dumps(payload, indent=2))
        ]

        # 3. Call LLM
        response = self.llm_json.invoke(messages)
        
        try:
            content = json.loads(response.content)
            parsed_response = RawEvaluationsResponse.model_validate(content)
        except Exception as e:
            print(f"Error parsing EvaluationAgent response: {e}")
            parsed_response = RawEvaluationsResponse(evaluations=[])

        # 4. Enrich results with deterministic overall score
        final_evaluations = []
        for raw_eval in parsed_response.evaluations:
            eval_dict = raw_eval.model_dump()
            eval_dict["overall_score"] = self._calculate_overall_score(raw_eval)
            final_evaluations.append(eval_dict)

        # 5. Update state
        state["evaluations"] = final_evaluations
        state["status"] = "EVALUATED"
        state["agent_history"].append("EvaluationAgent")

        return state
