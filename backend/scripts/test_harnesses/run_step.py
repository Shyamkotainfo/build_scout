import os
import sys
import json
import uuid
import argparse
from datetime import datetime
from copy import deepcopy

# Add backend directory to path if run directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.state import BuildSmartState, create_initial_state
from services.prompt_optimizer import PromptOptimizer
from agents.graph import (
    supervisor_node,
    decomposition_node,
    research_node,
    evaluation_node,
    decision_node,
    blueprint_node,
    validation_node
)

def mask_secrets(data):
    """Recursively mask secrets in a dictionary or list before serialization."""
    if isinstance(data, dict):
        masked_data = {}
        for k, v in data.items():
            if isinstance(k, str) and any(
                secret_word in k.lower() for secret_word in 
                ["api_key", "password", "token", "secret", "authorization", "credentials"]
            ):
                masked_data[k] = "***MASKED***"
            elif isinstance(v, (dict, list)):
                masked_data[k] = mask_secrets(v)
            else:
                masked_data[k] = v
        return masked_data
    elif isinstance(data, list):
        return [mask_secrets(item) for item in data]
    else:
        return data

# Map step names to their execution functions
STEP_MAPPING = {
    "prompt_optimizer": None,  # Handled specially since it's a pre-processing service
    "supervisor": supervisor_node,
    "decomposition": decomposition_node,
    "research": research_node,
    "evaluation": evaluation_node,
    "decision": decision_node,
    "blueprint": blueprint_node,
    "validation": validation_node
}

ORDERED_STEPS = list(STEP_MAPPING.keys())

def get_step_index(step_name: str) -> str:
    """Return a zero-padded index for sorting files, e.g., '01' for prompt_optimizer."""
    try:
        idx = ORDERED_STEPS.index(step_name) + 1
        return f"{idx:02d}"
    except ValueError:
        return "99"

def run_prompt_optimizer(state: BuildSmartState) -> BuildSmartState:
    """Special wrapper for PromptOptimizer to match LangGraph node signature."""
    optimizer = PromptOptimizer()
    result = optimizer.optimize(state["user_request"], state["analysis_id"])
    state["normalized_request"] = result.optimized_request
    return state

def print_tool_summary(state: BuildSmartState):
    """Print a concise summary of tool executions from the Research step."""
    traces = state.get("traces", [])
    if not traces:
        print("\nTool Execution Summary: No tools were executed.")
        return
        
    print("\n--- Tool Execution Summary ---")
    for t in traces:
        for tc in t.get("tool_calls", []):
            t_name = tc.get("tool_name", "unknown")
            provider = tc.get("provider", "UNKNOWN")
            status = tc.get("status", "UNKNOWN")
            latency = tc.get("latency_ms", 0)
            results = tc.get("results", [])
            print(f"Tool: {t_name}")
            print(f"  provider: {provider}")
            print(f"  status: {status}")
            print(f"  latency_ms: {latency}")
            print(f"  result_count: {len(results)}")
        print()

def main():
    parser = argparse.ArgumentParser(description="BuildSmart Step Runner (Development / Test Only)")
    parser.add_argument("steps", nargs="+", help="One or more steps to run (e.g., prompt_optimizer supervisor)")
    parser.add_argument("--state", help="Path to initial state JSON file (required unless starting with prompt_optimizer)")
    parser.add_argument("--run-id", help="Optional run identifier. Defaults to timestamp.")
    parser.add_argument("--prompt", help="User prompt. Required if starting with prompt_optimizer and no state is provided.")
    
    args = parser.parse_args()

    # Validate steps
    for step in args.steps:
        if step not in STEP_MAPPING:
            print(f"Error: Unknown step '{step}'. Allowed steps: {', '.join(ORDERED_STEPS)}")
            sys.exit(1)

    # Initialize State
    state = None
    if args.state:
        if not os.path.exists(args.state):
            print(f"Error: State file {args.state} not found.")
            sys.exit(1)
        with open(args.state, "r") as f:
            state = json.load(f)
    elif args.steps[0] == "prompt_optimizer":
        if not args.prompt:
            print("Error: --prompt is required when starting from scratch with prompt_optimizer.")
            sys.exit(1)
        state = create_initial_state(args.prompt)
    else:
        print(f"Error: --state is required when starting with step '{args.steps[0]}'")
        sys.exit(1)

    # Setup Run Directory
    run_id = args.run_id or datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = os.path.join(os.path.dirname(__file__), "test_runs", run_id)
    os.makedirs(run_dir, exist_ok=True)
    print(f"Test Run Directory: {run_dir}")

    # Execute steps sequentially
    for step_name in args.steps:
        print(f"\n[{step_name}] Starting execution...")
        
        try:
            if step_name == "prompt_optimizer":
                state = run_prompt_optimizer(state)
            else:
                node_func = STEP_MAPPING[step_name]
                state = node_func(state)
                
            # If research was run, print tool summary
            if step_name == "research":
                print_tool_summary(state)

            print(f"[{step_name}] Completed successfully.")
            
        except Exception as e:
            print(f"\n❌ [{step_name}] FAILED: {e}")
            
            # Save the failing state
            step_idx = get_step_index(step_name)
            fail_filename = os.path.join(run_dir, f"{step_idx}_{step_name}_FAILED.json")
            safe_state = mask_secrets(deepcopy(state))
            with open(fail_filename, "w") as f:
                json.dump(safe_state, f, indent=2)
                
            print(f"Failing state preserved at: {fail_filename}")
            print("Halting execution.")
            sys.exit(1)

        # Save successful state
        step_idx = get_step_index(step_name)
        success_filename = os.path.join(run_dir, f"{step_idx}_{step_name}.json")
        safe_state = mask_secrets(deepcopy(state))
        with open(success_filename, "w") as f:
            json.dump(safe_state, f, indent=2)
            
        print(f"State saved to: {success_filename}")

    print("\n✅ All specified steps executed successfully.")

if __name__ == "__main__":
    main()
