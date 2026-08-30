import os
import json
import logging
from unittest.mock import patch, MagicMock

from services.prompt_optimizer import PromptOptimizer, PromptOptimizationResult
from llm.retry import invoke_with_retry
from api.exceptions import LLMServiceException
from utils.json_helpers import extract_json

logging.basicConfig(level=logging.INFO, format="%(levelname)-8s %(message)s")
logger = logging.getLogger("cert_tests")

def run_real_llm_cases():
    print("\n" + "="*50)
    print("PHASE 1: REAL LLM PROMPT OPTIMIZATION CASES")
    print("="*50)
    
    optimizer = PromptOptimizer()
    
    cases = [
        "Build a simple calculator.",
        "Build an AI document intelligence platform using AWS, Python and React.",
        "I need something for processing documents.",
        "Build an enterprise document intelligence platform that supports PDFs, OCR, semantic search, role-based access, AWS deployment and integration with existing enterprise APIs."
    ]
    
    for i, case in enumerate(cases, 1):
        print(f"\n--- CASE {i} ---")
        print(f"INPUT: '{case}'")
        try:
            result = optimizer.optimize(user_request=case, analysis_id=f"cert-case-{i}")
            print(f"INTENT: {result.intent}")
            print(f"OPTIMIZED: {result.optimized_request}")
            print(f"CONSTRAINTS: {result.constraints}")
            print(f"TECHNOLOGIES: {result.known_technologies}")
            print(f"REQUIREMENTS: {result.requirements}")
            print(f"MISSING INFO: {result.missing_information}")
            print(f"CONFIDENCE: {result.confidence}")
            print(f"APPLIED: {result.optimization_applied}")
            
            # Assertions
            assert result.original_request == case, "Failed: Original request not preserved"
            assert result.intent in ["BUILD", "MIGRATE", "REPLACE", "INTEGRATE", "IMPROVE", "EVALUATE", "UNKNOWN"], "Failed: Invalid intent"
            
        except Exception as e:
            print(f"❌ LLM Call Failed: {e}")

def run_retry_tests():
    print("\n" + "="*50)
    print("PHASE 2: LLM RELIABILITY (MOCKED RETRY)")
    print("="*50)
    
    # We will mock the llm callable to throw specific errors and see if invoke_with_retry handles them
    def create_failing_llm(error_message, status_code=None, fail_count=3):
        calls = {"count": 0}
        def mock_invoke(*args, **kwargs):
            calls["count"] += 1
            if calls["count"] <= fail_count:
                # We raise a generic Exception but with a string that might imply a status code
                # For our specific retry implementation, we duck-type status_code or check message
                err = Exception(error_message)
                if status_code:
                    err.status_code = status_code
                raise err
            
            mock_resp = MagicMock()
            mock_resp.content = '{"intent": "BUILD"}'
            return mock_resp
        return mock_invoke, calls

    # Test 1: 429 Too Many Requests (Retryable)
    print("\n--- Test: 429 Too Many Requests ---")
    mock_llm, calls = create_failing_llm("Too Many Requests", status_code=429, fail_count=2)
    try:
        invoke_with_retry(mock_llm, [], "PromptOptimizer", "test-429")
        print(f"✅ Success after {calls['count']} attempts")
    except Exception as e:
        print(f"❌ Failed unexpectedly: {e}")

    # Test 2: 401 Unauthorized (Non-Retryable)
    print("\n--- Test: 401 Unauthorized ---")
    mock_llm, calls = create_failing_llm("Unauthorized", status_code=401, fail_count=3)
    try:
        invoke_with_retry(mock_llm, [], "PromptOptimizer", "test-401")
        print(f"❌ Should have thrown LLMServiceException")
    except LLMServiceException as e:
        print(f"✅ Failed fast on attempt {calls['count']} (expected 1). Error: {e}")

    # Test 3: 413 Payload Too Large (Non-Retryable)
    print("\n--- Test: 413 Payload Too Large ---")
    mock_llm, calls = create_failing_llm("Payload too large", status_code=413, fail_count=3)
    try:
        invoke_with_retry(mock_llm, [], "PromptOptimizer", "test-413")
        print(f"❌ Should have thrown LLMServiceException")
    except LLMServiceException as e:
        print(f"✅ Failed fast on attempt {calls['count']} (expected 1). Error: {e}")

    # Test 4: Maximum Retries Exceeded (500 Internal Server Error)
    print("\n--- Test: 500 Max Retries Exceeded ---")
    mock_llm, calls = create_failing_llm("Internal Error", status_code=500, fail_count=10) # Fails forever
    try:
        invoke_with_retry(mock_llm, [], "PromptOptimizer", "test-500")
        print(f"❌ Should have thrown LLMServiceException")
    except LLMServiceException as e:
        print(f"✅ Failed after exhausting retries (attempts: {calls['count']}). Error: {e}")

def run_parsing_tests():
    print("\n" + "="*50)
    print("PHASE 3: PARSING RESILIENCE")
    print("="*50)
    
    cases = {
        "Clean JSON": '{"intent": "BUILD"}',
        "Markdown Fenced JSON": '```json\n{"intent": "BUILD"}\n```',
        "Extra text before JSON": 'Here is your response:\n```json\n{"intent": "BUILD"}\n```',
        "Extra text after JSON": '```json\n{"intent": "BUILD"}\n```\nHope this helps!',
        "Malformed JSON": '{"intent": "BUILD",', # missing closing brace
        "Multiple objects": '{"intent": "BUILD"}\n{"intent": "EVALUATE"}'
    }
    
    for name, content in cases.items():
        print(f"\n--- {name} ---")
        try:
            result = extract_json(content)
            print(f"✅ Parsed successfully: {result}")
        except Exception as e:
            print(f"❌ Parse failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    run_real_llm_cases()
    run_retry_tests()
    run_parsing_tests()
