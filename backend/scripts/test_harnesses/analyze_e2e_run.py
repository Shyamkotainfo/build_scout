import json
import os

run_dir = "test_runs/final_e2e_certification"

def load(filename):
    path = os.path.join(run_dir, filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {}

s01 = load("01_prompt_optimizer.json")
s02 = load("02_supervisor.json")
s03 = load("03_decomposition.json")
s04 = load("04_research.json")
s05 = load("05_evaluation.json")
s06 = load("06_decision.json")
s07 = load("07_blueprint.json")
s08 = load("08_validation.json")

def count(state, key):
    return len(state.get(key, [])) if state else 0

print("=== STAGE COUNTS ===")
print(f"PromptOptimizer | Req: {count(s01, 'requirements')} | Comp: {count(s01, 'components')} | Cand: {count(s01, 'candidates')} | Eval: {count(s01, 'evaluations')} | Dec: {count(s01, 'decisions')} | BP: {count(s01.get('blueprint', {}), 'components')}")
print(f"Supervisor      | Req: {count(s02, 'requirements')} | Comp: {count(s02, 'components')} | Cand: {count(s02, 'candidates')} | Eval: {count(s02, 'evaluations')} | Dec: {count(s02, 'decisions')} | BP: {count(s02.get('blueprint', {}), 'components')}")
print(f"Decomposition   | Req: {count(s03, 'requirements')} | Comp: {count(s03, 'components')} | Cand: {count(s03, 'candidates')} | Eval: {count(s03, 'evaluations')} | Dec: {count(s03, 'decisions')} | BP: {count(s03.get('blueprint', {}), 'components')}")
print(f"Research        | Req: {count(s04, 'requirements')} | Comp: {count(s04, 'components')} | Cand: {count(s04, 'candidates')} | Eval: {count(s04, 'evaluations')} | Dec: {count(s04, 'decisions')} | BP: {count(s04.get('blueprint', {}), 'components')}")
print(f"Evaluation      | Req: {count(s05, 'requirements')} | Comp: {count(s05, 'components')} | Cand: {count(s05, 'candidates')} | Eval: {count(s05, 'evaluations')} | Dec: {count(s05, 'decisions')} | BP: {count(s05.get('blueprint', {}), 'components')}")
print(f"Decision        | Req: {count(s06, 'requirements')} | Comp: {count(s06, 'components')} | Cand: {count(s06, 'candidates')} | Eval: {count(s06, 'evaluations')} | Dec: {count(s06, 'decisions')} | BP: {count(s06.get('blueprint', {}), 'components')}")
print(f"Blueprint       | Req: {count(s07, 'requirements')} | Comp: {count(s07, 'components')} | Cand: {count(s07, 'candidates')} | Eval: {count(s07, 'evaluations')} | Dec: {count(s07, 'decisions')} | BP: {count(s07.get('blueprint', {}), 'components')}")
print(f"Validation      | Req: {count(s08, 'requirements')} | Comp: {count(s08, 'components')} | Cand: {count(s08, 'candidates')} | Eval: {count(s08, 'evaluations')} | Dec: {count(s08, 'decisions')} | BP: {count(s08.get('blueprint', {}), 'components')}")

print("\n=== REQUIREMENT INTEGRITY ===")
req_ids_03 = [r['id'] for r in s03.get('requirements', [])]
req_ids_08 = [r['id'] for r in s08.get('requirements', [])]
if set(req_ids_03) == set(req_ids_08):
    print("PASS")
else:
    print("FAIL", set(req_ids_03) ^ set(req_ids_08))

print("\n=== COMPONENT INTEGRITY ===")
comp_ids_03 = [c['id'] for c in s03.get('components', [])]
comp_ids_08 = [c['component_id'] for c in s08.get('blueprint', {}).get('components', [])]
if set(comp_ids_03) == set(comp_ids_08):
    print("PASS")
else:
    print("FAIL", set(comp_ids_03) ^ set(comp_ids_08))

print("\n=== RESEARCH INTEGRITY ===")
cands = s04.get('candidates', [])
print(f"Total Candidates: {len(cands)}")
print(f"Unique URLs: {len(set(c.get('url') for c in cands))}")
print(f"GitHub Cands: {len([c for c in cands if 'github.com' in c.get('url', '')])}")
comp_cands = {}
for c in cands:
    comp_cands[c['component_id']] = comp_cands.get(c['component_id'], 0) + 1
for cid, cnt in comp_cands.items():
    print(f"  {cid}: {cnt} candidates")

print("\n=== EVALUATION INTEGRITY ===")
evals = s05.get('evaluations', [])
print(f"Total Evaluations: {len(evals)}")
print("PASS" if len(evals) == len(cands) else "FAIL mismatch count")

print("\n=== DECISION INTEGRITY ===")
decs = s06.get('decisions', [])
counts = {'REUSE': 0, 'ADAPT': 0, 'BUILD': 0}
for d in decs:
    counts[d['decision']] = counts.get(d['decision'], 0) + 1
print(f"REUSE = {counts['REUSE']}")
print(f"ADAPT = {counts['ADAPT']}")
print(f"BUILD = {counts['BUILD']}")
for d in decs:
    print(f"{d['component_id']} -> {d['decision']} (Cand: {d.get('selected_candidate_id')} / {d.get('selected_candidate_name')}) [Conf: {d.get('confidence')}]")

print("\n=== BLUEPRINT INTEGRITY ===")
bp = s07.get('blueprint', {})
bp_reuse = bp.get('reuse_summary', {})
print("Blueprint Reuse Summary:")
print(f"REUSE = {len(bp_reuse.get('reuse', []))}")
print(f"ADAPT = {len(bp_reuse.get('adapt', []))}")
print(f"BUILD = {len(bp_reuse.get('build', []))}")
if (counts['REUSE'] == len(bp_reuse.get('reuse', [])) and
    counts['ADAPT'] == len(bp_reuse.get('adapt', [])) and
    counts['BUILD'] == len(bp_reuse.get('build', []))):
    print("MATCH")
else:
    print("MISMATCH")

print("\n=== VALIDATION INTEGRITY ===")
val = s08.get('validation_result', {})
print("Overall Score:", val.get("overall_score"))
print("Overall Status:", val.get("overall_status"))
print("Requirement Coverage Score:", val.get("requirement_coverage", {}).get("score"))
print("Component Coverage Score:", val.get("component_coverage", {}).get("score"))
print("Decision Consistency Score:", val.get("decision_consistency", {}).get("score"))
print("Architecture Consistency Score:", val.get("architecture_consistency", {}).get("score"))

print("\n=== TRACE INTEGRITY ===")
metrics = s08.get('llm_metrics', {})
print(f"LLM Calls: {metrics.get('total_calls')} (Success: {metrics.get('successful_calls')}, Retries: {metrics.get('total_retries')}, Fail: {metrics.get('failed_calls')})")
print(f"Tokens: {metrics.get('total_tokens')} (In: {metrics.get('total_input_tokens')}, Out: {metrics.get('total_output_tokens')})")
print(f"Latency: {metrics.get('total_latency_ms')} ms")

# Get explicit MCP/LOCAL usages from Research tool calls
traces = s08.get('traces', [])
mcp_count = 0
local_count = 0
fallback_count = 0
for t in traces:
    for tc in t.get('tool_calls', []):
        provider = tc.get('provider', '')
        if provider == 'MCP':
            mcp_count += 1
        elif provider == 'LOCAL':
            local_count += 1
        elif provider == 'FALLBACK':
            fallback_count += 1
print(f"MCP: {mcp_count}, LOCAL: {local_count}, FALLBACK: {fallback_count}")
