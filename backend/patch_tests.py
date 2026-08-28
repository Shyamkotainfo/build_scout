import os
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "mock_llm.ainvoke =" not in content and "mock_llm_json.ainvoke" in content:
        content = content.replace("mock_llm_json.invoke = MagicMock(return_value=mock_response)", 
                                  "mock_llm.invoke = MagicMock(return_value=mock_response)\n    mock_llm_json.invoke = MagicMock(return_value=mock_response)")
        content = content.replace("mock_llm_json.ainvoke = AsyncMock(return_value=mock_response)", 
                                  "mock_llm.ainvoke = AsyncMock(return_value=mock_response)\n    mock_llm_json.ainvoke = AsyncMock(return_value=mock_response)")
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for filepath in glob.glob("tests/test_*.py"):
    patch_file(filepath)
