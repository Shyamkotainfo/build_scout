import json
import re
from typing import Any

def extract_json(text: str) -> Any:
    """Extract and parse JSON from a string, handling markdown code blocks and extra text."""
    text = text.strip()
    
    # Try to find the first occurrence of a JSON object (between { and })
    # We use a non-greedy match to find the first block that looks like a JSON object.
    # To handle nested objects properly, we find the first '{' and the last '}'.
    start_idx = text.find('{')
    end_idx = text.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = text[start_idx:end_idx+1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            pass # Fall back to parsing the original text if regex extraction fails
            
    # Fallback: just try to load the stripped text
    return json.loads(text)
