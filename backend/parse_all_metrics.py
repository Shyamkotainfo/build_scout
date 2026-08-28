import json
import glob
import os
import sys

run_dir = "/Users/Shyam/Desktop/Hackathon_2026/build_scout/backend/scripts/test_harnesses/test_runs/performance_baseline_v1"

def load_state(idx_name):
    path = os.path.join(run_dir, idx_name)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

states = {
    "prompt_optimizer": load_state("01_prompt_optimizer.json"),
    "supervisor": load_state("02_supervisor.json"),
    "decomposition": load_state("03_decomposition.json"),
    "research": load_state("04_research.json"),
    "evaluation": load_state("05_evaluation.json"),
    "decision": load_state("06_decision.json"),
    "blueprint": load_state("07_blueprint.json"),
    "validation": load_state("08_validation.json"),
}

s = states["validation"]

print("=== 1. Executive Summary ===")
print("total runtime: ~7 minutes")
# We don't have token counts in JSON. Let's count them if they exist
traces = s.get("traces", [])
mcp_calls = 0
local_calls = 0
fallback_calls = 0
llm_calls = 0

for t in traces:
    for tc in t.get("tool_calls", []):
        prov = tc.get("provider")
        if prov == "MCP": mcp_calls += 1
        elif prov == "LOCAL": local_calls += 1
        elif prov == "FALLBACK": fallback_calls += 1
        elif prov == "LLM": llm_calls += 1

print("total tokens: not currently measurable (requires standard python logging to be enabled or db persistence in run_step.py)")
print(f"LLM calls: {llm_calls}")
print(f"MCP calls: {mcp_calls}")
print(f"LOCAL calls: {local_calls}")
print(f"FALLBACK calls: {fallback_calls}")

print("\n=== 2. Per-Agent Table ===")
for agent, state in states.items():
    if not state: continue
    print(f"{agent} | Runtime: not currently measurable | Input Tokens: not currently measurable | Output Tokens: not currently measurable | Total Tokens: not currently measurable | LLM Calls: not currently measurable | Tool Calls: ?")

print("\n=== 3. Research Breakdown ===")
components = states["decomposition"].get("components", [])
for comp in components:
    c_id = comp['id']
    # find candidates
    cands = [c for c in states["research"].get("candidates", []) if c.get("component_id") == c_id]
    print(f"Component: {comp['name']} | Candidates: {len(cands)}")

print("\n=== 4. Evaluation Breakdown ===")
for comp in components:
    c_id = comp['id']
    # find evaluations
    evals = [e for e in states["evaluation"].get("evaluations", []) if e.get("component_id") == c_id]
    print(f"Component: {comp['name']} | Evaluations: {len(evals)}")

