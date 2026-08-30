import pytest
import os
import json
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts", "test_harnesses"))
from run_step import mask_secrets, get_step_index, main

def test_mask_secrets():
    input_state = {
        "analysis_id": "123",
        "api_key": "secret-key",
        "nested": {
            "token": "secret-token",
            "password": "my-password",
            "safe_field": "safe-value"
        },
        "traces": [
            {"authorization": "Bearer token", "status": "SUCCESS"}
        ]
    }
    
    masked = mask_secrets(input_state)
    
    assert masked["analysis_id"] == "123"
    assert masked["api_key"] == "***MASKED***"
    assert masked["nested"]["token"] == "***MASKED***"
    assert masked["nested"]["password"] == "***MASKED***"
    assert masked["nested"]["safe_field"] == "safe-value"
    assert masked["traces"][0]["authorization"] == "***MASKED***"
    assert masked["traces"][0]["status"] == "SUCCESS"

def test_get_step_index():
    assert get_step_index("prompt_optimizer") == "01"
    assert get_step_index("supervisor") == "02"
    assert get_step_index("validation") == "08"
    assert get_step_index("invalid_step") == "99"

@patch("run_step.run_prompt_optimizer")
@patch("sys.argv", ["run_step.py", "prompt_optimizer", "--prompt", "test request", "--run-id", "test_run"])
def test_main_prompt_optimizer_success(mock_opt, tmp_path):
    mock_opt.return_value = {"analysis_id": "test", "user_request": "test request", "normalized_request": "optimized"}
    
    # We patch os.path.dirname to point to tmp_path so it creates test_runs there
    with patch("run_step.os.path.dirname", return_value=str(tmp_path)):
        with patch("builtins.print"):
            main()
            
    # Verify file was created
    run_dir = os.path.join(str(tmp_path), "test_runs", "test_run")
    assert os.path.exists(run_dir)
    file_path = os.path.join(run_dir, "01_prompt_optimizer.json")
    assert os.path.exists(file_path)
    
    with open(file_path, "r") as f:
        data = json.load(f)
        assert data["normalized_request"] == "optimized"

@patch("run_step.os.path.dirname")
def test_main_supervisor_with_state(mock_dirname, tmp_path):
    mock_dirname.return_value = str(tmp_path)
    
    # Setup initial state file
    initial_state = {"analysis_id": "123", "normalized_request": "test"}
    state_file = os.path.join(str(tmp_path), "initial.json")
    with open(state_file, "w") as f:
        json.dump(initial_state, f)
        
    mock_node = MagicMock(return_value={"analysis_id": "123", "execution_plan": ["test"]})
    
    with patch("sys.argv", ["run_step.py", "supervisor", "--state", state_file, "--run-id", "test_run"]):
        with patch.dict("run_step.STEP_MAPPING", {"supervisor": mock_node}):
            with patch("builtins.print"):
                main()
                
    run_dir = os.path.join(str(tmp_path), "test_runs", "test_run")
    file_path = os.path.join(run_dir, "02_supervisor.json")
    assert os.path.exists(file_path)

@patch("run_step.os.path.dirname")
def test_main_step_failure(mock_dirname, tmp_path):
    mock_dirname.return_value = str(tmp_path)
    
    # Setup initial state file
    initial_state = {"analysis_id": "123", "api_key": "secret"}
    state_file = os.path.join(str(tmp_path), "initial.json")
    with open(state_file, "w") as f:
        json.dump(initial_state, f)
        
    mock_node = MagicMock(side_effect=Exception("Simulated Failure"))
    
    with patch("sys.argv", ["run_step.py", "supervisor", "--state", state_file, "--run-id", "test_fail"]):
        with patch.dict("run_step.STEP_MAPPING", {"supervisor": mock_node}):
            with patch("builtins.print"):
                try:
                    main()
                except SystemExit as e:
                    assert e.code == 1
                
    run_dir = os.path.join(str(tmp_path), "test_runs", "test_fail")
    file_path = os.path.join(run_dir, "02_supervisor_FAILED.json")
    assert os.path.exists(file_path)
    
    # Check that the failing state was masked and saved
    with open(file_path, "r") as f:
        data = json.load(f)
        assert data["api_key"] == "***MASKED***"
