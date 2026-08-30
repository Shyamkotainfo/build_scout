from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
import os
from pathlib import Path
from dotenv import dotenv_values

router = APIRouter()

# Path to the backend .env file
ENV_PATH = Path(__file__).parent.parent / ".env"

SETTINGS_REGISTRY = {
    "GROQ_API_KEY": {
        "description": "Groq API key. Required for LLM calls.",
        "type": "secret",
        "category": "LLM",
        "editable": True,
        "is_secret": True
    },
    "GROQ_MODEL": {
        "description": "Groq model identifier to use for all LLM calls.",
        "type": "string",
        "category": "LLM",
        "editable": True,
        "is_secret": False
    },
    "LLM_MAX_RETRIES": {
        "description": "Maximum number of retries for an LLM call after initial failure.",
        "type": "integer",
        "category": "LLM",
        "editable": True,
        "is_secret": False
    },
    "LLM_RETRY_BASE_DELAY_SECONDS": {
        "description": "Base delay in seconds for LLM exponential backoff.",
        "type": "integer",
        "category": "LLM",
        "editable": True,
        "is_secret": False
    },
    "LLM_RETRY_MAX_DELAY_SECONDS": {
        "description": "Maximum delay in seconds for LLM exponential backoff.",
        "type": "integer",
        "category": "LLM",
        "editable": True,
        "is_secret": False
    },
    "LLM_CONTEXT_TARGET_TOKENS": {
        "description": "Target maximum token size (estimated) for compacted LLM context.",
        "type": "integer",
        "category": "LLM",
        "editable": True,
        "is_secret": False
    },
    "MCP_GITHUB_COMMAND": {
        "description": "Command to run the GitHub MCP server.",
        "type": "string",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": False
    },
    "MCP_TAVILY_COMMAND": {
        "description": "Command to run the Web Search MCP server.",
        "type": "string",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": False
    },
    "TAVILY_API_KEY": {
        "description": "API key for Tavily Search.",
        "type": "secret",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": True
    },
    "MCP_REQUEST_TIMEOUT_SECONDS": {
        "description": "Maximum seconds to wait for an MCP tool call.",
        "type": "integer",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": False
    },
    "MCP_MAX_RETRIES": {
        "description": "Maximum number of retries for an MCP tool call.",
        "type": "integer",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": False
    },
    "MCP_MAX_RESULT_SIZE": {
        "description": "Maximum length of characters to return from an MCP tool call.",
        "type": "integer",
        "category": "MCP / Tools",
        "editable": True,
        "is_secret": False
    },
    "LAKEBASE_HOST": {
        "description": "Databricks Lakebase host address.",
        "type": "string",
        "category": "Database",
        "editable": True,
        "is_secret": False
    },
    "LAKEBASE_PORT": {
        "description": "Databricks Lakebase connection port.",
        "type": "integer",
        "category": "Database",
        "editable": True,
        "is_secret": False
    },
    "LAKEBASE_DATABASE": {
        "description": "Databricks Lakebase database name.",
        "type": "string",
        "category": "Database",
        "editable": True,
        "is_secret": False
    },
    "LAKEBASE_USER": {
        "description": "Databricks Lakebase username.",
        "type": "string",
        "category": "Database",
        "editable": True,
        "is_secret": False
    },
    "LAKEBASE_PASSWORD": {
        "description": "Databricks Lakebase password/token.",
        "type": "secret",
        "category": "Database",
        "editable": True,
        "is_secret": True
    },
    "LAKEBASE_SSL_MODE": {
        "description": "Databricks Lakebase SSL mode.",
        "type": "string",
        "category": "Database",
        "editable": True,
        "is_secret": False
    },
    "BUILDSMART_FULL_LOG_FILE": {
        "description": "Path to the full application log file.",
        "type": "string",
        "category": "Logging",
        "editable": True,
        "is_secret": False
    },
    "BUILDSMART_TOKEN_LOG_FILE": {
        "description": "Path to the token-only log file.",
        "type": "string",
        "category": "Logging",
        "editable": True,
        "is_secret": False
    },
    "INPUT_PRICE_PER_1M_TOKENS": {
        "description": "Cost in USD per 1 million input tokens.",
        "type": "float",
        "category": "Advanced",
        "editable": True,
        "is_secret": False
    },
    "OUTPUT_PRICE_PER_1M_TOKENS": {
        "description": "Cost in USD per 1 million output tokens.",
        "type": "float",
        "category": "Advanced",
        "editable": True,
        "is_secret": False
    },
}

