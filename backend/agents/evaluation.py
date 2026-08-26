import json
import asyncio
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from config.settings import get_settings
from llm.client import get_llm
from llm.prompts import EVALUATION_SYSTEM_PROMPT
from llm.retry import ainvoke_with_retry
from tools.gateway import UnifiedToolGateway


class RawEvaluationResult(BaseModel):
    """Pydantic model for the raw LLM output of an evaluation."""
    candidate_id: str
    candidate_name: str
    component_id: str
    relevance_score: Optional[int] = None
    compatibility_score: Optional[int] = None
    project_health_score: Optional[int] = None
    license_score: Optional[int] = None
    security_score: Optional[int] = None
    maintainability_score: Optional[int] = None
    reasoning: str
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
        self.llm_json = self.llm
        self.tool_gateway = UnifiedToolGateway()

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
        """Execute the EvaluationAgent synchronously."""
        return asyncio.run(self._arun(state))

    async def _arun(self, state: BuildSmartState) -> BuildSmartState:
        """Evaluate candidates using LLM and deterministic scoring."""
        # 1. Update status
        state["status"] = "EVALUATING"
        state["current_agent"] = "EvaluationAgent"
        analysis_id = state.get("analysis_id", "unknown")

        candidates = state.get("candidates", [])
        if not candidates:
            state["status"] = "EVALUATED"
            state["agent_history"].append("EvaluationAgent")
            return state

        # 2. Fetch Evidence via ToolGateway
        enriched_candidates = []
        for cand in candidates:
            repo_name = cand.get("url") or cand.get("name")
            
            # Fetch security
            security_trace = await self.tool_gateway.execute_tool("security.get", {"repository": repo_name})
            security_evidence = security_trace.get("output", "UNKNOWN")
            
            # Fetch license
            license_trace = await self.tool_gateway.execute_tool("license.get", {"repository": repo_name})
            license_evidence = license_trace.get("output", "UNKNOWN")
            
            # Append trace records
            if "traces" not in state:
                state["traces"] = []
            
            # We record tool traces inside a mocked trace block to keep the UI happy
            state["traces"].append({
                "agent_name": "EvaluationAgent",
                "execution_order": len(state["traces"]) + 1,
                "status": "COMPLETED",
                "tool_calls": [
                    {
                        "tool_name": "security.get",
                        "provider": security_trace.get("provider", "LOCAL"),
                        "arguments": {"repository": repo_name},
                        "output": security_evidence,
                        "latency_ms": security_trace.get("latency_ms", 0)
                    },
                    {
                        "tool_name": "license.get",
                        "provider": license_trace.get("provider", "LOCAL"),
                        "arguments": {"repository": repo_name},
                        "output": license_evidence,
                        "latency_ms": license_trace.get("latency_ms", 0)
                    }
                ]
            })
            
            c_copy = cand.copy()
            c_copy["security_evidence"] = security_evidence
            c_copy["license_evidence"] = license_evidence
            enriched_candidates.append(c_copy)

        # 3. Prepare payload
        payload = {
            "domain": state.get("domain", ""),
            "requirements": state.get("requirements", []),
            "components": state.get("components", []),
            "candidates": enriched_candidates,
        }

        messages = [
            SystemMessage(content=EVALUATION_SYSTEM_PROMPT),
            HumanMessage(content=json.dumps(payload, indent=2))
        ]

        # 4. Call LLM with centralized validation
        def compactor(msgs: list[Any], limit_chars: int) -> list[Any]:
            import copy
            new_msgs = copy.deepcopy(msgs)
            for msg in new_msgs:
                if isinstance(msg, HumanMessage) and isinstance(msg.content, str):
                    try:
                        data = json.loads(msg.content)
                        if "candidates" in data:
                            for c in data["candidates"]:
                                if "description" in c:
                                    c["description"] = c["description"][:100] + "..."
                        msg.content = json.dumps(data, indent=2)
                    except Exception:
                        pass
            return new_msgs

        response = await ainvoke_with_retry(
            llm_callable=self.llm_json.ainvoke,
            messages=messages,
            agent_name="EvaluationAgent",
            analysis_id=analysis_id,
            context_compactor=compactor,
            response_model=RawEvaluationsResponse
        )
        
        parsed_response = getattr(response, "parsed_object", None)
        if not parsed_response:
            parsed_response = RawEvaluationsResponse(evaluations=[])

        # 5. Enrich results with deterministic overall score
        final_evaluations = []
        for raw_eval in parsed_response.evaluations:
            eval_dict = raw_eval.model_dump()
            eval_dict["overall_score"] = int(self._calculate_overall_score(raw_eval))
            final_evaluations.append(eval_dict)

        # 6. Update state
        state["evaluations"] = final_evaluations
        state["status"] = "EVALUATED"
        state["agent_history"].append("EvaluationAgent")

        return state
