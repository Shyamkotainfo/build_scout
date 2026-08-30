import os
import json
import pytest
from unittest.mock import patch, MagicMock
from langchain_core.messages import AIMessage, HumanMessage
import groq

from llm.metrics import (
    extract_tokens,
    record_llm_call,
    get_metrics_for_analysis,
    pop_metrics_for_analysis,
    calculate_cost,
    aggregate_workflow_metrics,
    _metrics_store,
    _token_logger,
    _full_logger
)
from llm.retry import invoke_with_retry, ainvoke_with_retry
from api.exceptions import LLMServiceException

@pytest.fixture(autouse=True)
def clean_metrics_store():
    _metrics_store.clear()
    yield
    _metrics_store.clear()


def test_extract_tokens_with_metadata():
    msg = AIMessage(content="test", response_metadata={"token_usage": {"prompt_tokens": 100, "completion_tokens": 50}})
    in_t, out_t, tot_t = extract_tokens(msg, 10, 10)
    assert in_t == 100
    assert out_t == 50
    assert tot_t == 150

def test_extract_tokens_fallback():
    msg = AIMessage(content="test")
    in_t, out_t, tot_t = extract_tokens(msg, 10, 5)
    assert in_t == 10
    assert out_t == 5
    assert tot_t == 15

def test_record_llm_call():
    record_llm_call(
        analysis_id="123", agent_name="TestAgent", model="test-model",
        attempt=1, input_tokens=100, output_tokens=50, total_tokens=150,
        latency_ms=1200, status="SUCCESS", retry_count=0, context_compacted=False
    )
    
    metrics = get_metrics_for_analysis("123")
    assert len(metrics) == 1
    assert metrics[0]["agent_name"] == "TestAgent"
    assert metrics[0]["status"] == "SUCCESS"
    assert metrics[0]["latency_ms"] == 1200

def test_pop_metrics():
    record_llm_call("123", "A", "M", 1, 1, 1, 2, 1, "SUCCESS", 0, False)
    assert len(get_metrics_for_analysis("123")) == 1
    popped = pop_metrics_for_analysis("123")
    assert len(popped) == 1
    assert len(get_metrics_for_analysis("123")) == 0

@patch("llm.metrics.get_settings")
def test_calculate_cost(mock_get_settings):
    settings = MagicMock()
    settings.input_price_per_1m_tokens = 0.50
    settings.output_price_per_1m_tokens = 1.50
    mock_get_settings.return_value = settings
    
    cost = calculate_cost(1_000_000, 2_000_000)
    assert cost == 3.50

@patch("llm.metrics.get_settings")
def test_calculate_cost_missing_pricing(mock_get_settings):
    settings = MagicMock()
    settings.input_price_per_1m_tokens = None
    settings.output_price_per_1m_tokens = None
    mock_get_settings.return_value = settings
    
    cost = calculate_cost(1_000_000, 2_000_000)
    assert cost is None

def test_aggregate_workflow_metrics():
    record_llm_call("123", "A1", "M", 1, 100, 50, 150, 1000, "RETRY", 0, True)
    record_llm_call("123", "A1", "M", 2, 100, 50, 150, 2000, "SUCCESS", 1, False)
    record_llm_call("123", "A2", "M", 1, 200, 100, 300, 1500, "SUCCESS", 0, False)
    
    summary = aggregate_workflow_metrics("123")
    assert summary["total_calls"] == 3
    assert summary["successful_calls"] == 2
    assert summary["failed_calls"] == 1
    assert summary["total_retries"] == 1
    assert summary["total_input_tokens"] == 400
    assert summary["total_output_tokens"] == 200
    assert summary["total_tokens"] == 600
    assert summary["total_latency_ms"] == 4500
    assert summary["average_latency_ms"] == 1500
    assert summary["context_compactions"] == 1

def test_aggregate_empty_workflow():
    summary = aggregate_workflow_metrics("empty")
    assert summary["total_calls"] == 0
    assert summary["successful_calls"] == 0

@patch("llm.retry.time.sleep")
def test_invoke_with_retry_metrics_success(mock_sleep):
    def fake_llm(msgs):
        return AIMessage(content="success", response_metadata={"token_usage": {"prompt_tokens": 10, "completion_tokens": 5}})
        
    invoke_with_retry(fake_llm, [HumanMessage(content="hi")], "TestAgent", "test_id")
    metrics = get_metrics_for_analysis("test_id")
    
    assert len(metrics) == 1
    assert metrics[0]["status"] == "SUCCESS"
    assert metrics[0]["input_tokens"] == 10
    assert metrics[0]["output_tokens"] == 5

@patch("llm.retry.time.sleep")
def test_invoke_with_retry_metrics_failure(mock_sleep):
    call_count = 0
    def fake_llm(msgs):
        nonlocal call_count
        call_count += 1
        raise groq.APIStatusError("Rate limit", response=MagicMock(status_code=429), body=None)
        
    with pytest.raises(LLMServiceException):
        invoke_with_retry(fake_llm, [HumanMessage(content="hi")], "TestAgent", "test_id")
        
    metrics = get_metrics_for_analysis("test_id")
    assert len(metrics) == 4 # 3 retries + initial = 4 attempts
    assert metrics[0]["status"] == "RETRY"
    assert metrics[3]["status"] == "FAILED"

@patch("llm.retry.time.sleep")
def test_invoke_with_retry_metrics_413_compaction(mock_sleep):
    call_count = 0
    def fake_llm(msgs):
        nonlocal call_count
        call_count += 1
        if call_count == 1:
            raise groq.APIStatusError("Too large", response=MagicMock(status_code=413), body=None)
        return AIMessage(content="success")
        
    def compactor(msgs, limit):
        return msgs
        
    invoke_with_retry(fake_llm, [HumanMessage(content="hi")], "TestAgent", "test_id", context_compactor=compactor)
    
    metrics = get_metrics_for_analysis("test_id")
    assert len(metrics) == 2
    assert metrics[0]["status"] == "RETRY"
    assert metrics[0]["context_compacted"] is True
    assert metrics[1]["status"] == "SUCCESS"
