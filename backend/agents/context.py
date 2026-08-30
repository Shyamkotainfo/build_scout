from typing import Any, Dict, List

def build_evaluation_context(domain: str, requirements: List[Dict[str, Any]], component: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Strips raw metadata from candidates to reduce context size.
    Preserves security/license evidence specifically required by Evaluation.
    """
    compact_candidates = []
    for c in candidates:
        cand_data = {
            "id": c.get("id"),
            "name": c.get("name"),
            "source": c.get("source"),
            "description": c.get("description"),
            "relevance_reason": c.get("relevance_reason"),
            "shortlist_reason": c.get("shortlist_reason"),
            "url": c.get("url"),
            "security_evidence": c.get("security_evidence", "UNKNOWN"),
            "license_evidence": c.get("license_evidence", "UNKNOWN")
        }
        
        # Keep high-signal metadata, drop the rest
        meta = c.get("metadata", {})
        if meta:
            compact_meta = {}
            for key in ["stars", "stargazers_count", "forks", "language", "updated_at", "last_commit"]:
                if key in meta:
                    compact_meta[key] = meta[key]
            if compact_meta:
                cand_data["metadata"] = compact_meta
                
        compact_candidates.append(cand_data)

    return {
        "domain": domain,
        "requirements": requirements,
        "component": component,
        "candidates": compact_candidates
    }

def build_decision_context(requirements: List[Dict[str, Any]], components: List[Dict[str, Any]], candidates: List[Dict[str, Any]], evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Strips candidates and evaluations to their bare essentials for decision making.
    """
    compact_candidates = []
    for c in candidates:
        compact_candidates.append({
            "id": c.get("id"),
            "name": c.get("name"),
            "description": c.get("description")
        })
        
    compact_evals = []
    for e in evaluations:
        compact_evals.append({
            "candidate_id": e.get("candidate_id"),
            "component_id": e.get("component_id"),
            "overall_score": e.get("overall_score"),
            "reasoning": e.get("reasoning"),
            "strengths": e.get("strengths", []),
            "concerns": e.get("concerns", []),
            "missing_evidence": e.get("missing_evidence", [])
        })

    return {
        "requirements": requirements,
        "components": components,
        "candidates": compact_candidates,
        "evaluations": compact_evals
    }

def build_blueprint_context(user_request: str, normalized_request: str, domain: str, requirements: List[Dict[str, Any]], components: List[Dict[str, Any]], decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Provides only the information needed to synthesize the architecture.
    Raw candidates and evaluations are explicitly omitted.
    """
    compact_decisions = []
    for d in decisions:
        compact_decisions.append({
            "component_id": d.get("component_id"),
            "decision": d.get("decision"),
            "selected_candidate_id": d.get("selected_candidate_id"),
            "selected_candidate_name": d.get("selected_candidate_name"),
            "confidence": d.get("confidence"),
            "reason": d.get("reason"),
            "risks": d.get("risks", [])
        })

    return {
        "user_request": user_request,
        "normalized_request": normalized_request,
        "domain": domain,
        "requirements": requirements,
        "components": components,
        "decisions": compact_decisions
    }

def build_validation_context(requirements: List[Dict[str, Any]], components: List[Dict[str, Any]], decisions: List[Dict[str, Any]], blueprint: Dict[str, Any]) -> Dict[str, Any]:
    """
    Provides the minimal context necessary for architectural validation.
    No raw candidates, no raw evaluations.
    """
    compact_blueprint = {k: v for k, v in blueprint.items() if k not in ("technology_stack", "reuse_summary")}
    return {
        "requirements": requirements,
        "components": components,
        "decisions": decisions,
        "blueprint": compact_blueprint
    }
