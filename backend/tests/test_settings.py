import pytest
import os
from pathlib import Path
from fastapi.testclient import TestClient
from api.main import app
from api.settings_router import ENV_PATH

client = TestClient(app)

@pytest.fixture
def mock_env_file():
    """Fixture to manage a temporary .env file for testing."""
    # Backup original
    original_content = ""
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            original_content = f.read()

    # Create dummy .env
    dummy_content = """# Test Config
GROQ_API_KEY=gsk_test123
GROQ_MODEL=llama-3
# Unmanaged
CUSTOM_VAR=hello
"""
    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.write(dummy_content)

    yield

    # Restore original
    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.write(original_content)


def test_get_settings(mock_env_file):
    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    data = response.json()
    assert "settings" in data
    
    settings = data["settings"]
    # Check that secrets are masked
    groq_api_key = next((s for s in settings if s["key"] == "GROQ_API_KEY"), None)
    assert groq_api_key is not None
    assert groq_api_key["value"] == "********"
    assert groq_api_key["is_configured"] is True
    assert groq_api_key["is_secret"] is True
    
    # Check regular values
    groq_model = next((s for s in settings if s["key"] == "GROQ_MODEL"), None)
    assert groq_model["value"] == "llama-3"
    assert groq_model["is_configured"] is True
    assert groq_model["is_secret"] is False


def test_update_settings_success(mock_env_file):
    # Update a normal setting and a secret
    payload = {
        "GROQ_MODEL": "llama-4",
        "GROQ_API_KEY": "gsk_newkey"
    }
    
    response = client.put("/api/v1/settings", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "GROQ_MODEL" in data["updated_keys"]
    assert "GROQ_API_KEY" in data["updated_keys"]
    
    # Verify .env file content
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "GROQ_MODEL=llama-4" in content
    assert "GROQ_API_KEY=gsk_newkey" in content
    assert "CUSTOM_VAR=hello" in content  # Preserved unmanaged var


def test_update_settings_mask_ignore(mock_env_file):
    """Ensure that passing '********' does not overwrite the actual secret."""
    payload = {
        "GROQ_API_KEY": "********"
    }
    
    response = client.put("/api/v1/settings", json=payload)
    assert response.status_code == 200
    assert "GROQ_API_KEY" not in response.json()["updated_keys"]
    
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "GROQ_API_KEY=gsk_test123" in content  # Unchanged


def test_update_settings_unsupported(mock_env_file):
    payload = {
        "UNSUPPORTED_VAR": "hacked"
    }
    response = client.put("/api/v1/settings", json=payload)
    # Fast api standard exception handler will map HTTPException 400 to our custom error response maybe?
    # Actually wait, HTTPException will just return 400 with detail.
    assert response.status_code == 400
