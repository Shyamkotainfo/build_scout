import time
import pytest
from typing import Any
from unittest.mock import MagicMock, patch

from langchain_core.messages import AIMessage, HumanMessage
import groq

from llm.retry import invoke_with_retry, ainvoke_with_retry
from api.exceptions import LLMServiceException


@pytest.fixture
def mock_settings():
    with patch("llm.retry.get_settings") as mock:
        settings = MagicMock()
        settings.llm_max_retries = 3
        settings.llm_retry_base_delay_seconds = 0  # 0 for fast testing
        settings.llm_retry_max_delay_seconds = 0
        settings.llm_context_target_tokens = 1000
        mock.return_value = settings
        yield settings


def test_first_attempt_succeeds(mock_settings):
    llm_callable = MagicMock(return_value=AIMessage(content="success"))
    messages = [HumanMessage(content="test")]
    
    response = invoke_with_retry(llm_callable, messages, "TestAgent")
    
    assert response.content == "success"
    assert llm_callable.call_count == 1


def test_first_attempt_fails_second_succeeds(mock_settings):
    # Mock groq.APIStatusError
    error = groq.APIStatusError(message="Rate limit", response=MagicMock(), body=None)
    error.status_code = 429
    
    llm_callable = MagicMock(side_effect=[error, AIMessage(content="success")])
    messages = [HumanMessage(content="test")]
    
    response = invoke_with_retry(llm_callable, messages, "TestAgent")
    
    assert response.content == "success"
    assert llm_callable.call_count == 2


def test_three_retries_fail_final_exception(mock_settings):
    error = groq.APIStatusError(message="500 Internal", response=MagicMock(), body=None)
    error.status_code = 500
    
    llm_callable = MagicMock(side_effect=[error, error, error, error, AIMessage(content="never")])
    messages = [HumanMessage(content="test")]
    
    with pytest.raises(LLMServiceException) as exc:
        invoke_with_retry(llm_callable, messages, "TestAgent")
    
    # 1 initial + 3 retries = 4 attempts total
    assert llm_callable.call_count == 4
    assert "Exhausted 3 retries" in str(exc.value)


def test_no_retry_for_invalid_api_key(mock_settings):
    error = groq.APIStatusError(message="Unauthorized", response=MagicMock(), body=None)
    error.status_code = 401
    
    llm_callable = MagicMock(side_effect=[error, AIMessage(content="never")])
    
    with pytest.raises(LLMServiceException) as exc:
        invoke_with_retry(llm_callable, [HumanMessage(content="test")], "TestAgent")
    
    assert llm_callable.call_count == 1
    assert "Non-retryable LLM provider error" in str(exc.value)


def test_no_retry_for_unsupported_model(mock_settings):
    error = groq.APIStatusError(message="Not Found", response=MagicMock(), body=None)
    error.status_code = 404
    
    llm_callable = MagicMock(side_effect=[error])
    
    with pytest.raises(LLMServiceException) as exc:
        invoke_with_retry(llm_callable, [HumanMessage(content="test")], "TestAgent")
    
    assert llm_callable.call_count == 1


def test_retry_for_timeout(mock_settings):
    error = groq.APITimeoutError(request=MagicMock())
    llm_callable = MagicMock(side_effect=[error, AIMessage(content="success")])
    
    response = invoke_with_retry(llm_callable, [HumanMessage(content="test")], "TestAgent")
    
    assert response.content == "success"
    assert llm_callable.call_count == 2


def test_413_triggers_context_compaction(mock_settings):
    error = groq.APIStatusError(message="Too Large", response=MagicMock(), body=None)
    error.status_code = 413
    
    llm_callable = MagicMock(side_effect=[error, AIMessage(content="success")])
    
    def compactor(msgs, limit):
        return [HumanMessage(content="compacted")]
        
    messages = [HumanMessage(content="huge text")]
    
    response = invoke_with_retry(llm_callable, messages, "TestAgent", context_compactor=compactor)
    
    assert response.content == "success"
    assert llm_callable.call_count == 2
    # Verify the second call received the compacted messages
    assert llm_callable.call_args_list[1][0][0][0].content == "compacted"


def test_413_fails_if_no_compactor(mock_settings):
    error = groq.APIStatusError(message="Too Large", response=MagicMock(), body=None)
    error.status_code = 413
    
    llm_callable = MagicMock(side_effect=[error])
    
    with pytest.raises(LLMServiceException) as exc:
        invoke_with_retry(llm_callable, [HumanMessage(content="test")], "TestAgent", context_compactor=None)
        
    assert llm_callable.call_count == 1
    assert "Request too large and no context compactor provided" in str(exc.value)


@patch("time.sleep")
def test_backoff_occurs_correctly_no_sleep_after_final(mock_sleep, mock_settings):
    mock_settings.llm_retry_base_delay_seconds = 1
    mock_settings.llm_retry_max_delay_seconds = 8
    
    error = groq.APIStatusError(message="Rate limit", response=MagicMock(), body=None)
    error.status_code = 429
    
    llm_callable = MagicMock(side_effect=[error, error, error, error])
    
    with pytest.raises(LLMServiceException):
        invoke_with_retry(llm_callable, [HumanMessage(content="test")], "TestAgent")
        
    # Attempt 1 -> sleep 1
    # Attempt 2 -> sleep 2
    # Attempt 3 -> sleep 4
    # Attempt 4 -> raise exception, NO sleep
    assert mock_sleep.call_count == 3
    assert mock_sleep.call_args_list[0][0][0] == 1
    assert mock_sleep.call_args_list[1][0][0] == 2
    assert mock_sleep.call_args_list[2][0][0] == 4


def test_secrets_never_logged(caplog, mock_settings):
    import logging
    caplog.set_level(logging.INFO)
    
    llm_callable = MagicMock(return_value=AIMessage(content="success"))
    messages = [HumanMessage(content="SUPER_SECRET_TOKEN_XYZ_123")]
    
    invoke_with_retry(llm_callable, messages, "TestAgent")
    
    for record in caplog.records:
        assert "SUPER_SECRET_TOKEN_XYZ_123" not in record.message
        assert "success" not in record.message
        
    assert "Estimated input tokens" in caplog.text


@pytest.mark.asyncio
async def test_async_invoke_first_attempt_succeeds(mock_settings):
    async def mock_call(msgs):
        return AIMessage(content="success")
        
    messages = [HumanMessage(content="test")]
    
    response = await ainvoke_with_retry(mock_call, messages, "TestAgent")
    assert response.content == "success"
