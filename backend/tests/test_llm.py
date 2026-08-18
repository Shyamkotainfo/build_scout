"""
test_llm.py — Integration test for the BuildSmart LLM client.

This is a REAL integration test. It calls the Groq API using the key
configured in backend/.env. Do NOT mock the API here.

Run with:
    pytest -v
"""

import pytest
from langchain_core.messages import HumanMessage

from llm.client import get_llm


def test_groq_llm_returns_nonempty_response() -> None:
    """Verify that the Groq LLM returns a non-empty response.

    Requires:
        GROQ_API_KEY must be set in backend/.env (or the shell environment).
        If it is missing, the test will fail with a descriptive error.
    """
    try:
        llm = get_llm()
    except Exception as exc:
        pytest.fail(
            f"Failed to initialise the Groq LLM client.\n"
            f"Make sure GROQ_API_KEY is set in backend/.env\n"
            f"Original error: {exc}"
        )

    prompt = "Explain BuildSmart in one sentence."
    response = llm.invoke([HumanMessage(content=prompt)])

    assert response is not None, "LLM returned None"
    assert response.content, (
        "LLM returned an empty response. "
        "Check that the model is available for your Groq account."
    )
    assert isinstance(response.content, str), (
        f"Expected response.content to be str, got {type(response.content)}"
    )
    assert len(response.content.strip()) > 0, "LLM response was blank/whitespace only"
