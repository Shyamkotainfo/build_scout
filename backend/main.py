"""
main.py — BuildSmart central workflow entry point.

Executes the full BuildSmart agentic workflow and displays the accumulated
state after each agent completes.

Usage (interactive):
    python -m main

Usage (non-interactive):
    python -m main "I want to build an AI customer-support assistant."

This is the ONE central workflow runner.
Do NOT create individual agent CLI files.
"""

import sys

from agents.graph import (
    BLUEPRINT_NODE,
    DECISION_NODE,
    DECOMPOSITION_NODE,
    EVALUATION_NODE,
    RESEARCH_NODE,
    SUPERVISOR_NODE,
    VALIDATION_NODE,
    build_buildsmart_graph,
)
from agents.state import BuildSmartState, create_initial_state

DIVIDER = "=" * 50
SECTION = "-" * 50


# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def display_supervisor_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 1 — SUPERVISOR AGENT")
    print(SECTION)
    print(f"\nStatus:\n{state['status']}")
    plan = state.get("execution_plan", [])
    if plan:
        print("\nExecution Plan:")
        for step in plan:
            print(f"  {step['step']}. {step['agent']}")
            print(f"     {step['objective']}")


def display_decomposition_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 2 — DECOMPOSITION AGENT")
    print(SECTION)
    print(f"\nStatus:\n{state['status']}")
    print(f"\nDomain:\n{state.get('domain', '')}")
    print(f"\nNormalized Request:\n{state.get('normalized_request', '')}")

    requirements = state.get("requirements", [])
    if requirements:
        print("\nRequirements:")
        for i, req in enumerate(requirements, start=1):
            print(f"\n  {i}. {req['id']} [{req['priority']}]")
            print(f"     {req['description']}")

    components = state.get("components", [])
    if components:
        print("\nComponents:")
        for i, comp in enumerate(components, start=1):
            print(f"\n  {i}. {comp['id']}")
            print(f"     Name:        {comp['name']}")
            print(f"     Category:    {comp['category']}")
            print(f"     Description: {comp['description']}")


def display_research_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 3 — RESEARCH AGENT")
    print(SECTION)
    print(f"\nStatus:\n{state['status']}")
    
    candidates = state.get("candidates", [])
    components = state.get("components", [])
    if not candidates:
        print("\nNo candidates found.")
        return
        
    print("\nResearching candidates...")
    for comp in components:
        comp_id = comp['id']
        comp_cands = [c for c in candidates if c.get("component_id") == comp_id]
        if comp_cands:
            print(f"\nComponent: {comp['name']}")
            print("Candidates:")
            for cand in comp_cands:
                print(f"  - [{cand.get('source', 'unknown').upper()}] {cand.get('name')}")
                print(f"    URL: {cand.get('url')}")
                print(f"    Reason: {cand.get('relevance_reason')}")


def display_evaluation_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 4 — EVALUATION AGENT")
    print(SECTION)
    
    evaluations = state.get("evaluations", [])
    components = {comp["id"]: comp for comp in state.get("components", [])}
    candidates = {cand["id"]: cand for cand in state.get("candidates", [])}
    
    if not evaluations:
        print("\nNo evaluations performed.")
        return
        
    for ev in evaluations:
        cand = candidates.get(ev["candidate_id"], {})
        comp = components.get(ev["component_id"], {})
        
        print(f"\nCandidate:\n{cand.get('name', 'Unknown')}")
        print(f"\nComponent:\n{comp.get('name', 'Unknown')}")
        
        print("\nScores:")
        print(f"Relevance:       {ev.get('relevance_score') if ev.get('relevance_score') is not None else 'UNKNOWN'}")
        print(f"Compatibility:   {ev.get('compatibility_score') if ev.get('compatibility_score') is not None else 'UNKNOWN'}")
        print(f"Project Health:  {ev.get('project_health_score') if ev.get('project_health_score') is not None else 'UNKNOWN'}")
        print(f"License:         {ev.get('license_score') if ev.get('license_score') is not None else 'UNKNOWN'}")
        print(f"Security:        {ev.get('security_score') if ev.get('security_score') is not None else 'UNKNOWN'}")
        print(f"Maintainability: {ev.get('maintainability_score') if ev.get('maintainability_score') is not None else 'UNKNOWN'}")
        
        print(f"\nOverall Score:\n{ev.get('overall_score', 0.0)}")
        
        print("\nStrengths:")
        for s in ev.get("strengths", []):
            print(f"  - {s}")
            
        print("\nConcerns:")
        for c in ev.get("concerns", []):
            print(f"  - {c}")
            
        if ev.get("missing_evidence"):
            print("\nMissing Evidence:")
            for m in ev.get("missing_evidence", []):
                print(f"  - {m}")


