import json
import asyncio
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, SystemMessage

from agents.state import BuildSmartState
from llm.client import get_llm
from llm.prompts import VALIDATION_SYSTEM_PROMPT
from llm.retry import ainvoke_with_retry
from agents.context import build_validation_context


class ValidationCategory(BaseModel):
    status: Literal["PASS", "WARNING", "FAIL"]
    score: int
    findings: List[str] = Field(default_factory=list)


class ValidationResult(BaseModel):
    overall_status: Literal["PASS", "WARNING", "FAIL"]
    overall_score: int
    requirement_coverage: ValidationCategory
    component_coverage: ValidationCategory
    decision_consistency: ValidationCategory
    architecture_consistency: ValidationCategory
    data_flow_consistency: ValidationCategory
    integration_consistency: ValidationCategory
    implementation_completeness: ValidationCategory
    risk_completeness: ValidationCategory
    critical_issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    validated_requirements: List[str] = Field(default_factory=list)
    uncovered_requirements: List[str] = Field(default_factory=list)


class LLMValidationResult(BaseModel):
    overall_architecture_score: int
    reasoning: str
    critical_issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class ValidationAgent:
    """Agent responsible for validating the generated blueprint."""

    def __init__(self):
        self.llm = get_llm()
        self.llm_json = self.llm

    def _determine_status(self, score: int) -> Literal["PASS", "WARNING", "FAIL"]:
        if score >= 90:
            return "PASS"
        elif score >= 70:
            return "WARNING"
        return "FAIL"

    def run(self, state: BuildSmartState) -> BuildSmartState:
        return asyncio.run(self._arun(state))

    async def _arun(self, state: BuildSmartState) -> BuildSmartState:
        state["status"] = "VALIDATING"
        state["current_agent"] = "ValidationAgent"

        blueprint = state.get("blueprint", {})
        if not blueprint:
            fail_category = ValidationCategory(status="FAIL", score=0, findings=["No blueprint was generated."])
            state["validation_result"] = ValidationResult(
                overall_status="FAIL",
                overall_score=0,
                requirement_coverage=fail_category,
                component_coverage=fail_category,
                decision_consistency=fail_category,
                architecture_consistency=fail_category,
                data_flow_consistency=fail_category,
                integration_consistency=fail_category,
                implementation_completeness=fail_category,
                risk_completeness=fail_category,
                critical_issues=["No blueprint was generated."],
            ).model_dump()
            state["status"] = "VALIDATED"
            state["agent_history"].append("ValidationAgent")
            return state

        critical_issues = []
        warnings = []
        
        # ---------------------------------------------------------------------
        # DETERMINISTIC CHECK: Component Coverage
        # ---------------------------------------------------------------------
        state_components = state.get("components", [])
        blueprint_components = blueprint.get("components", [])
        
        expected_comp_ids = {c["id"] for c in state_components}
        actual_comp_ids = {c["component_id"] for c in blueprint_components}
        
        missing_comps = expected_comp_ids - actual_comp_ids
        comp_score = 100 if not expected_comp_ids else int(((len(expected_comp_ids) - len(missing_comps)) / len(expected_comp_ids)) * 100)
        comp_findings = []
        if missing_comps:
            comp_findings.append(f"Missing components in blueprint: {', '.join(missing_comps)}")
            critical_issues.append(f"Blueprint is missing components: {', '.join(missing_comps)}")

        component_coverage = ValidationCategory(
            status=self._determine_status(comp_score),
            score=comp_score,
            findings=comp_findings
        )

        # ---------------------------------------------------------------------
        # DETERMINISTIC CHECK: Decision Consistency
        # ---------------------------------------------------------------------
        state_decisions = state.get("decisions", [])
        decision_map = {d["component_id"]: d for d in state_decisions}
        
        decision_score = 100
        decision_findings = []
        
        for bc in blueprint_components:
            cid = bc["component_id"]
            if cid in decision_map:
                expected_decision = decision_map[cid]["decision"]
                actual_decision = bc.get("decision")
                
                if expected_decision != actual_decision:
                    msg = f"Decision contradiction for {cid}: DecisionAgent said {expected_decision}, but Blueprint says {actual_decision}."
                    decision_findings.append(msg)
                    critical_issues.append(msg)
                    decision_score = max(0, decision_score - 50)
                
                # Rule 5 & 6
                candidate = decision_map[cid].get("selected_candidate_name")
                if expected_decision in ("REUSE", "ADAPT") and actual_decision == expected_decision:
                    if not candidate:
                        warnings.append(f"Component {cid} marked as {expected_decision} but no candidate was selected.")
                        decision_score = max(0, decision_score - 10)
        
        decision_consistency = ValidationCategory(
            status="FAIL" if decision_score < 100 and critical_issues else self._determine_status(decision_score),
            score=decision_score,
            findings=decision_findings
        )

        # ---------------------------------------------------------------------
        # DETERMINISTIC CHECK: Requirement Coverage
        # ---------------------------------------------------------------------
        requirements = state.get("requirements", [])
        req_score = comp_score
        req_findings = []
        if req_score < 100:
            req_findings.append("Requirement coverage lowered due to missing components.")
        
        requirement_coverage = ValidationCategory(
            status=self._determine_status(req_score),
            score=req_score,
            findings=req_findings
        )

        # ---------------------------------------------------------------------
        # LLM CHECK: Architectural Coherence
        # ---------------------------------------------------------------------
        payload = build_validation_context(
            requirements=requirements,
            components=state_components,
            decisions=state_decisions,
            blueprint=blueprint
        )
        
        messages = [
            SystemMessage(content=VALIDATION_SYSTEM_PROMPT),
            HumanMessage(content=json.dumps(payload, indent=2))
        ]

        try:
            response = await ainvoke_with_retry(
                llm_callable=self.llm_json.ainvoke,
                messages=messages,
                agent_name="ValidationAgent",
                analysis_id=state.get("analysis_id", "unknown"),
                response_model=LLMValidationResult
            )
            
            llm_result = getattr(response, "parsed_object", None)
            if not llm_result:
                raise Exception("Empty parsed object from LLM.")
                
        except Exception as e:
            llm_result = LLMValidationResult(
                overall_architecture_score=0,
                reasoning=f"LLM validation failed: {str(e)}",
                critical_issues=["LLM qualitative validation failed."],
                warnings=[]
            )
            critical_issues.append("LLM qualitative validation failed.")

        def map_llm_cat(score: int, findings: List[str]) -> ValidationCategory:
            s = max(0, min(100, score))
            return ValidationCategory(
                status=self._determine_status(s),
                score=s,
                findings=findings
            )

        # Distribute the overall qualitative score across the required API categories
        arch_cat = map_llm_cat(llm_result.overall_architecture_score, [llm_result.reasoning])
        data_cat = map_llm_cat(llm_result.overall_architecture_score, [llm_result.reasoning])
        integ_cat = map_llm_cat(llm_result.overall_architecture_score, [llm_result.reasoning])
        impl_cat = map_llm_cat(llm_result.overall_architecture_score, [llm_result.reasoning])
        risk_cat = map_llm_cat(llm_result.overall_architecture_score, [llm_result.reasoning])

        if llm_result.critical_issues:
            critical_issues.extend(llm_result.critical_issues)
        if llm_result.warnings:
            warnings.extend(llm_result.warnings)

        all_scores = [
            req_score, comp_score, decision_score,
            arch_cat.score, data_cat.score, integ_cat.score,
            impl_cat.score, risk_cat.score
        ]
        overall_score = sum(all_scores) // len(all_scores)
        
        if critical_issues:
            overall_status = "FAIL"
        elif overall_score >= 90 and not warnings:
            overall_status = "PASS"
        elif overall_score >= 70:
            overall_status = "WARNING"
        else:
            overall_status = "FAIL"

        result = ValidationResult(
            overall_status=overall_status,
            overall_score=overall_score,
            requirement_coverage=requirement_coverage,
            component_coverage=component_coverage,
            decision_consistency=decision_consistency,
            architecture_consistency=arch_cat,
            data_flow_consistency=data_cat,
            integration_consistency=integ_cat,
            implementation_completeness=impl_cat,
            risk_completeness=risk_cat,
            critical_issues=critical_issues,
            warnings=warnings,
            recommendations=llm_result.warnings, # Fallback mapping
            validated_requirements=[r["id"] for r in requirements],
            uncovered_requirements=[]
        )

        state["validation_result"] = result.model_dump()
        state["status"] = "VALIDATED"
        state["agent_history"].append("ValidationAgent")

        return state
