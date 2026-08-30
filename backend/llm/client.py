"""
client.py — BuildSmart LLM client factory.

Returns a LangChain-compatible chat model configured from app settings.

Provider selection (controlled by LLM_PROVIDER env var):
  - "bedrock"  → ChatBedrockConverse  (default, uses AWS credentials)
  - "groq"     → ChatGroq             (legacy, requires GROQ_API_KEY)

AWS Bedrock authentication order (standard boto3 chain):
  1. AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from .env / environment.
  2. ~/.aws/credentials profile.
  3. EC2 / ECS / Lambda instance role.

No API call is made until the returned model is actually invoked.
"""

import logging
from typing import Union

from config.settings import get_settings

logger = logging.getLogger(__name__)


def get_llm():
    """Create and return a configured LangChain chat model.

    Reads LLM_PROVIDER from settings (default: 'bedrock').
    Falls back to ChatGroq if GROQ_API_KEY is present and provider is 'groq'.

    Returns:
        A LangChain BaseChatModel (ChatBedrockConverse or ChatGroq).

    Raises:
        ValueError: If the configured provider is missing required credentials.
    """
    settings = get_settings()
    provider = (settings.llm_provider or "bedrock").lower().strip()

    if provider == "bedrock":
        return _build_bedrock_client(settings)
    elif provider == "groq":
        return _build_groq_client(settings)
    else:
        raise ValueError(
            f"Unknown LLM_PROVIDER '{provider}'. "
            "Set LLM_PROVIDER=bedrock or LLM_PROVIDER=groq in your .env file."
        )


def _build_bedrock_client(settings):
    """Build a ChatBedrockConverse client using AWS credentials from settings."""
    try:
        from langchain_aws import ChatBedrockConverse
    except ImportError as exc:
        raise ImportError(
            "langchain-aws is not installed. "
            "Run: pip install langchain-aws"
        ) from exc

    model_id = settings.bedrock_model_id
    region = settings.aws_region

    # ---------------------------------------------------------------------------
    # Collect credentials from settings, skipping unfilled placeholder values.
    # Only enter the explicit-session path when at least key_id + secret are set.
    # If absent, boto3 falls back to ~/.aws/credentials or IAM role automatically.
    # ---------------------------------------------------------------------------
    _PLACEHOLDERS = {
        "YOUR_AWS_ACCESS_KEY_ID",
        "YOUR_AWS_SECRET_ACCESS_KEY",
        "YOUR_AWS_SESSION_TOKEN",
        "disabled",
        "",
    }

    def _real(value: str | None) -> str | None:
        """Return value if it's a real credential, None if it's a placeholder."""
        if not value or value.strip() in _PLACEHOLDERS:
            return None
        return value

    key_id = _real(settings.aws_access_key_id)
    secret = _real(settings.aws_secret_access_key)
    token = _real(settings.aws_session_token)

    logger.info(
        f"LLM client | provider=bedrock | model={model_id} | region={region} | "
        f"explicit_creds={'yes' if key_id else 'no (using boto3 chain)'} | "
        f"session_token={'yes' if token else 'no'}"
    )

    if key_id and secret:
        # Explicit credentials from .env — build a boto3 session directly.
        import boto3
        from botocore.config import Config
        boto_session = boto3.Session(
            aws_access_key_id=key_id,
            aws_secret_access_key=secret,
            aws_session_token=token,   # None is fine for permanent AKIA keys
            region_name=region,
        )
        return ChatBedrockConverse(
            model=model_id,
            client=boto_session.client("bedrock-runtime", config=Config(read_timeout=120)),
        )
    else:
        # No explicit credentials — let boto3 resolve via its standard chain:
        #   ~/.aws/credentials → env vars → IAM instance role
        import boto3
        from botocore.config import Config
        boto_session = boto3.Session(region_name=region)
        return ChatBedrockConverse(
            model=model_id,
            client=boto_session.client("bedrock-runtime", config=Config(read_timeout=120)),
        )





def _build_groq_client(settings):
    """Build a ChatGroq client (legacy provider)."""
    try:
        from langchain_groq import ChatGroq
    except ImportError as exc:
        raise ImportError(
            "langchain-groq is not installed. "
            "Run: pip install langchain-groq"
        ) from exc

    if not settings.groq_api_key or settings.groq_api_key == "disabled":
        raise ValueError(
            "LLM_PROVIDER=groq but GROQ_API_KEY is not set. "
            "Set GROQ_API_KEY in your .env file or switch to LLM_PROVIDER=bedrock."
        )

    logger.info(
        f"LLM client | provider=groq | model={settings.groq_model}"
    )
    return ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        max_tokens=8192,
    )