def display_decision_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 5 — DECISION AGENT")
    print(SECTION)
    
    decisions = state.get("decisions", [])
    components = {comp["id"]: comp for comp in state.get("components", [])}
    
    if not decisions:
        print("\nNo decisions performed.")
        return
        
    for dec in decisions:
        comp = components.get(dec["component_id"], {})
        
        print(f"\nComponent:\n{comp.get('name', 'Unknown')}")
        
        print(f"\nDecision:\n{dec.get('decision')}")
        
        print(f"\nSelected Candidate:\n{dec.get('selected_candidate_name') if dec.get('selected_candidate_name') else 'None'}")
        
        print(f"\nConfidence:\n{dec.get('confidence')}%")
        
        print(f"\nReason:\n{dec.get('reason')}")
        
        if dec.get("risks"):
            print("\nRisks:")
            for r in dec.get("risks", []):
                print(f"  - {r}")
                
        if dec.get("implementation_notes"):
            print("\nImplementation Notes:")
            for note in dec.get("implementation_notes", []):
                print(f"  - {note}")
        
        print(f"\n{'-'*50}")


def display_blueprint_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 6 — BLUEPRINT AGENT")
    print(SECTION)
    
    if state.get("status") == "BLUEPRINT_FAILED":
        print("\nStatus:\nBLUEPRINT_FAILED")
        print("\nReason:\nBlueprint validation failed.")
        return

    blueprint = state.get("blueprint", {})
    if not blueprint:
        print("\nNo blueprint generated.")
        return

    print(f"\nSolution Summary:\n{blueprint.get('solution_summary')}")
    print(f"\nArchitecture Style:\n{blueprint.get('architecture_style')}")
    
    print("\nTechnology Stack:")
    for ts in blueprint.get("technology_stack", []):
        print(f"  - {ts.get('component_name')}: {ts.get('technology')}")

    print("\nReuse Summary:")
    rs = blueprint.get("reuse_summary", {})
    
    print("\nREUSE:")
    if rs.get("reuse"):
        for r in rs.get("reuse", []):
            print(f"  - {r}")
    else:
        print("  (None)")

    print("\nADAPT:")
    if rs.get("adapt"):
        for a in rs.get("adapt", []):
            print(f"  - {a}")
    else:
        print("  (None)")

    print("\nBUILD:")
    if rs.get("build"):
        for b in rs.get("build", []):
            print(f"  - {b}")
    else:
        print("  (None)")

    print("\n--------------------------------------------------")
    print("DATA FLOW")
    print("--------------------------------------------------")
    for df in blueprint.get("data_flow", []):
        print(f"  → {df}")

    print("\n--------------------------------------------------")
    print("INTEGRATION POINTS")
    print("--------------------------------------------------")
    for ip in blueprint.get("integration_points", []):
        print(f"\nSource: {ip.get('source')}")
        print(f"Target: {ip.get('target')}")
        print(f"Purpose: {ip.get('purpose')}")

    print("\n--------------------------------------------------")
    print("IMPLEMENTATION PHASES")
    print("--------------------------------------------------")
    for phase in sorted(blueprint.get("implementation_phases", []), key=lambda x: x.get("phase", 0)):
        print(f"\nPhase {phase.get('phase')}: {phase.get('name')}")
        for activity in phase.get("activities", []):
            print(f"  - {activity}")

    print("\n--------------------------------------------------")
    print("RISKS")
    print("--------------------------------------------------")
    for risk in blueprint.get("risks", []):
        print(f"  - {risk}")

    print("\n--------------------------------------------------")
    print("ASSUMPTIONS")
    print("--------------------------------------------------")
    for assumption in blueprint.get("assumptions", []):
        print(f"  - {assumption}")


