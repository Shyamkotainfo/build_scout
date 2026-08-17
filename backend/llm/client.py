"""
client.py — BuildSmart LLM client factory.

Returns a ready-to-use ChatGroq instance configured from app settings.
No agents, no graph nodes — just a reusable ChatModel factory.
"""

from langchain_groq import ChatGroq

from config.settings import get_settings


def get_llm() -> ChatGroq:
    """Create and return a configured ChatGroq instance.

    Reads GROQ_API_KEY and GROQ_MODEL from the environment via config.py.
    No API call is made until you actually invoke the returned model.

    Returns:
        ChatGroq: A LangChain-compatible chat model ready for use.

    Raises:
        pydantic_settings.ValidationError: if GROQ_API_KEY is not set.
    """
    settings = get_settings()

    return ChatGroq(
        api_key=settings.groq_api_key,
        model=settings.groq_model,
    )
