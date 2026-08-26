"""
retry.py - Centralized LLM Retry Service

Provides invoke_with_retry / ainvoke_with_retry for handling LLM provider
failures gracefully.  Implements exponential backoff and context compaction
for context-too-large errors.

Provider-agnostic design: works with AWS Bedrock (ChatBedrockConverse),
Groq (ChatGroq), or any other LangChain chat model.

Error classification (HTTP status codes, normalised across providers):
  400, 401, 403, 404  → non-retryable, abort immediately
  413 / context-too-large → compact context, then retry
  429, 5xx            → transient, retry with backoff
  all others          → abort
"""

import asyncio
import logging
import time
from typing import Any, Callable, Optional

from langchain_core.messages import AIMessage

from config.settings import get_settings
from api.exceptions import LLMServiceException
from llm.metrics import extract_tokens, record_llm_call

logger = logging.getLogger(__name__)

# Conservative approximation of tokens to characters (e.g., 4 chars per token)
CHARS_PER_TOKEN = 4


# ---------------------------------------------------------------------------
# Provider-agnostic error introspection helpers
# ---------------------------------------------------------------------------

def _http_status_from_exception(exc: Exception) -> Optional[int]:
    """Extract an HTTP status code from any provider exception.

    Supports:
      - groq.APIStatusError          (.status_code)
      - botocore.exceptions.*        (.response["ResponseMetadata"]["HTTPStatusCode"])
      - Generic exceptions with .status_code attribute
    """
    # Direct .status_code attribute (Groq, OpenAI, httpx-based providers)
    if hasattr(exc, "status_code"):
        try:
            return int(exc.status_code)  # type: ignore[attr-defined]
        except (TypeError, ValueError):
            pass

    # botocore ClientError / EndpointResolutionError
    if hasattr(exc, "response") and isinstance(exc.response, dict):  # type: ignore[attr-defined]
        metadata = exc.response.get("ResponseMetadata", {})  # type: ignore[attr-defined]
        status = metadata.get("HTTPStatusCode")
        if status is not None:
            try:
                return int(status)
            except (TypeError, ValueError):
                pass

    return None


def _is_context_too_large(exc: Exception) -> bool:
    """Return True if the exception indicates the context window was exceeded."""
    msg = str(exc).lower()

    # Groq: HTTP 413
    status = _http_status_from_exception(exc)
    if status == 413:
        return True

    # Bedrock / Anthropic error codes
    if hasattr(exc, "response") and isinstance(exc.response, dict):  # type: ignore[attr-defined]
        error_body = exc.response.get("Error", {})  # type: ignore[attr-defined]
        code = error_body.get("Code", "")
        if code in ("ValidationException",):
            # Anthropic on Bedrock raises ValidationException with a specific message
            if "too many tokens" in msg or "max tokens" in msg or "context" in msg:
                return True

    # Generic string matching fallback
    return any(
        phrase in msg
        for phrase in (
            "too many tokens",
            "context length",
            "context window",
            "maximum context",
            "prompt is too long",
            "request too large",
            "input length",
        )
    )


def _is_transient(exc: Exception) -> bool:
    """Return True for rate limits and transient server errors."""
    status = _http_status_from_exception(exc)
    if status is not None:
        return status == 429 or status >= 500

    msg = str(exc).lower()
    return any(
        phrase in msg
        for phrase in (
            "throttlingexception",
            "rate limit",
            "too many requests",
            "service unavailable",
            "internal server error",
            "request timeout",
            "modelnotreadyexception",
            "modelerrorexception",
        )
    )


def _is_non_retryable(exc: Exception) -> bool:
    """Return True for auth / bad-request errors that will never succeed on retry."""
    status = _http_status_from_exception(exc)
    if status is not None:
        return status in (400, 401, 403, 404)

    msg = str(exc).lower()
    return any(
        phrase in msg
        for phrase in (
            "accessdeniedexception",
            "authorizationexception",
            "invalid api key",
            "unauthorized",
            "nosuchmodel",
        )
    )


# ---------------------------------------------------------------------------
# Token estimation
# ---------------------------------------------------------------------------

