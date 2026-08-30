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
from agents.context import build_evaluation_context


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

        all_candidates = state.get("candidates", [])
        candidates = [c for c in all_candidates if c.get("status") == "shortlisted"]
        
        if not candidates:
            state["status"] = "EVALUATED"
            state["agent_history"].append("EvaluationAgent")
            return state

        # 2. Fetch Evidence via ToolGateway Concurrently
        EVIDENCE_CONCURRENCY = getattr(self.settings, "evidence_concurrency", 10)
        evidence_sem = asyncio.Semaphore(EVIDENCE_CONCURRENCY)
        
        if "traces" not in state:
            state["traces"] = []
            
        agent_traces = []

        async def fetch_evidence(cand):
            async with evidence_sem:
                repo_name = cand.get("url") or cand.get("name")
                
                # Fetch security and license concurrently for this candidate
                sec_task = self.tool_gateway.execute_tool("security.get", {"repository": repo_name})
                lic_task = self.tool_gateway.execute_tool("license.get", {"repository": repo_name})
                security_trace, license_trace = await asyncio.gather(sec_task, lic_task)
                
                security_evidence = security_trace.get("output", "UNKNOWN")
                license_evidence = license_trace.get("output", "UNKNOWN")
                
                trace_block = {
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
                }
                
                c_copy = cand.copy()
                c_copy["security_evidence"] = security_evidence
                c_copy["license_evidence"] = license_evidence
                return c_copy, trace_block

        evidence_tasks = [fetch_evidence(cand) for cand in candidates]
        evidence_results = await asyncio.gather(*evidence_tasks)
        
        enriched_candidates = []
        for c_copy, trace_block in evidence_results:
            enriched_candidates.append(c_copy)
            agent_traces.append(trace_block)
            
        # Append traces deterministically
        state["traces"].extend(agent_traces)

        # 3. Group candidates by component
        cands_by_comp = {}
        for cand in enriched_candidates:
            comp_id = cand.get("component_id")
            if comp_id:
                if comp_id not in cands_by_comp:
                    cands_by_comp[comp_id] = []
                cands_by_comp[comp_id].append(cand)

        # 4. Call LLM concurrently per component
        EVALUATION_CONCURRENCY = getattr(self.settings, "evaluation_concurrency", 4)
        eval_sem = asyncio.Semaphore(EVALUATION_CONCURRENCY)
        
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
            
        async def evaluate_component_candidates(comp_id, comp_cands):
            async with eval_sem:
                # Find the specific component
                target_comp = None
                for comp in state.get("components", []):
                    if comp.get("id") == comp_id:
                        target_comp = comp
                        break
                        
                payload = build_evaluation_context(
                    domain=state.get("domain", ""),
                    requirements=state.get("requirements", []),
                    component=target_comp,
                    candidates=comp_cands
                )

                messages = [
                    SystemMessage(content=EVALUATION_SYSTEM_PROMPT),
                    HumanMessage(content=json.dumps(payload, indent=2))
                ]
                
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
                    return []
                return parsed_response.evaluations
                
        eval_tasks = [evaluate_component_candidates(cid, cands) for cid, cands in cands_by_comp.items()]
        eval_results_lists = await asyncio.gather(*eval_tasks)
        
        all_raw_evaluations = []
        for eval_list in eval_results_lists:
            all_raw_evaluations.extend(eval_list)

        # 5. Enrich results with deterministic overall score
        final_evaluations = []
        for raw_eval in all_raw_evaluations:
            eval_dict = raw_eval.model_dump()
            eval_dict["overall_score"] = int(self._calculate_overall_score(raw_eval))
            final_evaluations.append(eval_dict)

        # 6. Update state
        state["evaluations"] = final_evaluations
        state["status"] = "EVALUATED"
        state["agent_history"].append("EvaluationAgent")

        return state
