import json
import glob
import os

run_dir = "/Users/Shyam/Desktop/Hackathon_2026/build_scout/backend/scripts/test_harnesses/test_runs/performance_baseline_v1"

val_file = os.path.join(run_dir, "08_validation.json")
if os.path.exists(val_file):
    with open(val_file, "r") as f:
        state = json.load(f)
        traces = state.get("traces", [])
        for t in traces:
            agent = t.get("agent_name", "Unknown")
            for tc in t.get("tool_calls", []):
                if tc.get("provider") == "LLM":
                    print(f"Agent: {agent} -> LLM Tool Call Metadata: {tc.get('metadata')}")

