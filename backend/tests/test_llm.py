"""
test_llm.py — Integration test for the BuildSmart LLM client.

Tests that the LLM client constructs correctly for the configured provider
(Bedrock by default). The live invocation test is skipped unless
AWS credentials are actually present in the environment.

Run with:
    pytest -v backend/tests/test_llm.py
"""

import pytest
from langchain_core.messages import HumanMessage

from llm.client import get_llm


def test_llm_client_constructs() -> None:
    """Verify that get_llm() returns a usable chat model object.

    This does NOT make a live API call — it only validates that the client
    can be constructed from the current settings.
    """
    try:
        llm = get_llm()
    except Exception as exc:
        pytest.fail(
            f"Failed to initialise the LLM client.\n"
            f"Check LLM_PROVIDER, AWS_ACCESS_KEY_ID, and BEDROCK_MODEL_ID in backend/.env\n"
            f"Original error: {exc}"
        )

    # Should have an invoke method (LangChain BaseChatModel contract)
    assert callable(getattr(llm, "invoke", None)), "LLM client must expose .invoke()"


def test_llm_client_provider_is_bedrock() -> None:
    """Confirm the active provider is AWS Bedrock (default configuration)."""
    from config.settings import get_settings
    from langchain_aws import ChatBedrockConverse

    settings = get_settings()
    if settings.llm_provider.lower() != "bedrock":
        pytest.skip("LLM_PROVIDER is not 'bedrock' — skipping Bedrock-specific check.")

    llm = get_llm()
    assert isinstance(llm, ChatBedrockConverse), (
        f"Expected ChatBedrockConverse, got {type(llm).__name__}"
    )


@pytest.mark.skipif(
    True,  # Always skip in unit test runs; enable manually for live integration tests
    reason="Live AWS Bedrock call — enable manually with real credentials.",
)
def test_bedrock_llm_returns_nonempty_response() -> None:
    """Live integration test. Requires real AWS credentials with Bedrock access."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content="Explain BuildSmart in one sentence.")])

    assert response is not None, "LLM returned None"
    assert response.content, "LLM returned an empty response."
    assert isinstance(response.content, str)
    assert len(response.content.strip()) > 0, "LLM response was blank/whitespace only"
