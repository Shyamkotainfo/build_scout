import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
import uuid

from database.models import (
    Analysis, Requirement, Component, Candidate,
    CandidateEvaluation, Decision, Blueprint, AgentRun
)

logger = logging.getLogger(__name__)

class AnalysisRepository:
    """Repository for persisting the entire BuildSmart analysis workflow into Lakebase."""

    @staticmethod
    def _parse_uuid(val: Any) -> Optional[uuid.UUID]:
        if not val:
            return None
        if isinstance(val, uuid.UUID):
            return val
        try:
            return uuid.UUID(str(val))
        except ValueError:
            return None

    def save_analysis(self, session: Session, state: dict) -> None:
        """
        Persists the final LangGraph state into the database.
        Runs entirely within the provided session transaction.
        Raises an exception on failure, allowing the caller to rollback.
        """
        
        def _get_or_create_uuid(val: Any, id_map: dict) -> uuid.UUID:
            if not val:
                return uuid.uuid4()
            val_str = str(val)
            if val_str in id_map:
                return id_map[val_str]
            parsed = self._parse_uuid(val)
            if parsed:
                id_map[val_str] = parsed
                return parsed
            new_id = uuid.uuid4()
            id_map[val_str] = new_id
            return new_id

        analysis_id = self._parse_uuid(state.get("analysis_id"))
        if not analysis_id:
            raise ValueError("analysis_id is missing or invalid in state.")

        logger.info(f"Persisting analysis {analysis_id} to Lakebase")

        req_id_map = {}
        comp_id_map = {}
        cand_id_map = {}

        # 1. Create Analysis
        analysis = Analysis(
            id=analysis_id,
            user_request=state.get("user_request", ""),
            normalized_request=state.get("normalized_request", ""),
            domain=state.get("domain", ""),
            status=state.get("status", ""),
            reuse_confidence=state.get("validation_result", {}).get("confidence_score")
        )
        session.add(analysis)
        session.flush()

        # 2. Requirements & 3. Components
        for idx, req_data in enumerate(state.get("requirements", [])):
            req_id = _get_or_create_uuid(req_data.get("id"), req_id_map)
            req = Requirement(
                id=req_id,
                analysis_id=analysis_id,
                name=req_data.get("name"),
                description=req_data.get("description"),
                category=req_data.get("category"),
                priority=req_data.get("priority"),
                sequence=idx
            )
            session.add(req)

        session.flush()

        for comp_data in state.get("components", []):
            comp_id = _get_or_create_uuid(comp_data.get("id"), comp_id_map)
            req_id_str = comp_data.get("requirement_id")
            
            # Link component to requirement
            req_id = _get_or_create_uuid(req_id_str, req_id_map) if req_id_str else None
            
            comp = Component(
                id=comp_id,
                analysis_id=analysis_id,
                requirement_id=req_id,
                canonical_name=comp_data.get("name"),
                component_type=comp_data.get("category") or comp_data.get("type"),
                description=comp_data.get("description"),
                technical_role=comp_data.get("role")
            )
            session.add(comp)
            
        session.flush()

        # 4. Candidates (If MCP found any)
        for cand_data in state.get("candidates", []):
            cand_id = _get_or_create_uuid(cand_data.get("id"), cand_id_map)
            comp_id = _get_or_create_uuid(cand_data.get("component_id"), comp_id_map)
            
            cand = Candidate(
                id=cand_id,
                component_id=comp_id,
                name=cand_data.get("name"),
                url=cand_data.get("url"),
                description=cand_data.get("description"),
                language=cand_data.get("language"),
                stars=cand_data.get("stars", 0),
                license_name=cand_data.get("license"),
                metadata_=cand_data.get("metadata", {})
            )
            session.add(cand)

        session.flush()

        # 5. Evaluations
        for eval_data in state.get("evaluations", []):
            eval_id = _get_or_create_uuid(eval_data.get("id"), {})
            cand_id = _get_or_create_uuid(eval_data.get("candidate_id"), cand_id_map)
            
            evaluation = CandidateEvaluation(
                id=eval_id,
                candidate_id=cand_id,
                compatibility_score=eval_data.get("compatibility_score"),
                health_score=eval_data.get("health_score"),
                overall_score=eval_data.get("overall_score") or eval_data.get("score"),
                confidence_score=eval_data.get("confidence_score"),
                integration_effort=eval_data.get("integration_effort"),
                rationale=eval_data.get("rationale") or eval_data.get("reasoning")
            )
            session.add(evaluation)

        # 6. Decisions
        for dec_data in state.get("decisions", []):
            dec_id = _get_or_create_uuid(dec_data.get("id"), {})
            comp_id = _get_or_create_uuid(dec_data.get("component_id"), comp_id_map)
            cand_id_str = dec_data.get("selected_candidate_id") or dec_data.get("selected_candidate_name")
            cand_id = _get_or_create_uuid(cand_id_str, cand_id_map) if cand_id_str else None
            
            decision = Decision(
                id=dec_id,
                component_id=comp_id,
                candidate_id=cand_id,
                decision=dec_data.get("action") or dec_data.get("decision"),
                confidence=dec_data.get("confidence"),
                rationale=dec_data.get("rationale") or dec_data.get("reason")
            )
            session.add(decision)

        # 7. Blueprint
        bp_data = state.get("blueprint", {})
        if bp_data:
            blueprint = Blueprint(
                id=uuid.uuid4(),
                analysis_id=analysis_id,
                architecture=bp_data.get("architecture"),
                component_mapping=bp_data.get("component_mapping"),
                integration_flow=bp_data.get("integration_flow"),
                data_flow=bp_data.get("data_flow"),
                api_interfaces=bp_data.get("api_interfaces"),
                technology_stack=bp_data.get("technology_stack"),
                implementation_phases=bp_data.get("implementation_phases")
            )
            session.add(blueprint)

        # 8. Agent Trace
        agent_history = state.get("agent_history", [])
        if agent_history:
            for idx, agent_name in enumerate(agent_history):
                run = AgentRun(
                    id=uuid.uuid4(),
                    analysis_id=analysis_id,
                    agent_name=agent_name,
                    status="COMPLETED"
                )
                session.add(run)

        # 9. Commit
        logger.info(f"Successfully staged analysis {analysis_id} for persistence.")

    # ──────────────────────────────────────────────────────
    # READ METHODS
    # ──────────────────────────────────────────────────────

    def get_analysis(self, session: Session, analysis_id: uuid.UUID) -> Optional[Analysis]:
        """Return the Analysis row, or None if not found."""
        return session.get(Analysis, analysis_id)

    def get_requirements(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all Requirement rows for an analysis, ordered by sequence."""
        return (
            session.query(Requirement)
            .filter(Requirement.analysis_id == analysis_id)
            .order_by(Requirement.sequence)
            .all()
        )

    def get_components(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all Component rows linked to an analysis directly by analysis_id."""
        return (
            session.query(Component)
            .filter(Component.analysis_id == analysis_id)
            .all()
        )

    def get_candidates(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all Candidate rows for the components of an analysis."""
        component_ids = [
            c.id for c in self.get_components(session, analysis_id)
        ]
        if not component_ids:
            return []
        return (
            session.query(Candidate)
            .filter(Candidate.component_id.in_(component_ids))
            .all()
        )

    def get_evaluations(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all CandidateEvaluation rows for candidates of an analysis."""
        candidate_ids = [
            c.id for c in self.get_candidates(session, analysis_id)
        ]
        if not candidate_ids:
            return []
        return (
            session.query(CandidateEvaluation)
            .filter(CandidateEvaluation.candidate_id.in_(candidate_ids))
            .all()
        )

    def get_decisions(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all Decision rows for an analysis (via its components)."""
        component_ids = [
            c.id for c in self.get_components(session, analysis_id)
        ]
        if not component_ids:
            return []
        return (
            session.query(Decision)
            .filter(Decision.component_id.in_(component_ids))
            .all()
        )

    def get_blueprint(self, session: Session, analysis_id: uuid.UUID) -> Optional[Blueprint]:
        """Return the Blueprint row for an analysis, or None."""
        return (
            session.query(Blueprint)
            .filter(Blueprint.analysis_id == analysis_id)
            .first()
        )

    def get_agent_runs(self, session: Session, analysis_id: uuid.UUID) -> list:
        """Return all AgentRun rows for an analysis, ordered by id (insertion order)."""
        return (
            session.query(AgentRun)
            .filter(AgentRun.analysis_id == analysis_id)
            .all()
        )

    def get_analysis_result(self, session: Session, analysis_id: uuid.UUID) -> Optional[dict]:
        """
        Aggregate all persisted data for an analysis into a single dictionary
        that maps to AnalysisResultResponse.

        Returns None if the analysis does not exist.
        """
        analysis = self.get_analysis(session, analysis_id)
        if not analysis:
            return None

        requirements = self.get_requirements(session, analysis_id)
        decisions = self.get_decisions(session, analysis_id)
        blueprint = self.get_blueprint(session, analysis_id)
        agent_runs = self.get_agent_runs(session, analysis_id)

        # Requirements → list of dicts
        req_list = [
            {
                "id": str(r.id),
                "description": r.description or "",
                "priority": r.priority or "",
            }
            for r in requirements
        ]

        # Components (fetched once)
        components_orm = self.get_components(session, analysis_id)
        comp_list = [
            {
                "id": str(c.id),
                "name": c.canonical_name or "",
                "category": c.component_type or "",
                "description": c.description or "",
                "dependencies": [],
            }
            for c in components_orm
        ]

        # Candidates
        candidates_orm = self.get_candidates(session, analysis_id)
        cand_list = [
            {
                "component_id": str(c.component_id),
                "name": c.name or "",
                "url": c.url,
                "description": c.description or "",
                "license": c.license_name or "",
                "stars": c.stars or 0,
            }
            for c in candidates_orm
        ]

        # Evaluations
        evaluations_orm = self.get_evaluations(session, analysis_id)
        eval_list = [
            {
                "candidate_name": "",
                "component_id": str(e.candidate_id) if e.candidate_id else "",
                "score": int(e.overall_score or 0),
                "reasoning": e.rationale or "",
                "concerns": [],
                "missing_evidence": [],
            }
            for e in evaluations_orm
        ]

        # Decisions
        dec_list = [
            {
                "component_id": str(d.component_id) if d.component_id else "",
                "decision": d.decision or "",
                "selected_candidate_name": None,
                "confidence": float(d.confidence or 0),
                "reason": d.rationale or "",
                "risks": [],
                "implementation_notes": [],
            }
            for d in decisions
        ]

        # Blueprint
        bp_dict = None
        if blueprint:
            bp_dict = {
                "solution_summary": (blueprint.architecture or {}).get("solution_summary", "") if blueprint.architecture else "",
                "architecture_style": (blueprint.architecture or {}).get("architecture_style", "") if blueprint.architecture else "",
                "components": (blueprint.component_mapping or {}).get("components", []) if blueprint.component_mapping else [],
                "reuse_summary": {"REUSE": [], "ADAPT": [], "BUILD": []},
                "data_flow": blueprint.data_flow if isinstance(blueprint.data_flow, list) else [],
                "integration_points": (blueprint.integration_flow or []) if isinstance(blueprint.integration_flow, list) else [],
                "implementation_phases": blueprint.implementation_phases if isinstance(blueprint.implementation_phases, list) else [],
                "assumptions": [],
                "risks": [],
            }

        # Agent trace → agent_history string list
        agent_history = [run.agent_name for run in agent_runs if run.agent_name]

        return {
            "analysis_id": str(analysis.id),
            "user_request": analysis.user_request or "",
            "normalized_request": analysis.normalized_request or "",
            "domain": analysis.domain or "",
            "status": analysis.status or "",
            "requirements": req_list,
            "components": comp_list,
            "candidates": cand_list,
            "evaluations": eval_list,
            "decisions": dec_list,
            "blueprint": bp_dict,
            "validation_result": None,
            "agent_history": agent_history,
            "traces": [],
        }
