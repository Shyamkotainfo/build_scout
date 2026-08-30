import boto3
from botocore.exceptions import ClientError
import os

import pytest

@pytest.mark.skip(reason="Live AWS credentials required")
def test_aws_docs():
    # Create a Bedrock Runtime client in the AWS Region you want to use.
    client = boto3.client(
        "bedrock-runtime", 
        region_name="us-east-1",
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.environ.get("AWS_SESSION_TOKEN"),
    )

    # Set the model ID, e.g., Claude 3 Haiku.
    model_id = "anthropic.claude-3-haiku-20240307-v1:0"

    # Start a conversation with the user message.
    user_message = "Describe the purpose of a 'hello world' program in one line."
    conversation = [
        {
            "role": "user",
            "content": [{"text": user_message}],
        }
    ]

    try:
        print(f"Testing model_id: {model_id}...")
        # Send the message to the model, using a basic inference configuration.
        response = client.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={"maxTokens": 512, "temperature": 0.5, "topP": 0.9},
        )

        # Extract and print the response text.
        response_text = response["output"]["message"]["content"][0]["text"]
        print("SUCCESS!")
        print(response_text)

    except (ClientError, Exception) as e:
        import pytest
        pytest.fail(f"Can't invoke '{model_id}'. Reason: {e}")
