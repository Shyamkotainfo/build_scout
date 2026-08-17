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


def get_settings() -> Settings:
    """Return a validated Settings instance.

    Raises:
        pydantic_settings.ValidationError: if GROQ_API_KEY is missing.
    """
    return Settings()
