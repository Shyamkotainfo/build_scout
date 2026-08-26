"""
prompt_optimizer.py — BuildSmart Lightweight Prompt Optimization Layer.

Runs BEFORE SupervisorAgent as a pre-processing service (not a LangGraph agent).

Strategy (Hybrid V1):
  1. Deterministic preprocessing — length clamping, whitespace normalization,
     trivial/empty request detection.
  2. One LLM optimization call — using the existing Groq client and the
     centralized retry service — only when the request needs clarification.
  3. Fallback — if the LLM call fails for any reason, the original request
     passes through unchanged. The workflow is never blocked.

Rules:
  - NEVER hallucinate requirements, technologies, or constraints.
  - Only capture what the user explicitly stated.
  - Preserve the original user_request unchanged in BuildSmartState.
  - Token usage flows automatically into the existing LLM metrics system.
  - Do not create another LLM client or retry implementation.

V2 Future (NOT implemented here):
  - Memory-augmented optimization (inject historical context).
  - Feedback-driven optimization (apply user preference signals).
  - Prompt versioning and A/B testing.
  - GEPA / DSPy automated prompt quality improvement.
  - Human feedback integration as optional context parameter.
"""

import json
from utils.json_helpers import extract_json
import logging
from typing import Optional

from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field, ValidationError

from llm.client import get_llm
from llm.retry import invoke_with_retry

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Maximum characters to send to the LLM optimizer. Keeps token usage low.
# Anything beyond this is truncated before sending (the original is preserved).
MAX_REQUEST_CHARS_FOR_LLM = 2000

# Requests shorter than this are almost certainly meaningful as-is and still
# benefit from the LLM extracting intent and constraints.
MIN_REQUEST_CHARS_FOR_LLM = 5

# ---------------------------------------------------------------------------
# Output contract
# ---------------------------------------------------------------------------

class PromptOptimizationResult(BaseModel):
    """Structured output of the Prompt Optimizer.

    All fields are optional / default to safe empty values so that a partial
    or failed LLM parse can still return a valid object.
    """

    original_request: str
    """The raw, unmodified user request. Always preserved."""

    optimized_request: str
    """Clearer, more structured version of the request. Falls back to
    original_request if optimization fails."""

    intent: str = "UNKNOWN"
    """High-level intent detected.
    One of: BUILD | MIGRATE | REPLACE | INTEGRATE | IMPROVE | EVALUATE | UNKNOWN
    """

    objective: str = ""
    """Concise one-sentence description of what the user wants to achieve."""

    requirements: list[str] = Field(default_factory=list)
    """Explicit requirements stated by the user. Never inferred."""

    constraints: list[str] = Field(default_factory=list)
    """Explicit constraints stated by the user (e.g. 'AWS', 'Python', 'MIT license')."""

    known_technologies: list[str] = Field(default_factory=list)
    """Technologies explicitly mentioned by the user."""

    missing_information: list[str] = Field(default_factory=list)
    """Information that would materially help BuildSmart but was not provided."""

    confidence: float = 0.0
    """Optimizer confidence score 0.0–1.0. 0.0 means fallback was used."""

    optimization_applied: bool = False
    """True if the LLM optimization call was made and succeeded."""


# ---------------------------------------------------------------------------
# System prompt — defined here to keep prompts.py clean
# ---------------------------------------------------------------------------

_OPTIMIZER_SYSTEM_PROMPT = """\
You are the BuildSmart Prompt Optimizer. Your job is to analyze a user's \
software request and extract structured information from it.

## CRITICAL RULES — read carefully before responding

1. NEVER invent, infer, or hallucinate requirements, technologies, or constraints.
   Only capture what the user explicitly stated.

2. If the user says "I want an AI chatbot" — do NOT infer AWS, React, PostgreSQL,
   Kubernetes, authentication, RAG, or any other technology unless they said it.

3. "known_technologies" must only contain technologies the user explicitly named.

4. "constraints" must only contain constraints the user explicitly stated.

5. "requirements" must only contain needs the user explicitly described.

6. "missing_information" should list information that would genuinely help
   BuildSmart analyze this request — but do NOT ask the user yet.

7. "intent" must be one of exactly: BUILD, MIGRATE, REPLACE, INTEGRATE,
   IMPROVE, EVALUATE, UNKNOWN.

8. "optimized_request" must be a clear, concise restatement of what the user
   said — not an expansion. Do not add assumptions.

9. "confidence" should reflect how clearly the user's request can be understood.
   Use a float between 0.0 and 1.0.

## Output format
Return ONLY valid JSON matching this exact schema — no markdown fences, \
no explanation, no prose:

{
  "intent": "<BUILD|MIGRATE|REPLACE|INTEGRATE|IMPROVE|EVALUATE|UNKNOWN>",
  "objective": "<one concise sentence>",
  "requirements": ["<explicit requirement 1>", ...],
  "constraints": ["<explicit constraint 1>", ...],
  "known_technologies": ["<tech 1>", ...],
  "missing_information": ["<item 1>", ...],
  "optimized_request": "<clearer version of the original request>",
  "confidence": <0.0–1.0>
}
"""


# ---------------------------------------------------------------------------
# PromptOptimizer
# ---------------------------------------------------------------------------

