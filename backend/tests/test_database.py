import pytest
import os
from unittest.mock import patch
from config.settings import Settings

def test_database_url_not_configured():
    # If LAKEBASE_HOST is missing, database_url should be None
    settings = Settings(groq_api_key="test", lakebase_host=None, _env_file=None)
    assert settings.database_url is None

def test_database_url_configured():
    # Test valid configuration
    settings = Settings(
        groq_api_key="test",
        lakebase_host="test.databricks.com",
        lakebase_port=5432,
        lakebase_database="db1",
        lakebase_user="usr",
        lakebase_password="pwd",
        lakebase_ssl_mode="require",
        _env_file=None
    )
    url = settings.database_url
    assert url == "postgresql://usr:pwd@test.databricks.com:5432/db1?sslmode=require"

@patch('database.connection.get_settings')
def test_is_database_configured(mock_get_settings):
    from database.connection import is_database_configured
    mock_get_settings.return_value = Settings(
        groq_api_key="test",
        lakebase_host="test.databricks.com",
        _env_file=None
    )
    assert is_database_configured() is True
    
    mock_get_settings.return_value = Settings(
        groq_api_key="test",
        lakebase_host=None,
        _env_file=None
    )
    assert is_database_configured() is False
