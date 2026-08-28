import json
import os
import sys

# Need to import our context builders to measure the payload sizes
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "agents"))
from context import build_evaluation_context, build_decision_context, build_blueprint_context, build_validation_context

run_dir = "/Users/Shyam/Desktop/Hackathon_2026/build_scout/backend/scripts/test_harnesses/test_runs/performance_opt1_context"

def load_state(idx_name):
    path = os.path.join(run_dir, idx_name)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f), os.path.getmtime(path)
    return {}, 0

s01, t01 = load_state("01_prompt_optimizer.json")
s02, t02 = load_state("02_supervisor.json")
s03, t03 = load_state("03_decomposition.json")
s04, t04 = load_state("04_research.json")
s05, t05 = load_state("05_evaluation.json")
s06, t06 = load_state("06_decision.json")
s07, t07 = load_state("07_blueprint.json")
s08, t08 = load_state("08_validation.json")

# Runtimes (approximate from file mtime diffs)
rt_research = t04 - t03
rt_eval = t05 - t04
rt_dec = t06 - t05
rt_bp = t07 - t06
rt_val = t08 - t07
total_rt = t08 - t01

print(f"Total runtime: {total_rt}s")
print(f"Research: {rt_research}s")
print(f"Evaluation: {rt_eval}s")
print(f"Decision: {rt_dec}s")
print(f"Blueprint: {rt_bp}s")
print(f"Validation: {rt_val}s")

# Payload sizes
# Evaluation input
payload_eval = build_evaluation_context(s04.get("domain", ""), s04.get("requirements", []), s04.get("components", []), s04.get("candidates", []))
size_eval = len(json.dumps(payload_eval))
print(f"Evaluation Context Size: {size_eval} bytes")

# Decision input
evals_by_comp = {}
for ev in s05.get("evaluations", []):
    evals_by_comp.setdefault(ev["component_id"], []).append(ev)
components_with_evals = [c for c in s05.get("components", []) if c["id"] in evals_by_comp]

payload_dec = build_decision_context(s05.get("requirements", []), components_with_evals, s05.get("candidates", []), s05.get("evaluations", []))
size_dec = len(json.dumps(payload_dec))
print(f"Decision Context Size: {size_dec} bytes")

# Blueprint input
selected_ids = {d["selected_candidate_id"] for d in s06.get("decisions", []) if d.get("selected_candidate_id")}
filtered_cands = [c for c in s06.get("candidates", []) if c["id"] in selected_ids]
components_reused = {d["component_id"] for d in s06.get("decisions", []) if d.get("decision") in ("REUSE", "ADAPT")}
filtered_evals = [e for e in s06.get("evaluations", []) if e["component_id"] in components_reused and e["candidate_id"] in selected_ids]

payload_bp = build_blueprint_context(s06.get("user_request", ""), s06.get("normalized_request", ""), s06.get("domain", ""), s06.get("requirements", []), s06.get("components", []), filtered_cands, filtered_evals, s06.get("decisions", []))
size_bp = len(json.dumps(payload_bp))
print(f"Blueprint Context Size: {size_bp} bytes")

# Validation input
payload_val = build_validation_context(s07.get("requirements", []), s07.get("components", []), s07.get("decisions", []), s07.get("blueprint", {}))
size_val = len(json.dumps(payload_val))
print(f"Validation Context Size: {size_val} bytes")

print(f"Candidates: {len(s08.get('candidates', []))}")
print(f"Evaluations: {len(s08.get('evaluations', []))}")
print(f"Validation Score: {s08.get('validation_result', {}).get('overall_score')}")
print(f"Validation Status: {s08.get('validation_result', {}).get('overall_status')}")

# MCP calls
mcp_calls = 0
local_calls = 0
fallback_calls = 0
for t in s08.get("traces", []):
    for tc in t.get("tool_calls", []):
        prov = tc.get("provider")
        if prov == "MCP": mcp_calls += 1
        elif prov == "LOCAL": local_calls += 1
        elif prov == "FALLBACK": fallback_calls += 1

print(f"MCP calls: {mcp_calls}")
print(f"LOCAL calls: {local_calls}")
print(f"FALLBACK calls: {fallback_calls}")

