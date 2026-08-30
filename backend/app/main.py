"""
main.py — BuildSmart manual LLM smoke-test entry point.

Run with:
    python -m app.main

Loads the Groq model, sends a single message, and prints the response.
No FastAPI, no agents — Step 1 smoke test.
"""

from langchain_core.messages import HumanMessage

from llm.client import get_llm
from llm.prompts import LLM_SMOKE_TEST_PROMPT


def run_smoke_test() -> None:
    """Send a single message to the Groq LLM and print the result."""
    prompt = LLM_SMOKE_TEST_PROMPT

    print("BuildSmart LLM Test")
    print("-------------------")

    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])

    print("Response:")
    print(response.content)


if __name__ == "__main__":
    run_smoke_test()
