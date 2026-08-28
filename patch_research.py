import re

with open("backend/agents/research.py", "r") as f:
    content = f.read()

# 1. Update _research_component tool loop
old_tool_loop = """
        for cap in capabilities:
            try:
                # Build common parameters, capabilities will ignore what they don't need
                args = {
                    "query": query,
                    "repository": query,  # Some tools expect 'repository' instead of 'query'
                    "limit": 10
                }
                logger.info(f"ResearchAgent executing capability: {cap} for {comp_id}")
                trace = await tool_gateway.execute_tool(cap, args)
                traces.append(trace)
                
                if trace["status"] == "SUCCESS" and trace.get("results"):
                    results = trace["results"]
                    
                    # Accumulate valid items first
                    valid_items = []
                    for res in results:
                        if isinstance(res, str):
                            if res.strip():
                                valid_items.append(res)
                        else:
                            if res:
                                valid_items.append(res)  # keep as dict
                                
                    if valid_items:
                        # Append the parsed dicts, along with their provider context
                        for item in valid_items:
                            raw_results.append({
                                "_tool": cap.upper(),
                                "_provider": trace.get('provider', 'UNKNOWN'),
                                "data": item
                            })
            except Exception as e:
                logger.warning(f"Capability {cap} failed for {comp_id}: {e}")
"""

new_tool_loop = """
        async def fetch_cap(cap):
            args = {
                "query": query,
                "repository": query,
                "limit": 10
            }
            logger.info(f"ResearchAgent executing capability: {cap} for {comp_id}")
            try:
                return cap, await tool_gateway.execute_tool(cap, args)
            except Exception as e:
                logger.warning(f"Capability {cap} failed for {comp_id}: {e}")
                return cap, None

        tasks = [fetch_cap(cap) for cap in capabilities]
        gathered_traces = await asyncio.gather(*tasks)

        # Process in deterministic order
        for cap, trace in gathered_traces:
            if not trace: continue
            traces.append(trace)
            if trace["status"] == "SUCCESS" and trace.get("results"):
                results = trace["results"]
                
                valid_items = []
                for res in results:
                    if isinstance(res, str):
                        if res.strip():
                            valid_items.append(res)
                    else:
                        if res:
                            valid_items.append(res)
                            
                if valid_items:
                    for item in valid_items:
                        raw_results.append({
                            "_tool": cap.upper(),
                            "_provider": trace.get('provider', 'UNKNOWN'),
                            "data": item
                        })
"""

# 2. Update _arun loop
old_arun_loop = """
        # To avoid being rate limited and for V1 scope, process sequentially or in limited batches
        for comp in components:
            logger.info(f"ResearchAgent researching component: {comp.get('name')}")
            comp_candidates, traces = await self._research_component(comp, analysis_id)
            agent_traces.extend(traces)
            
            # Deduplicate by URL
            for cand in comp_candidates:
                url = cand.get("url", "").strip().lower()
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    cand["id"] = f"CAND-{len(all_candidates) + 1:03d}"
                    all_candidates.append(cand)
"""

new_arun_loop = """
        # Bounded concurrency for components
        semaphore = asyncio.Semaphore(4)
        
        async def process_comp(comp):
            async with semaphore:
                logger.info(f"ResearchAgent researching component: {comp.get('name')}")
                comp_cands, comp_traces = await self._research_component(comp, analysis_id)
                return comp_cands, comp_traces

        tasks = [process_comp(comp) for comp in components]
        # Gather maintains order of the original components list
        results = await asyncio.gather(*tasks)
        
        for comp_candidates, traces in results:
            agent_traces.extend(traces)
            
            # Deduplicate by URL
            for cand in comp_candidates:
                url = cand.get("url", "").strip().lower()
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    cand["id"] = f"CAND-{len(all_candidates) + 1:03d}"
                    all_candidates.append(cand)
"""

content = content.replace(old_tool_loop.strip("\n"), new_tool_loop.strip("\n"))
content = content.replace(old_arun_loop.strip("\n"), new_arun_loop.strip("\n"))

with open("backend/agents/research.py", "w") as f:
    f.write(content)

print("Updated research.py successfully.")
