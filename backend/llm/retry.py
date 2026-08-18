"""
retry.py - Centralized LLM Retry Service

Provides invoke_with_retry for handling LLM provider failures gracefully.
Implements exponential backoff and context compaction for 413 requests.
"""

import asyncio
import logging
import time
from typing import Any, Callable

from langchain_core.messages import AIMessage
import groq

from config.settings import get_settings
from api.exceptions import LLMServiceException
from llm.metrics import extract_tokens, record_llm_call

logger = logging.getLogger(__name__)

# Conservative approximation of tokens to characters (e.g., 4 chars per token)
CHARS_PER_TOKEN = 4

def _estimate_tokens(messages: list[Any]) -> int:
    """Roughly estimate the number of tokens in the messages."""
    total_chars = 0
    for msg in messages:
        if hasattr(msg, "content") and isinstance(msg.content, str):
            total_chars += len(msg.content)
    return total_chars // CHARS_PER_TOKEN


def invoke_with_retry(
    llm_callable: Callable,
    messages: list[Any],
    agent_name: str,
    analysis_id: str = "unknown",
    context_compactor: Callable[[list[Any], int], list[Any]] = None
) -> AIMessage:
    """
    Invoke an LLM with retry logic and context compaction.

    Args:
        llm_callable: A callable (e.g. llm.invoke) that accepts messages and returns AIMessage.
        messages: The initial messages to send to the LLM.
        agent_name: The name of the agent calling this, for logging.
        context_compactor: Optional callback to compact messages on 413 errors.

    Returns:
        AIMessage: The successful LLM response.

    Raises:
        LLMServiceException: If retries are exhausted or a non-retryable error occurs.
    """
    settings = get_settings()
    max_retries = settings.llm_max_retries
    base_delay = settings.llm_retry_base_delay_seconds
    max_delay = settings.llm_retry_max_delay_seconds
    target_tokens = settings.llm_context_target_tokens
    
    attempts = 0
    total_allowed_attempts = max_retries + 1
    
    current_messages = messages

    while attempts < total_allowed_attempts:
        attempts += 1
        est_tokens = _estimate_tokens(current_messages)
        
        try:
            # We don't log secrets, just metadata.
            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | Estimated input tokens: {est_tokens}"
            )
            
            start_time = time.time()
            response = llm_callable(current_messages)
            latency_ms = int((time.time() - start_time) * 1000)
            
            out_est_tokens = len(response.content) // CHARS_PER_TOKEN if hasattr(response, "content") else 0
            
            in_tokens, out_tokens, total_tokens = extract_tokens(response, est_tokens, out_est_tokens)
            
            record_llm_call(
                analysis_id=analysis_id,
                agent_name=agent_name,
                model=settings.groq_model,
                attempt=attempts,
                input_tokens=in_tokens,
                output_tokens=out_tokens,
                total_tokens=total_tokens,
                latency_ms=latency_ms,
                status="SUCCESS",
                retry_count=attempts - 1,
                context_compacted=False,
                error_type=None
            )
            
            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | Status: SUCCESS | "
                f"Latency: {latency_ms}ms | Actual total tokens: {total_tokens}"
            )
            return response
            
        except groq.APIStatusError as e:
            status_code = e.status_code
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            
            # Non-retryable HTTP errors (Auth, invalid request, unsupported model, etc)
            if status_code in (400, 401, 403, 404):
                logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: {status_code} | Action: ABORT")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type=str(status_code)
                )
                raise LLMServiceException(f"Non-retryable LLM provider error: {e}") from e

            # 413 Context Too Large
            if status_code == 413:
                logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: 413 | Action: compact_context")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                    context_compacted=True, error_type="413"
                )
                
                if not context_compactor:
                    # Can't compact, immediately abort.
                    raise LLMServiceException("Request too large and no context compactor provided.") from e
                
                # Compact the payload
                try:
                    current_messages = context_compactor(current_messages, target_tokens * CHARS_PER_TOKEN)
                except Exception as comp_e:
                    logger.error(f"Agent: {agent_name} | Compaction failed: {comp_e}")
                    raise LLMServiceException("Failed to compact LLM context.") from comp_e
                
                # Apply standard backoff even for 413 to prevent spamming
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    time.sleep(delay)
                continue

            # Transient errors (429 Rate Limit, 500, 502, 503, 504)
            if status_code == 429 or status_code >= 500:
                logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: {status_code} | Action: RETRY")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY" if attempts < total_allowed_attempts else "FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type=str(status_code)
                )
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    time.sleep(delay)
                continue

            # Fallback for unexpected status codes
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type=str(status_code)
            )
            raise LLMServiceException(f"Unexpected LLM API status: {status_code}") from e
            
        except (groq.APIConnectionError, groq.APITimeoutError) as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: NETWORK_ERROR | Action: RETRY")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                context_compacted=False, error_type="NETWORK_ERROR"
            )
            delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
            if attempts < total_allowed_attempts:
                time.sleep(delay)
            continue
            
        except groq.GroqError as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            # Any other base GroqError
            logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: UNKNOWN_GROQ_ERROR | Action: ABORT")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNKNOWN_GROQ_ERROR"
            )
            raise LLMServiceException(f"LLM provider error: {e}") from e
            
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            # Completely unexpected (e.g. parsing, LangChain internal)
            logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: UNEXPECTED_EXCEPTION | Action: ABORT")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNEXPECTED_EXCEPTION"
            )
            raise LLMServiceException(f"Unexpected LLM invocation error: {e}") from e

    # Exhausted retries
    raise LLMServiceException(f"Exhausted {max_retries} retries for LLM invocation.")