@router.get("/api/v1/settings", tags=["Settings"], summary="Get application settings")
def get_settings():
    """
    Returns the current backend configuration registry with masked secrets.
    """
    env_vars = dotenv_values(ENV_PATH)
    response_settings = []
    
    for key, meta in SETTINGS_REGISTRY.items():
        value = env_vars.get(key, "")
        
        if meta["is_secret"]:
            is_configured = bool(value)
            display_value = "********" if is_configured else ""
        else:
            display_value = value
            is_configured = bool(value)
            
        response_settings.append({
            "key": key,
            "value": display_value,
            "is_configured": is_configured,
            "description": meta["description"],
            "type": meta["type"],
            "category": meta["category"],
            "editable": meta["editable"],
            "is_secret": meta["is_secret"],
            "source": ".env"
        })
            
    return {"settings": response_settings}

@router.put("/api/v1/settings", tags=["Settings"], summary="Update application settings")
def update_settings(updates: Dict[str, str]):
    """
    Updates the backend .env file safely and atomically.
    Requires a backend restart to take effect.
    """
    # 1. Validate keys
    for key in updates.keys():
        key_upper = key.upper()
        if key_upper not in SETTINGS_REGISTRY:
            raise HTTPException(status_code=400, detail=f"Setting '{key_upper}' is not allowed to be modified.")

    # 2. Read existing .env safely
    lines = []
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
    # 3. Update or append
    updated_keys = set()
    new_lines = []
    
    for line in lines:
        stripped = line.strip()
        # Keep comments and empty lines
        if not stripped or stripped.startswith("#"):
            new_lines.append(line)
            continue
            
        # Parse key
        if "=" in line:
            key_part, _ = line.split("=", 1)
            key_upper = key_part.strip().upper()
            
            if key_upper in updates:
                new_val = updates[key_upper]
                # If it's a secret and masked, do NOT update it
                if SETTINGS_REGISTRY[key_upper]["is_secret"] and (new_val == "********" or new_val == ""):
                    new_lines.append(line)
                    # We processed it (left unchanged), so mark as updated to prevent append,
                    # but don't add to the API response's updated_keys. 
                    # Wait, if we don't add to updated_keys, the append loop WILL process it, 
                    # but it skips it because it's a masked secret! 
                    # So it's safe to just NOT add it to updated_keys.
                else:
                    # Update value
                    new_lines.append(f"{key_part}={new_val}\n")
                    updated_keys.add(key_upper)
                continue
                
        new_lines.append(line)
        
    # Append any keys that weren't already in the file
    for key, new_val in updates.items():
        key_upper = key.upper()
        if key_upper not in updated_keys:
            if SETTINGS_REGISTRY[key_upper]["is_secret"] and (new_val == "********" or new_val == ""):
                continue
            if new_val != "":  # Don't append empty non-secret values either
                new_lines.append(f"{key_upper}={new_val}\n")
                updated_keys.add(key_upper)
            
    # 4. Atomic write
    tmp_path = ENV_PATH.with_suffix(".env.tmp")
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        os.replace(tmp_path, ENV_PATH)
    except Exception as e:
        if tmp_path.exists():
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail="Failed to save settings to .env file safely.")
        
    return {"message": "Configuration saved. Restart BuildSmart for this change to take effect.", "updated_keys": list(updated_keys)}
