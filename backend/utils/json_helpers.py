import json
import re
from typing import Any

def extract_json(text: str) -> Any:
    """Extract and parse JSON from a string, handling markdown code blocks, reasoning tags, and extra text."""
    text = text.strip()
    
    # Strip <think>...</think> blocks common in reasoning models
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    
    # Try to find a JSON block in markdown
    markdown_match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
    if markdown_match:
        try:
            return json.loads(markdown_match.group(1))
        except json.JSONDecodeError:
            pass
            
    # Try to extract an object or array
    try:
        # Find first { or [ and last } or ]
        start_obj = text.find('{')
        end_obj = text.rfind('}')
        start_arr = text.find('[')
        end_arr = text.rfind(']')
        
        # Determine whether it's an object or array based on what appears first
        start_idx = -1
        end_idx = -1
        
        if start_obj != -1 and (start_arr == -1 or start_obj < start_arr):
            start_idx = start_obj
            end_idx = end_obj
        elif start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
            start_idx = start_arr
            end_idx = end_arr
            
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            json_str = text[start_idx:end_idx+1]
            return json.loads(json_str)
    except json.JSONDecodeError:
        pass
        
    # Fallback
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        print(f"FAILED TO PARSE JSON. RAW TEXT WAS:\n{text}\nEND OF RAW TEXT")
        raise