async def ainvoke_with_retry(
    llm_callable: Callable,
    messages: list[Any],
    agent_name: str,
    analysis_id: str = "unknown",
    context_compactor: Callable[[list[Any], int], list[Any]] = None
) -> AIMessage:
    """Async version of invoke_with_retry."""
    settings = get_settings()
    max_retries = settings.llm_max_retries
    base_delay = settings.llm_retry_base_delay_seconds
    max_delay = settings.llm_retry_max_delay_seconds
    target_tokens = settings.llm_context_target_tokens
    
    attempts = 0
    total_allowed_attempts = max_retries + 1
    
    current_messages = messages

    while attempts < total_allowed_attempts:
        attempts += 1
        est_tokens = _estimate_tokens(current_messages)
        
        try:
            logger.info(f"Agent: {agent_name} | Attempt: {attempts} | Estimated input tokens: {est_tokens}")
            
            start_time = time.time()
            response = await llm_callable(current_messages)
            latency_ms = int((time.time() - start_time) * 1000)
            
            out_est_tokens = len(response.content) // CHARS_PER_TOKEN if hasattr(response, "content") else 0
            
            in_tokens, out_tokens, total_tokens = extract_tokens(response, est_tokens, out_est_tokens)
            
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=in_tokens, output_tokens=out_tokens, total_tokens=total_tokens,
                latency_ms=latency_ms, status="SUCCESS", retry_count=attempts - 1,
                context_compacted=False, error_type=None
            )
            
            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | Status: SUCCESS | "
                f"Latency: {latency_ms}ms | Actual output tokens: {out_tokens}"
            )
            return response
            
        except groq.APIStatusError as e:
            status_code = e.status_code
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            
            if status_code in (400, 401, 403, 404):
                logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: {status_code} | Action: ABORT")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type=str(status_code)
                )
                raise LLMServiceException(f"Non-retryable LLM provider error: {e}") from e

            if status_code == 413:
                logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: 413 | Action: compact_context")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                    context_compacted=True, error_type="413"
                )
                if not context_compactor:
                    raise LLMServiceException("Request too large and no context compactor provided.") from e
                
                try:
                    current_messages = context_compactor(current_messages, target_tokens * CHARS_PER_TOKEN)
                except Exception as comp_e:
                    logger.error(f"Agent: {agent_name} | Compaction failed: {comp_e}")
                    raise LLMServiceException("Failed to compact LLM context.") from comp_e
                
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    await asyncio.sleep(delay)
                continue

            if status_code == 429 or status_code >= 500:
                logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: {status_code} | Action: RETRY")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                    attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY" if attempts < total_allowed_attempts else "FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type=str(status_code)
                )
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    await asyncio.sleep(delay)
                continue

            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type=str(status_code)
            )
            raise LLMServiceException(f"Unexpected LLM API status: {status_code}") from e
            
        except (groq.APIConnectionError, groq.APITimeoutError) as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            logger.warning(f"Agent: {agent_name} | Attempt: {attempts} | Status: NETWORK_ERROR | Action: RETRY")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                context_compacted=False, error_type="NETWORK_ERROR"
            )
            delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
            if attempts < total_allowed_attempts:
                await asyncio.sleep(delay)
            continue
            
        except groq.GroqError as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: UNKNOWN_GROQ_ERROR | Action: ABORT")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNKNOWN_GROQ_ERROR"
            )
            raise LLMServiceException(f"LLM provider error: {e}") from e
            
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000) if 'start_time' in locals() else 0
            logger.error(f"Agent: {agent_name} | Attempt: {attempts} | Status: UNEXPECTED_EXCEPTION | Action: ABORT")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name, model=settings.groq_model,
                attempt=attempts, input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNEXPECTED_EXCEPTION"
            )
            raise LLMServiceException(f"Unexpected LLM invocation error: {e}") from e

    raise LLMServiceException(f"Exhausted {max_retries} retries for LLM invocation.")
