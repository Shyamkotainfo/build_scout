"""
test_prompt_optimizer.py — Unit tests for the PromptOptimizer service.

All LLM calls are mocked. No live Groq API key is required.

Coverage:
  1.  Clear, explicit request — LLM called, result used.
  2.  Vague request — LLM called, intent=UNKNOWN acceptable.
  3.  Explicit AWS constraint — captured in constraints[].
  4.  Explicit technology constraint (Python) — captured in known_technologies[].
  5.  Multiple requirements — all captured.
  6.  No hallucinated technologies — known_technologies[] must only contain stated tech.
  7.  Empty / invalid JSON from LLM — fallback to original request.
  8.  LLM invocation raises exception — fallback to original request.
  9.  Retry behavior — invoke_with_retry is used (not a raw LLM call).
  10. Original request preserved in fallback result.
  11. Optimized request stored in normalized_request via analyze().
  12. Token/latency metrics recorded when LLM is called.
"""

import json
from unittest.mock import MagicMock, patch

import pytest
from langchain_core.messages import AIMessage

from services.prompt_optimizer import (
    PromptOptimizer,
    PromptOptimizationResult,
    _coerce_list,
    _coerce_float,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_ai_message(data: dict) -> AIMessage:
    """Return a fake AIMessage whose content is the JSON-serialized data dict."""
    return AIMessage(content=json.dumps(data))


def _llm_response(
    intent: str = "BUILD",
    objective: str = "Build something",
    optimized_request: str = "Build something useful.",
    requirements: list | None = None,
    constraints: list | None = None,
    known_technologies: list | None = None,
    missing_information: list | None = None,
    confidence: float = 0.9,
) -> AIMessage:
    return _make_ai_message({
        "intent": intent,
        "objective": objective,
        "optimized_request": optimized_request,
        "requirements": requirements or [],
        "constraints": constraints or [],
        "known_technologies": known_technologies or [],
        "missing_information": missing_information or [],
        "confidence": confidence,
    })


# ---------------------------------------------------------------------------
# 1. Clear, explicit request
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_clear_request_llm_is_called(mock_retry):
    """A clear request causes an LLM call and the result is used."""
    mock_retry.return_value = _llm_response(
        intent="BUILD",
        objective="Build an AI document intelligence platform",
        optimized_request="Build an AI document intelligence platform.",
        requirements=["AI document intelligence"],
        constraints=[],
        known_technologies=[],
        confidence=0.95,
    )
    optimizer = PromptOptimizer()
    result = optimizer.optimize("Build an AI document intelligence platform.")

    assert mock_retry.called
    assert result.optimization_applied is True
    assert result.intent == "BUILD"
    assert result.confidence == pytest.approx(0.95)
    assert result.optimized_request == "Build an AI document intelligence platform."
    assert result.original_request == "Build an AI document intelligence platform."
    assert "AI document intelligence" in result.requirements


# ---------------------------------------------------------------------------
# 2. Vague request
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_vague_request_llm_is_called(mock_retry):
    """A vague request is processed; intent may be UNKNOWN or BUILD."""
    mock_retry.return_value = _llm_response(
        intent="UNKNOWN",
        objective="Unknown AI system",
        optimized_request="Build some kind of AI thing.",
        requirements=["AI system"],
        confidence=0.4,
    )
    result = PromptOptimizer().optimize("I want some AI thing.")

    assert mock_retry.called
    assert result.optimization_applied is True
    assert result.intent in ("BUILD", "UNKNOWN")
    assert result.original_request == "I want some AI thing."


# ---------------------------------------------------------------------------
# 3. Explicit AWS constraint
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_explicit_aws_constraint_captured(mock_retry):
    """AWS constraint explicitly stated by the user is captured."""
    mock_retry.return_value = _llm_response(
        intent="BUILD",
        constraints=["AWS"],
        known_technologies=["AWS", "React"],
        optimized_request="Build an AI support assistant on AWS with React.",
        requirements=["AI customer support assistant"],
    )
    result = PromptOptimizer().optimize(
        "Build an AI support assistant using AWS and React."
    )

    assert "AWS" in result.constraints
    assert "AWS" in result.known_technologies
    assert "React" in result.known_technologies


# ---------------------------------------------------------------------------
# 4. Explicit technology constraint
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_explicit_python_constraint_captured(mock_retry):
    """Python explicitly stated is captured in known_technologies."""
    mock_retry.return_value = _llm_response(
        constraints=["Python"],
        known_technologies=["Python"],
        optimized_request="Build a Python data processing pipeline.",
    )
    result = PromptOptimizer().optimize(
        "Build a data processing pipeline using Python."
    )
    assert "Python" in result.known_technologies


# ---------------------------------------------------------------------------
# 5. Multiple requirements
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_multiple_requirements_all_captured(mock_retry):
    """All explicitly stated requirements are captured, not a subset."""
    requirements = ["document ingestion", "OCR", "vector search", "LLM Q&A"]
    mock_retry.return_value = _llm_response(
        requirements=requirements,
        optimized_request="Build an AI document platform with OCR and vector search.",
    )
    result = PromptOptimizer().optimize(
        "I need document ingestion, OCR, vector search, and LLM Q&A capabilities."
    )
    for req in requirements:
        assert req in result.requirements


# ---------------------------------------------------------------------------
# 6. No hallucinated technologies
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_no_hallucinated_technologies(mock_retry):
    """When user says 'AI chatbot' with no tech, known_technologies must be empty."""
    mock_retry.return_value = _llm_response(
        intent="BUILD",
        requirements=["AI chatbot"],
        constraints=[],
        known_technologies=[],  # LLM must not inject AWS, React, etc.
        optimized_request="Build an AI chatbot.",
        confidence=0.8,
    )
    result = PromptOptimizer().optimize("I want an AI chatbot.")

    assert result.known_technologies == []
    assert result.constraints == []
    # Ensure hallucinated tech did not sneak in
    hallucinated = {"AWS", "Azure", "GCP", "React", "PostgreSQL", "Redis", "Kubernetes", "RAG"}
    for tech in hallucinated:
        assert tech not in result.known_technologies
        assert tech not in result.constraints


# ---------------------------------------------------------------------------
# 7. Empty / invalid JSON from LLM — fallback
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_invalid_json_from_llm_uses_fallback(mock_retry):
    """If LLM returns non-JSON content, the fallback result is used."""
    mock_retry.return_value = AIMessage(content="This is not JSON at all.")
    result = PromptOptimizer().optimize("Build something.")

    assert result.optimization_applied is False
    assert result.optimized_request == "Build something."
    assert result.original_request == "Build something."
    assert result.intent == "UNKNOWN"
    assert result.confidence == 0.0


# ---------------------------------------------------------------------------
# 8. LLM raises an exception — fallback
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_llm_exception_uses_fallback(mock_retry):
    """If invoke_with_retry raises, the fallback result preserves the original."""
    mock_retry.side_effect = RuntimeError("Groq rate limit exceeded")
    result = PromptOptimizer().optimize("Build a recommendation engine.", analysis_id="test-123")

    assert result.optimization_applied is False
    assert result.original_request == "Build a recommendation engine."
    assert result.optimized_request == "Build a recommendation engine."
    assert result.intent == "UNKNOWN"


# ---------------------------------------------------------------------------
# 9. invoke_with_retry is used — not a raw LLM call
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_uses_centralized_retry_service(mock_retry):
    """PromptOptimizer must use invoke_with_retry, not call the LLM directly."""
    mock_retry.return_value = _llm_response()
    PromptOptimizer().optimize("Build a search engine.", analysis_id="abc-123")

    assert mock_retry.called
    call_kwargs = mock_retry.call_args
    # agent_name must identify this as PromptOptimizer for metrics
    assert call_kwargs.kwargs.get("agent_name") == "PromptOptimizer" or \
           (call_kwargs.args and "PromptOptimizer" in str(call_kwargs))


# ---------------------------------------------------------------------------
# 10. Original request preserved in fallback
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_original_request_always_preserved(mock_retry):
    """original_request must always equal the input, even on fallback."""
    raw = "Build an ML pipeline for anomaly detection."

    # Success case
    mock_retry.return_value = _llm_response(optimized_request="Build ML anomaly detection pipeline.")
    result_ok = PromptOptimizer().optimize(raw)
    assert result_ok.original_request == raw

    # Failure case
    mock_retry.side_effect = Exception("network error")
    result_fail = PromptOptimizer().optimize(raw)
    assert result_fail.original_request == raw


# ---------------------------------------------------------------------------
# 11. Optimized request populates normalized_request in analyze()
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
@patch("services.analysis_service.build_buildsmart_graph")
def test_optimized_request_stored_in_state(mock_graph, mock_retry):
    """analyze() puts the optimized_request into state['normalized_request']."""
    optimized = "Build a scalable NLP pipeline in Python."
    mock_retry.return_value = _llm_response(
        optimized_request=optimized,
    )

    # Capture the state that graph.invoke() receives
    captured_state = {}

    def fake_invoke(state):
        captured_state.update(state)
        # Return a minimal valid state
        return {
            **state,
            "status": "VALIDATED",
            "execution_plan": [],
            "requirements": [],
            "components": [],
            "candidates": [],
            "evaluations": [],
            "decisions": [],
            "blueprint": {},
            "validation_result": {},
            "agent_history": [],
            "current_agent": "ValidationAgent",
            "retry_count": 0,
            "normalized_request": state.get("normalized_request", ""),
            "domain": "",
        }
    mock_graph.return_value.stream.side_effect = lambda state: [{"ValidationAgent": fake_invoke(state)}]

    from services.analysis_service import run_analysis_background
    try:
        run_analysis_background("test_id", "Build an NLP pipeline in Python.")
    except Exception:
        pass  # DB not configured in unit tests

    # normalized_request in state must be the optimized version
    assert captured_state.get("normalized_request") == optimized


# ---------------------------------------------------------------------------
# 12. Metrics are recorded when LLM is called
# ---------------------------------------------------------------------------

@patch("services.prompt_optimizer.invoke_with_retry")
def test_analysis_id_passed_to_retry_for_metrics(mock_retry):
    """analysis_id is passed to invoke_with_retry so metrics are correlated."""
    mock_retry.return_value = _llm_response()
    analysis_id = "metrics-test-id-001"
    PromptOptimizer().optimize("Build something.", analysis_id=analysis_id)

    assert mock_retry.called
    call_kwargs = mock_retry.call_args
    assert call_kwargs.kwargs.get("analysis_id") == analysis_id or \
           analysis_id in str(call_kwargs)


# ---------------------------------------------------------------------------
# Helpers — unit tests
# ---------------------------------------------------------------------------

def test_coerce_list_with_valid_list():
    assert _coerce_list(["a", "b", "c"]) == ["a", "b", "c"]


def test_coerce_list_with_none():
    assert _coerce_list(None) == []


def test_coerce_list_with_non_list():
    assert _coerce_list("string") == []
    assert _coerce_list(42) == []


def test_coerce_float_valid():
    assert _coerce_float(0.85) == pytest.approx(0.85)


def test_coerce_float_clamps_above_one():
    assert _coerce_float(1.5) == pytest.approx(1.0)


def test_coerce_float_clamps_below_zero():
    assert _coerce_float(-0.1) == pytest.approx(0.0)


def test_coerce_float_invalid():
    assert _coerce_float("bad") == 0.0
    assert _coerce_float(None) == 0.0


def test_fallback_result_shape():
    result = PromptOptimizer._fallback_result("Hello world.")
    assert isinstance(result, PromptOptimizationResult)
    assert result.original_request == "Hello world."
    assert result.optimized_request == "Hello world."
    assert result.intent == "UNKNOWN"
    assert result.optimization_applied is False
    assert result.confidence == 0.0
    assert result.requirements == []
    assert result.constraints == []
    assert result.known_technologies == []