def display_validation_result(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("STEP 7 — VALIDATION AGENT")
    print(SECTION)

    val = state.get("validation_result", {})
    if not val:
        print("\nNo validation performed.")
        return

    print(f"\nOverall Validation:\n{val.get('overall_status')}")
    print(f"\nOverall Score:\n{val.get('overall_score')}")

    def format_cat(cat_name: str, display_name: str):
        c = val.get(cat_name, {})
        print(f"\n{display_name}:\n{c.get('status')} — {c.get('score')}%")

    format_cat("requirement_coverage", "Requirement Coverage")
    format_cat("component_coverage", "Component Coverage")
    format_cat("decision_consistency", "Decision Consistency")
    format_cat("architecture_consistency", "Architecture Consistency")
    format_cat("data_flow_consistency", "Data Flow Consistency")
    format_cat("integration_consistency", "Integration Consistency")
    format_cat("implementation_completeness", "Implementation Completeness")
    format_cat("risk_completeness", "Risk Completeness")

    print("\nCritical Issues:")
    if val.get("critical_issues"):
        for issue in val.get("critical_issues", []):
            print(f"  * {issue}")
    else:
        print("  None")

    print("\nWarnings:")
    if val.get("warnings"):
        for warning in val.get("warnings", []):
            print(f"  * {warning}")
    else:
        print("  None")

    print("\nRecommendations:")
    if val.get("recommendations"):
        for rec in val.get("recommendations", []):
            print(f"  * {rec}")
    else:
        print("  None")

    print(f"\n{DIVIDER}")


def display_final_summary(state: BuildSmartState) -> None:
    print(f"\n{SECTION}")
    print("WORKFLOW COMPLETE")
    print(f"\nFinal Workflow Status:\n{state['status']}")
    
    val_status = state.get('validation_result', {}).get('overall_status', 'UNKNOWN')
    print(f"\nValidation Result:\n{val_status}")
    
    print(f"\nTotal Components: {len(state.get('components', []))}")
    print(f"Total Candidates: {len(state.get('candidates', []))}")
    print(f"Total Evaluations: {len(state.get('evaluations', []))}")
    print(f"Total Decisions: {len(state.get('decisions', []))}")
    
    if state.get("blueprint"):
        print("\nBlueprint:\nGENERATED")
    
    history = state.get("agent_history", [])
    if history:
        print("\nAgent History:")
        for agent in history:
            print(f"  → {agent}")
    print(f"\n{DIVIDER}\n")


# ---------------------------------------------------------------------------
# Workflow runner
# ---------------------------------------------------------------------------

def run_workflow(user_request: str) -> BuildSmartState:
    """Execute the BuildSmart LangGraph workflow and display progress.

    Args:
        user_request: The solution idea from the user.

    Returns:
        BuildSmartState: Final accumulated state after all agents complete.
    """
    print(f"\n{DIVIDER}")
    print("BUILDSMART AGENTIC WORKFLOW")
    print(DIVIDER)
    print(f"\nUser Request:\n{user_request}")

    graph = build_buildsmart_graph()
    initial_state = create_initial_state(user_request)

    final_state: BuildSmartState = initial_state

    # Stream the graph — yields {node_name: node_output} after each node
    for event in graph.stream(initial_state, stream_mode="updates"):
        for node_name, node_output in event.items():
            if node_name == SUPERVISOR_NODE:
                display_supervisor_result(node_output)
            elif node_name == DECOMPOSITION_NODE:
                display_decomposition_result(node_output)
            elif node_name == RESEARCH_NODE:
                display_research_result(node_output)
            elif node_name == EVALUATION_NODE:
                display_evaluation_result(node_output)
            elif node_name == DECISION_NODE:
                display_decision_result(node_output)
            elif node_name == BLUEPRINT_NODE:
                display_blueprint_result(node_output)
            elif node_name == VALIDATION_NODE:
                display_validation_result(node_output)
            # Store the latest output as final state
            final_state = node_output

    display_final_summary(final_state)
    return final_state


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    """Parse user request from argv or prompt interactively."""
    if len(sys.argv) > 1:
        user_request = " ".join(sys.argv[1:]).strip()
    else:
        print("Enter your BuildSmart request:")
        user_request = input("> ").strip()

    if not user_request:
        print("Error: request must not be empty.")
        sys.exit(1)

    run_workflow(user_request)


if __name__ == "__main__":
    main()
