import os
import glob

files = glob.glob('backend/agents/*.py') + ['backend/services/prompt_optimizer.py']

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    modified = False
    
    # Replace .bind(...)
    if '.bind(response_format={"type": "json_object"})' in content:
        content = content.replace('.bind(response_format={"type": "json_object"})', '')
        modified = True
        
    # Replace json.loads with extract_json
    if 'json.loads(' in content and 'extract_json' not in content:
        content = content.replace('import json', 'import json\nfrom utils.json_helpers import extract_json')
        content = content.replace('json.loads(', 'extract_json(')
        modified = True
        
    if modified:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

