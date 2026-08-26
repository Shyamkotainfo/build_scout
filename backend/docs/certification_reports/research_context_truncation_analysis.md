# ResearchAgent Context Truncation Analysis

## 1. Investigation Answers
1. **What is the exact context size limit?** 14,000.
2. **Is the limit measured in characters, tokens, or bytes?** Characters.
3. **Which data is being truncated?** The `combined_raw` string, which is the serialized concatenation of all tool execution results.
4. **Is truncation performed before or after normalization?** BEFORE normalization. It occurs right before the prompt is sent to the LLM.
5. **Are GitHub and Web results combined before truncation?** Yes. All results are appended to a single list and joined with `\n\n`.
6. **Does truncation preserve complete candidate objects?** No. It performs a blind slice (`combined_raw[:14000]`).
7. **Can truncation cut a JSON object/string in the middle?** Yes. For `COMP-007`, the cut occurred exactly in the middle of a word inside a JSON string value (`"...called continuous profil\n... [TRUNCATED..."`).
8. **Does truncation remove complete search results or simply characters?** It simply drops characters past the 14,000 threshold. 
9. **Which candidates are lost when truncation happens?** Because capabilities execute sequentially (`security.get` → `github.search` → `web.search`), the tools executed last (typically `web.search`) suffer the brunt of the truncation and are frequently lost or mangled.
10. **Does the system preserve both GitHub and Web results?** Not reliably. If GitHub results consume 13,000 characters, only 1,000 characters of Web results will survive.
11. **Does it preserve the highest-quality/relevant results?** No. It preserves results purely based on the hardcoded execution order of the tools.
12. **Is the first N results always preserved?** Yes, the first results injected into the string are preserved intact.
13. **Can important metadata such as stars/license/URL be lost?** Yes. If the cut happens midway through a Web result's JSON, its URL or score could easily be sliced off.
14. **How many candidates remain after truncation?** It varies. The LLM is surprisingly robust and usually salvages 3-5 candidates from the surviving (but corrupted) text block.
15. **Does the LLM receive valid structured JSON after truncation?** NO. The LLM receives a string containing broken/invalid JSON at the end, appended with `... [TRUNCATED to fit context size limits]`.
16. **Could truncation cause the ResearchAgent to miss better candidates?** YES. High-quality web results are systematically disadvantaged because they appear at the end of the payload.
17. **What happens when the result is slightly above the limit?** The final JSON object is cut mid-string, rendering it invalid.
18. **What happens when the result is 2x or 5x the limit?** Entire blocks of tool outputs (e.g. all of `web.search`) are completely obliterated.

## 2. Real State Analysis (`COMP-001` & `COMP-007`)

### COMP-001 (SECURITY)
- **Before Size:** 16,207 characters
- **After Size:** 14,000 characters
- **Number of results before:** 3 tools executed (each returning up to 5 results).
- **Number of results after:** The first two tools (`security.get`, `github.search`) survived intact. The `web.search` payload was partially destroyed.
- **What was lost:** 2,207 characters of Web Search JSON payload.
- **Is truncation safe:** No, it feeds invalid JSON to the LLM.
- **Can it affect quality:** Yes, Web candidates for COMP-001 were heavily truncated.

### COMP-007 (OBSERVABILITY)
- **Before Size:** 18,084 characters
- **After Size:** 14,000 characters
- **Number of results before:** 3 tools executed.
- **Number of results after:** Only the `license.get` and `github.search` tools survived intact.
- **What was lost:** 4,084 characters of Web Search JSON payload (cut precisely mid-word inside a `content` field).
- **Is truncation safe:** No.
- **Can it affect quality:** Yes, observability web candidates were lost.

## 3. Recommendation

**B. IMPROVE TRUNCATION**

**Reasoning:** 
The current blind string-slicing approach damages data structures and starves later tools of representation. However, replacing it with LLM summarization would introduce massive latency and cost overhead.

**Proposed Safe Implementation:**
We should truncate at the **Data Structure Level** rather than the String Level.
1. Distribute a character budget across the capabilities (e.g. 14,000 total / 3 tools = ~4,600 chars per tool).
2. For each tool's result list, iterate over the JSON objects.
3. Intelligently truncate bloated string fields (like `description`, `content`, `readme`) inside the Python dictionary *before* `json.dumps()` is called. 
4. If a tool's serialized output still exceeds its budget, drop the lowest-ranked results (list slicing) rather than cutting the string in half.

This ensures:
- The LLM always receives 100% valid JSON.
- Every capability gets guaranteed representation in the context.
- URLs and metadata are never accidentally sliced in half.
- Full search results are preserved, with only the verbose descriptions shortened.

## 4. Manual Reproduction Command
To reproduce the mathematical analysis of the raw string sizes and trace contents for this state:

```bash
cd /Users/Shyam/Desktop/Hackathon_2026/build_scout/backend

PYTHONPATH=. .venv/bin/python -c '
import json

with open("test_runs/manual_research_v3/04_research.json", "r") as f:
    state = json.load(f)

tool_calls = state.get("traces", [{}])[0].get("tool_calls", [])

def analyze_comp(comp_idx, name, num_caps):
    start = comp_idx * num_caps
    end = start + num_caps
    comp_tools = tool_calls[start:end]
    raw_results = []
    for tc in comp_tools:
        cap = tc.get("tool_name")
        provider = tc.get("provider")
        results = tc.get("results", [])
        valid_items = []
        for res in results:
            if isinstance(res, str) and res.strip(): 
                valid_items.append(res)
            elif isinstance(res, dict) and res: 
                valid_items.append(json.dumps(res, indent=2))
        if valid_items:
            raw_results.append(f"--- {cap.upper()} RESULTS ({provider}) ---")
            raw_results.extend(valid_items)
            
    combined = "\n\n".join(raw_results)
    print(f"[{name}] Total raw length: {len(combined)}")
    if len(combined) > 14000:
        print(f"[{name}] Lost chars: {len(combined) - 14000}")
        print(f"[{name}] Cut text snippet: {combined[14000:14100]}...")

analyze_comp(0, "COMP-001", 3)
analyze_comp(6, "COMP-007", 3)
'
```