def _estimate_tokens(messages: list[Any]) -> int:
    """Roughly estimate the number of tokens in the messages."""
    total_chars = 0
    for msg in messages:
        if hasattr(msg, "content") and isinstance(msg.content, str):
            total_chars += len(msg.content)
    return total_chars // CHARS_PER_TOKEN


# ---------------------------------------------------------------------------
# Synchronous retry
# ---------------------------------------------------------------------------

def invoke_with_retry(
    llm_callable: Callable,
    messages: list[Any],
    agent_name: str,
    analysis_id: str = "unknown",
    context_compactor: Callable[[list[Any], int], list[Any]] = None
) -> AIMessage:
    """
    Invoke an LLM with retry logic and context compaction.

    Provider-agnostic: works with AWS Bedrock, Groq, or any LangChain model.

    Args:
        llm_callable: A callable (e.g. llm.invoke) that accepts messages.
        messages: The initial messages to send to the LLM.
        agent_name: Name of the calling agent (for logging and metrics).
        analysis_id: UUID of the current analysis (for metrics correlation).
        context_compactor: Optional callback to compact messages on context overflow.

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
        start_time = None

        try:
            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | "
                f"Estimated input tokens: {est_tokens}"
            )

            start_time = time.time()
            response = llm_callable(current_messages)
            latency_ms = int((time.time() - start_time) * 1000)

            out_est = len(response.content) // CHARS_PER_TOKEN if hasattr(response, "content") else 0
            in_tokens, out_tokens, total_tokens = extract_tokens(response, est_tokens, out_est)

            record_llm_call(
                analysis_id=analysis_id,
                agent_name=agent_name,
                model=_active_model_id(settings),
                attempt=attempts,
                input_tokens=in_tokens,
                output_tokens=out_tokens,
                total_tokens=total_tokens,
                latency_ms=latency_ms,
                status="SUCCESS",
                retry_count=attempts - 1,
                context_compacted=False,
                error_type=None,
            )

            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | Status: SUCCESS | "
                f"Latency: {latency_ms}ms | Tokens: {total_tokens}"
            )
            return response

        except Exception as exc:
            latency_ms = int((time.time() - start_time) * 1000) if start_time else 0

            # --- Non-retryable (auth, bad request) ---
            if _is_non_retryable(exc):
                logger.error(
                    f"Agent: {agent_name} | Attempt: {attempts} | "
                    f"NON_RETRYABLE: {exc}"
                )
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type="NON_RETRYABLE",
                )
                raise LLMServiceException(f"Non-retryable LLM error: {exc}") from exc

            # --- Context too large (413 / token limit) ---
            if _is_context_too_large(exc):
                logger.warning(
                    f"Agent: {agent_name} | Attempt: {attempts} | "
                    f"CONTEXT_OVERFLOW — compacting context."
                )
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                    context_compacted=True, error_type="CONTEXT_OVERFLOW",
                )
                if not context_compactor:
                    raise LLMServiceException(
                        "Request too large and no context compactor provided."
                    ) from exc
                try:
                    current_messages = context_compactor(
                        current_messages, target_tokens * CHARS_PER_TOKEN
                    )
                except Exception as comp_exc:
                    raise LLMServiceException("Failed to compact LLM context.") from comp_exc

                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    time.sleep(delay)
                continue

            # --- Transient (rate limit, 5xx) ---
            if _is_transient(exc):
                is_last = attempts >= total_allowed_attempts
                logger.warning(
                    f"Agent: {agent_name} | Attempt: {attempts} | "
                    f"TRANSIENT: {exc}"
                )
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms,
                    status="FAILED" if is_last else "RETRY",
                    retry_count=attempts - 1,
                    context_compacted=False, error_type="TRANSIENT",
                )
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if not is_last:
                    time.sleep(delay)
                continue

            # --- Unknown exception ---
            logger.error(
                f"Agent: {agent_name} | Attempt: {attempts} | "
                f"UNEXPECTED: {type(exc).__name__}: {exc}"
            )
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name,
                model=_active_model_id(settings), attempt=attempts,
                input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNEXPECTED",
            )
            raise LLMServiceException(f"Unexpected LLM invocation error: {exc}") from exc

    raise LLMServiceException(f"Exhausted {max_retries} retries for LLM invocation.")


# ---------------------------------------------------------------------------
# Async retry
# ---------------------------------------------------------------------------

async def ainvoke_with_retry(
    llm_callable: Callable,
    messages: list[Any],
    agent_name: str,
    analysis_id: str = "unknown",
    context_compactor: Callable[[list[Any], int], list[Any]] = None
) -> AIMessage:
    """Async version of invoke_with_retry. Same logic, awaits the LLM callable."""
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
        start_time = None

        try:
            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | "
                f"Estimated input tokens: {est_tokens}"
            )

            start_time = time.time()
            response = await llm_callable(current_messages)
            latency_ms = int((time.time() - start_time) * 1000)

            out_est = len(response.content) // CHARS_PER_TOKEN if hasattr(response, "content") else 0
            in_tokens, out_tokens, total_tokens = extract_tokens(response, est_tokens, out_est)

            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name,
                model=_active_model_id(settings), attempt=attempts,
                input_tokens=in_tokens, output_tokens=out_tokens, total_tokens=total_tokens,
                latency_ms=latency_ms, status="SUCCESS", retry_count=attempts - 1,
                context_compacted=False, error_type=None,
            )

            logger.info(
                f"Agent: {agent_name} | Attempt: {attempts} | Status: SUCCESS | "
                f"Latency: {latency_ms}ms | Tokens: {total_tokens}"
            )
            return response

        except Exception as exc:
            latency_ms = int((time.time() - start_time) * 1000) if start_time else 0

            if _is_non_retryable(exc):
                logger.error(f"Agent: {agent_name} | NON_RETRYABLE: {exc}")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                    context_compacted=False, error_type="NON_RETRYABLE",
                )
                raise LLMServiceException(f"Non-retryable LLM error: {exc}") from exc

            if _is_context_too_large(exc):
                logger.warning(f"Agent: {agent_name} | CONTEXT_OVERFLOW — compacting.")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms, status="RETRY", retry_count=attempts - 1,
                    context_compacted=True, error_type="CONTEXT_OVERFLOW",
                )
                if not context_compactor:
                    raise LLMServiceException("Request too large and no context compactor.") from exc
                try:
                    current_messages = context_compactor(
                        current_messages, target_tokens * CHARS_PER_TOKEN
                    )
                except Exception as comp_exc:
                    raise LLMServiceException("Failed to compact LLM context.") from comp_exc
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if attempts < total_allowed_attempts:
                    await asyncio.sleep(delay)
                continue

            if _is_transient(exc):
                is_last = attempts >= total_allowed_attempts
                logger.warning(f"Agent: {agent_name} | TRANSIENT: {exc}")
                record_llm_call(
                    analysis_id=analysis_id, agent_name=agent_name,
                    model=_active_model_id(settings), attempt=attempts,
                    input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                    latency_ms=latency_ms,
                    status="FAILED" if is_last else "RETRY",
                    retry_count=attempts - 1,
                    context_compacted=False, error_type="TRANSIENT",
                )
                delay = min(base_delay * (2 ** (attempts - 1)), max_delay)
                if not is_last:
                    await asyncio.sleep(delay)
                continue

            logger.error(f"Agent: {agent_name} | UNEXPECTED: {type(exc).__name__}: {exc}")
            record_llm_call(
                analysis_id=analysis_id, agent_name=agent_name,
                model=_active_model_id(settings), attempt=attempts,
                input_tokens=est_tokens, output_tokens=0, total_tokens=est_tokens,
                latency_ms=latency_ms, status="FAILED", retry_count=attempts - 1,
                context_compacted=False, error_type="UNEXPECTED",
            )
            raise LLMServiceException(f"Unexpected LLM invocation error: {exc}") from exc

    raise LLMServiceException(f"Exhausted {max_retries} retries for LLM invocation.")


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _active_model_id(settings) -> str:
    """Return the currently configured model identifier for metrics logging."""
    provider = (settings.llm_provider or "bedrock").lower()
    if provider == "bedrock":
        return settings.bedrock_model_id
    return settings.groq_model or "unknown"
