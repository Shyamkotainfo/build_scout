# Backend Step Runner (Development & Test Harness)

## Purpose

The BuildSmart step runner (`run_step.py`) is a development and testing harness. The primary purpose is to allow developers and agents to run, debug, and certify individual stages of the BuildSmart LangGraph workflow without needing to execute the entire 5-minute pipeline.

**Important:** This is strictly for development and testing. The production `POST /api/v1/analyses` endpoint remains entirely unchanged and continues to execute the full LangGraph workflow securely in one pass. Individual agent endpoints are NOT exposed in the production API.

## Features

1. **Independent Stage Execution:** Run exactly the agent stage you are testing.
2. **State Serialization:** After each stage, the exact `BuildSmartState` dictionary is serialized to JSON.
3. **State Resumption:** Feed a saved state snapshot into the next agent to continue the pipeline exactly where it left off.
4. **Grouped Execution:** Run multiple stages sequentially in one command.
5. **Secret Masking:** Any keys named `api_key`, `password`, `token`, etc., are securely masked with `***MASKED***` before saving the JSON snapshot to disk.
6. **Failure Preservation:** If a stage crashes or throws an exception, the script will immediately halt, but it will save the *failing input state* to a file ending in `_FAILED.json`. This provides an exact reproducible test case for debugging.
7. **Tool Execution Summary:** When the `research` step finishes, the harness automatically extracts and prints a summary of all MCP and LOCAL tool calls, including their provider and latency.
8. **Real LLM Integration:** The runner uses the real `get_llm()` and `invoke_with_retry` mechanisms exactly as production does. It records real LLM tokens and latency.

## Usage Instructions

All commands should be run from the `backend/` directory with `PYTHONPATH=.`.

### 1. Starting a New Run (Prompt Optimizer)

To start a new test run, begin with the `prompt_optimizer` stage. You must provide a `--prompt`:

```bash
PYTHONPATH=. python run_step.py prompt_optimizer --prompt "Build a test app"
```

**Output:**
- Creates a new directory: `test_runs/<timestamp>/`
- Saves: `test_runs/<timestamp>/01_prompt_optimizer.json`

### 2. Running the Next Stage (Supervisor)

To run the Supervisor agent, you pass the state from the previous stage:

```bash
PYTHONPATH=. python run_step.py supervisor \
  --state test_runs/<timestamp>/01_prompt_optimizer.json \
  --run-id <timestamp>
```

**Output:**
- Saves: `test_runs/<timestamp>/02_supervisor.json`

### 3. Grouped Execution

You can run multiple stages sequentially. The script will automatically pass the state between them and save a snapshot after each one:

```bash
PYTHONPATH=. python run_step.py decomposition research evaluation \
  --state test_runs/<timestamp>/02_supervisor.json \
  --run-id <timestamp>
```

**Output:**
- Saves: `03_decomposition.json`
- Saves: `04_research.json` (and prints the Tool Execution Summary)
- Saves: `05_evaluation.json`

## Supported Stages

The `--steps` argument accepts any combination of:
1. `prompt_optimizer`
2. `supervisor`
3. `decomposition`
4. `research`
5. `evaluation`
6. `decision`
7. `blueprint`
8. `validation`

## Security and Secrets

Do not commit the `test_runs/` directory to source control (it should be ignored by `.gitignore`). Although the `mask_secrets` function makes a best-effort attempt to redact credentials before writing to disk, it is best practice to keep all test snapshots local.
