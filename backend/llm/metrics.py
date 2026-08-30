"""
metrics.py - Centralized LLM Metrics Collector

Collects and stores LLM invocation metrics in-memory per analysis_id.
Provides functions to write separate Full Logs and Token Logs.
"""

import json
import logging
import logging.handlers
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
import os

from config.settings import get_settings

# In-memory storage of metrics during execution.
# Keys are analysis_id, values are lists of dicts containing the LLMCall data.
_metrics_store: Dict[str, List[Dict[str, Any]]] = {}

# Set up specific loggers
_full_logger = logging.getLogger("buildsmart_full")
_full_logger.setLevel(logging.INFO)
_token_logger = logging.getLogger("buildsmart_token")
_token_logger.setLevel(logging.INFO)

# A flag to ensure we only configure file handlers once
_loggers_configured = False


def _configure_loggers():
    global _loggers_configured
    if _loggers_configured:
        return
    
    settings = get_settings()
    
    # Configure Full Logger
    if settings.buildsmart_full_log_file:
        os.makedirs(os.path.dirname(settings.buildsmart_full_log_file), exist_ok=True)
        full_handler = logging.handlers.RotatingFileHandler(
            settings.buildsmart_full_log_file, maxBytes=10*1024*1024, backupCount=5
        )
        full_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        _full_logger.addHandler(full_handler)

    # Configure Token Logger (JSON Lines format)
    if settings.buildsmart_token_log_file:
        os.makedirs(os.path.dirname(settings.buildsmart_token_log_file), exist_ok=True)
        token_handler = logging.handlers.RotatingFileHandler(
            settings.buildsmart_token_log_file, maxBytes=10*1024*1024, backupCount=5
        )
        # Token log expects pure JSON strings, so simple formatter
        token_handler.setFormatter(logging.Formatter('%(message)s'))
        _token_logger.addHandler(token_handler)
        
    _loggers_configured = True


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def extract_tokens(response: Any, estimated_in: int, estimated_out: int) -> tuple[int, int, int]:
    """Extract actual tokens from AIMessage response_metadata if available, else fallback."""
    input_tokens = estimated_in
    output_tokens = estimated_out
    
    if hasattr(response, "response_metadata") and isinstance(response.response_metadata, dict):
        usage = response.response_metadata.get("token_usage", {})
        if usage:
            input_tokens = usage.get("prompt_tokens", input_tokens)
            output_tokens = usage.get("completion_tokens", output_tokens)
            
    total_tokens = input_tokens + output_tokens
    return input_tokens, output_tokens, total_tokens


def record_llm_call(
    analysis_id: str,
    agent_name: str,
    model: str,
    attempt: int,
    input_tokens: int,
    output_tokens: int,
    total_tokens: int,
    latency_ms: int,
    status: str,
    retry_count: int,
    context_compacted: bool,
    error_type: Optional[str] = None
) -> None:
    """Record a single LLM invocation attempt (success or failure) to memory and logs."""
    _configure_loggers()
    
    if analysis_id not in _metrics_store:
        _metrics_store[analysis_id] = []
        
    metric_record = {
        "analysis_id": str(analysis_id),
        "agent_name": str(agent_name),
        "model": str(model),
        "attempt": attempt,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "latency_ms": latency_ms,
        "status": str(status),
        "retry_count": retry_count,
        "context_compacted": bool(context_compacted),
        "error_type": str(error_type) if error_type else None,
        "created_at": _utcnow().isoformat()
    }
    
    _metrics_store[analysis_id].append(metric_record)
    
    # 1. Log to Token Log
    # Output raw JSON to token logger
    _token_logger.info(json.dumps({
        "timestamp": metric_record["created_at"],
        "analysis_id": str(analysis_id),
        "agent_name": str(agent_name),
        "model": str(model),
        "attempt": attempt,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "latency_ms": latency_ms,
        "retry_count": retry_count,
        "context_compacted": bool(context_compacted),
        "status": str(status),
        "error_type": str(error_type) if error_type else None
    }))
    
    # 2. Log to Full Log
    if status == "SUCCESS":
        _full_logger.info(
            f"LLM_CALL_SUCCESS agent={agent_name} attempt={attempt} "
            f"latency_ms={latency_ms} tokens={total_tokens}"
        )
    elif status == "RETRY":
        _full_logger.warning(
            f"LLM_CALL_RETRY agent={agent_name} attempt={attempt} "
            f"error={error_type}"
        )
    else:
        _full_logger.error(
            f"LLM_CALL_FAILED agent={agent_name} attempt={attempt} "
            f"status={status} error={error_type}"
        )


def log_full_event(event_type: str, **kwargs):
    """Log an arbitrary system event to the Full Log file."""
    _configure_loggers()
    # Format: EVENT_TYPE key1=val1 key2=val2
    msg_parts = [event_type]
    for k, v in kwargs.items():
        msg_parts.append(f"{k}={v}")
    _full_logger.info(" ".join(msg_parts))


def get_metrics_for_analysis(analysis_id: str) -> List[Dict[str, Any]]:
    """Retrieve all LLM metrics collected so far for the given analysis_id."""
    return _metrics_store.get(analysis_id, [])


def pop_metrics_for_analysis(analysis_id: str) -> List[Dict[str, Any]]:
    """Retrieve and delete LLM metrics for the given analysis_id to free memory."""
    return _metrics_store.pop(analysis_id, [])


def calculate_cost(input_tokens: int, output_tokens: int) -> Optional[float]:
    """Calculate USD cost based on configured pricing per 1M tokens."""
    settings = get_settings()
    if settings.input_price_per_1m_tokens is None or settings.output_price_per_1m_tokens is None:
        return None
        
    input_cost = (input_tokens / 1_000_000.0) * settings.input_price_per_1m_tokens
    output_cost = (output_tokens / 1_000_000.0) * settings.output_price_per_1m_tokens
    return round(input_cost + output_cost, 6)


def aggregate_workflow_metrics(analysis_id: str) -> Dict[str, Any]:
    """Calculate the final aggregated summary across all LLM calls for the workflow."""
    metrics = get_metrics_for_analysis(analysis_id)
    
    summary = {
        "total_calls": len(metrics),
        "successful_calls": 0,
        "failed_calls": 0,
        "total_retries": 0,
        "total_input_tokens": 0,
        "total_output_tokens": 0,
        "total_tokens": 0,
        "total_latency_ms": 0,
        "average_latency_ms": 0,
        "context_compactions": 0,
        "total_cost": None
    }
    
    if not metrics:
        return summary
        
    for m in metrics:
        if m["status"] == "SUCCESS":
            summary["successful_calls"] += 1
        else:
            summary["failed_calls"] += 1
            
        # Only add to total tokens if SUCCESS or if it's the final failed attempt to avoid double counting?
        # Actually, tokens are used per attempt, so we sum them up across all attempts.
        
        summary["total_retries"] += 1 if m["attempt"] > 1 else 0
        summary["total_input_tokens"] += m["input_tokens"]
        summary["total_output_tokens"] += m["output_tokens"]
        summary["total_tokens"] += m["total_tokens"]
        summary["total_latency_ms"] += m["latency_ms"]
        
        if m["context_compacted"]:
            summary["context_compactions"] += 1
            
    if summary["total_calls"] > 0:
        summary["average_latency_ms"] = int(summary["total_latency_ms"] / summary["total_calls"])
        
    summary["total_cost"] = calculate_cost(summary["total_input_tokens"], summary["total_output_tokens"])
    
    return summary
