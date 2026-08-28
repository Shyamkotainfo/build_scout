import asyncio
import json
import logging
from llm.client import get_llm
from langchain_core.messages import SystemMessage, HumanMessage
from config.settings import get_settings

logging.basicConfig(level=logging.INFO)

async def test_bedrock():
    settings = get_settings()
    print(f"Testing Bedrock with model: {settings.bedrock_model_id}")
    llm = get_llm()
    
    messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content='Return JSON with one field named "status" containing the value "ok". Output ONLY JSON.')
    ]
    
    response = await llm.ainvoke(messages)
    print("Response Content:", response.content)
    print("Response Metadata:", response.response_metadata)

if __name__ == "__main__":
    asyncio.run(test_bedrock())
