"""
settings.py — BuildSmart application configuration.

Root-level configuration accessible to all modules (llm/, agents/, etc.)
without requiring the app/ package namespace.

Reads environment variables from .env (backend/.env) or the shell.
Fails fast with a clear error if required values are missing.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-level settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    groq_api_key: str = Field(
        ...,
        description="Groq API key. Required. Set GROQ_API_KEY in your .env file.",
    )
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        description="Groq model identifier to use for all LLM calls.",
    )

    mcp_github_command: str | None = Field(
        default=None,
        description="Command to run the GitHub MCP server (e.g. 'npx -y @modelcontextprotocol/server-github').",
    )
    mcp_tavily_command: str | None = Field(
        default=None,
        description="Command to run the Web Search MCP server (e.g. 'npx -y @toolsdk.ai/tavily-mcp').",
    )
    tavily_api_key: str | None = Field(
        default=None,
        description="API key for Tavily Search, passed to the Tavily MCP server.",
    )
    mcp_request_timeout_seconds: int = Field(
        default=30,
        description="Maximum seconds to wait for an MCP tool call to complete.",
    )
    mcp_max_retries: int = Field(
        default=2,
        description="Maximum number of retries for an MCP tool call on failure.",
    )
    mcp_max_result_size: int = Field(
        default=50000,
        description="Maximum length of characters to return from an MCP tool call.",
    )

    lakebase_host: str | None = Field(
        default=None,
        description="Databricks Lakebase host address (PostgreSQL compatible).",
    )
    lakebase_port: int = Field(
        default=5432,
        description="Databricks Lakebase connection port.",
    )
    lakebase_database: str | None = Field(
        default=None,
        description="Databricks Lakebase database name.",
    )
    lakebase_user: str | None = Field(
        default=None,
        description="Databricks Lakebase username.",
    )
    lakebase_password: str | None = Field(
        default=None,
        description="Databricks Lakebase password/token.",
    )
    lakebase_ssl_mode: str = Field(
        default="require",
        description="Databricks Lakebase SSL mode (default: require).",
    )

    @property
    def database_url(self) -> str | None:
        """Returns the PostgreSQL connection URL for Lakebase, if configured."""
        if not self.lakebase_host:
            return None
        return (
            f"postgresql://{self.lakebase_user}:{self.lakebase_password}"
            f"@{self.lakebase_host}:{self.lakebase_port}/{self.lakebase_database}"
            f"?sslmode={self.lakebase_ssl_mode}"
        )


def get_settings() -> Settings:
    """Return a validated Settings instance.

    Raises:
        pydantic_settings.ValidationError: if GROQ_API_KEY is missing.
    """
    return Settings()