class PromptOptimizer:
    """Lightweight pre-processing service that improves a raw user request.

    Usage:
        optimizer = PromptOptimizer()
        result = optimizer.optimize(user_request, analysis_id=analysis_id)
        # result.optimized_request is fed into BuildSmartState
        # result.original_request is also stored in BuildSmartState unchanged
    """

    def __init__(self) -> None:
        self._llm = get_llm()

    def optimize(
        self,
        user_request: str,
        analysis_id: str = "unknown",
        # V2 placeholder: future optional context from Memory/Feedback
        feedback_context: Optional[str] = None,  # noqa: F841 — reserved for V2
    ) -> PromptOptimizationResult:
        """Optimize a user request using deterministic preprocessing + optional LLM call.

        Args:
            user_request: The raw user input string.
            analysis_id: UUID of the current analysis (for metrics correlation).
            feedback_context: Reserved for V2 human feedback integration.
                              Not used in V1. Supply as None.

        Returns:
            PromptOptimizationResult: Always returns a valid result.
            If the LLM call fails, falls back to a passthrough result.
        """
        # Step 1 — Deterministic preprocessing
        cleaned = self._preprocess(user_request)

        # Step 2 — Decide if LLM call is warranted
        if not self._needs_llm_optimization(cleaned):
            logger.info(
                f"PromptOptimizer | analysis_id={analysis_id} | "
                "Skipping LLM call (request too short or trivially empty)."
            )
            return self._fallback_result(user_request)

        # Step 3 — LLM optimization call
        try:
            return self._call_llm(user_request, cleaned, analysis_id)
        except Exception as exc:
            logger.warning(
                f"PromptOptimizer | analysis_id={analysis_id} | "
                f"LLM optimization failed — using fallback. Error: {exc}"
            )
            return self._fallback_result(user_request)

    # ------------------------------------------------------------------
    # Deterministic preprocessing
    # ------------------------------------------------------------------

    def _preprocess(self, user_request: str) -> str:
        """Deterministic preprocessing: strip whitespace, collapse runs."""
        # Normalize whitespace runs to single spaces
        cleaned = " ".join(user_request.split())
        # Truncate to max chars before sending to LLM (original is preserved)
        if len(cleaned) > MAX_REQUEST_CHARS_FOR_LLM:
            logger.info(
                f"PromptOptimizer | Request truncated from {len(cleaned)} to "
                f"{MAX_REQUEST_CHARS_FOR_LLM} chars for LLM optimization call."
            )
            cleaned = cleaned[:MAX_REQUEST_CHARS_FOR_LLM]
        return cleaned

    def _needs_llm_optimization(self, cleaned: str) -> bool:
        """Return True if the request is worth sending to the LLM."""
        return len(cleaned) >= MIN_REQUEST_CHARS_FOR_LLM

    # ------------------------------------------------------------------
    # LLM optimization call
    # ------------------------------------------------------------------

    def _call_llm(
        self,
        original_request: str,
        cleaned_request: str,
        analysis_id: str,
    ) -> PromptOptimizationResult:
        """Invoke Groq via the centralized retry service and parse the result.

        Token usage and latency are automatically recorded by invoke_with_retry
        through the existing metrics system (llm/metrics.py).
        """
        json_llm = self._llm

        messages = [
            SystemMessage(content=_OPTIMIZER_SYSTEM_PROMPT),
            HumanMessage(content=cleaned_request),
        ]

        response = invoke_with_retry(
            llm_callable=json_llm.invoke,
            messages=messages,
            agent_name="PromptOptimizer",
            analysis_id=analysis_id,
        )

        return self._parse_response(response.content, original_request)

    def _parse_response(
        self, raw_content: str, original_request: str
    ) -> PromptOptimizationResult:
        """Parse and validate the LLM JSON response into PromptOptimizationResult."""
        try:
            data = extract_json(raw_content)
        except json.JSONDecodeError as exc:
            logger.warning(
                f"PromptOptimizer | JSON parse failed: {exc} — using fallback."
            )
            return self._fallback_result(original_request)

        try:
            result = PromptOptimizationResult(
                original_request=original_request,
                optimized_request=data.get("optimized_request") or original_request,
                intent=data.get("intent", "UNKNOWN"),
                objective=data.get("objective", ""),
                requirements=_coerce_list(data.get("requirements")),
                constraints=_coerce_list(data.get("constraints")),
                known_technologies=_coerce_list(data.get("known_technologies")),
                missing_information=_coerce_list(data.get("missing_information")),
                confidence=_coerce_float(data.get("confidence")),
                optimization_applied=True,
            )
        except ValidationError as exc:
            logger.warning(
                f"PromptOptimizer | Pydantic validation failed: {exc} — using fallback."
            )
            return self._fallback_result(original_request)

        # Safety: if optimized_request came back empty, keep the original
        if not result.optimized_request.strip():
            result = result.model_copy(
                update={"optimized_request": original_request}
            )

        return result

    # ------------------------------------------------------------------
    # Fallback
    # ------------------------------------------------------------------

    @staticmethod
    def _fallback_result(original_request: str) -> PromptOptimizationResult:
        """Return a safe passthrough result preserving the original request."""
        return PromptOptimizationResult(
            original_request=original_request,
            optimized_request=original_request,
            intent="UNKNOWN",
            objective="",
            requirements=[],
            constraints=[],
            known_technologies=[],
            missing_information=[],
            confidence=0.0,
            optimization_applied=False,
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _coerce_list(value: object) -> list[str]:
    """Safely coerce an LLM output field to a list of strings."""
    if isinstance(value, list):
        return [str(item) for item in value if item]
    return []


def _coerce_float(value: object) -> float:
    """Safely coerce an LLM confidence value to a float in [0.0, 1.0]."""
    try:
        f = float(value)  # type: ignore[arg-type]
        return max(0.0, min(1.0, f))
    except (TypeError, ValueError):
        return 0.0
