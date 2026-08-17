"""
graph.py — BuildSmart LangGraph workflow definition.

Defines the LangGraph StateGraph that orchestrates the BuildSmart agent pipeline.

Current graph (Step 5):

    START → supervisor → decomposition → END

Future steps will extend this graph with:

    → research → evaluation → decision → blueprint → validation → END

Responsibilities:
  - Define and wire LangGraph nodes.
  - Map each node to the corresponding agent.
  - Build and return the compiled graph.

This file contains ONLY orchestration logic.
All agent intelligence lives in agents/*.py.
"""

from langgraph.graph import END, START, StateGraph

from agents.decomposition import DecompositionAgent
from agents.evaluation import EvaluationAgent
from agents.decision import DecisionAgent
from agents.blueprint import BlueprintAgent
from agents.validation import ValidationAgent
from agents.research import ResearchAgent
from agents.state import BuildSmartState
from agents.supervisor import SupervisorAgent

# ---------------------------------------------------------------------------
# Node name constants — used by tests and the workflow runner
# ---------------------------------------------------------------------------

SUPERVISOR_NODE = "supervisor"
DECOMPOSITION_NODE = "decomposition"
RESEARCH_NODE = "research"
EVALUATION_NODE = "evaluation"
DECISION_NODE = "decision"
BLUEPRINT_NODE = "blueprint"
VALIDATION_NODE = "validation"


# ---------------------------------------------------------------------------
# Node functions — thin wrappers that delegate to agent classes
# ---------------------------------------------------------------------------

def supervisor_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the SupervisorAgent.

    Args:
        state: Current BuildSmartState.

    Returns:
        Updated BuildSmartState with execution_plan populated.
    """
    return SupervisorAgent().run(state)


def decomposition_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the DecompositionAgent.

    Args:
        state: BuildSmartState from the Supervisor.

    Returns:
        Updated BuildSmartState with requirements and components populated.
    """
    return DecompositionAgent().run(state)


def research_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the ResearchAgent.

    Args:
        state: BuildSmartState from the DecompositionAgent.

    Returns:
        Updated BuildSmartState with candidates populated.
    """
    return ResearchAgent().run(state)


def evaluation_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the EvaluationAgent.

    Args:
        state: BuildSmartState from the ResearchAgent.

    Returns:
        Updated BuildSmartState with evaluations populated.
    """
    return EvaluationAgent().run(state)


def decision_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the DecisionAgent.

    Args:
        state: BuildSmartState from the EvaluationAgent.

    Returns:
        Updated BuildSmartState with decisions populated.
    """
    return DecisionAgent().run(state)


def blueprint_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the BlueprintAgent.

    Args:
        state: BuildSmartState from the DecisionAgent.

    Returns:
        Updated BuildSmartState with blueprint populated.
    """
    return BlueprintAgent().run(state)


def validation_node(state: BuildSmartState) -> BuildSmartState:
    """LangGraph node: run the ValidationAgent.

    Args:
        state: BuildSmartState from the BlueprintAgent.

    Returns:
        Updated BuildSmartState with validation_result populated.
    """
    return ValidationAgent().run(state)


# ---------------------------------------------------------------------------
# Graph builder
# ---------------------------------------------------------------------------

def build_buildsmart_graph():
    """Build and compile the BuildSmart LangGraph workflow.

    Current topology:

        START → supervisor → decomposition → END

    Returns:
        CompiledGraph: A compiled LangGraph ready for .invoke() or .stream().
    """
    graph = StateGraph(BuildSmartState)

    # Nodes
    graph.add_node(SUPERVISOR_NODE, supervisor_node)
    graph.add_node(DECOMPOSITION_NODE, decomposition_node)
    graph.add_node(RESEARCH_NODE, research_node)
    graph.add_node(EVALUATION_NODE, evaluation_node)
    graph.add_node(DECISION_NODE, decision_node)
    graph.add_node(BLUEPRINT_NODE, blueprint_node)
    graph.add_node(VALIDATION_NODE, validation_node)

    # Edges
    graph.add_edge(START, SUPERVISOR_NODE)
    graph.add_edge(SUPERVISOR_NODE, DECOMPOSITION_NODE)
    graph.add_edge(DECOMPOSITION_NODE, RESEARCH_NODE)
    graph.add_edge(RESEARCH_NODE, EVALUATION_NODE)
    graph.add_edge(EVALUATION_NODE, DECISION_NODE)
    graph.add_edge(DECISION_NODE, BLUEPRINT_NODE)
    graph.add_edge(BLUEPRINT_NODE, VALIDATION_NODE)
    graph.add_edge(VALIDATION_NODE, END)

    return graph.compile()
