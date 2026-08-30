You are working on the BuildSmart project.

TASK:
Implement STEP 11.10.X — Lightweight Prompt Optimization Layer.

IMPORTANT:
First inspect the current implementation and project memory.

Read:
- BuildSmart_PROJECT_MEMORY.md
- backend/agents/state.py
- backend/agents/supervisor.py
- backend/agents/graph.py
- backend/services/analysis_service.py
- backend/llm/client.py
- backend/llm/prompts.py
- backend/llm/retry.py
- backend/llm/metrics.py
- backend/models/schemas.py
- backend/api/routes.py
- backend/tools/gateway.py

Do not redesign the existing agent workflow.

==================================================
OBJECTIVE
==================================================

Introduce a lightweight Prompt Optimizer before SupervisorAgent.

Current:

POST /analyses
      ↓
AnalysisService
      ↓
create_initial_state()
      ↓
SupervisorAgent
      ↓
DecompositionAgent
      ↓
...

New:

POST /analyses
      ↓
AnalysisService
      ↓
PromptOptimizer
      ↓
BuildSmartState
      ↓
SupervisorAgent
      ↓
DecompositionAgent
      ↓
...

The Prompt Optimizer is NOT a new LangGraph agent.

It is a preprocessing/service layer.

==================================================
WHY
==================================================

Users may provide vague requests such as:

"I want some AI thing for customer support."

The optimizer should convert this into a clearer structured representation before SupervisorAgent receives it.

The optimizer should improve:

- clarity
- intent identification
- requirement extraction
- constraint extraction
- technology identification
- objective normalization

It must NOT invent requirements.

==================================================
CORE RULE
==================================================

NEVER hallucinate user requirements.

If the user says:

"I want an AI chatbot."

Do NOT infer:

AWS
React
PostgreSQL
RAG
Kubernetes
authentication

unless explicitly provided.

Unknown information must remain unknown.

==================================================
V1 ARCHITECTURE
==================================================

Use a HYBRID lightweight approach:

1. Deterministic preprocessing first.
2. One LLM optimization call only when necessary.
3. Reuse the existing centralized LLM retry infrastructure.
4. Reuse existing token/latency observability.
5. Do not create another independent LLM client.
6. Do not create another retry mechanism.

The optimizer should use:

backend/llm/client.py

and:

backend/llm/retry.py

for LLM calls.

==================================================
PROPOSED FILE
==================================================

Create:

backend/services/prompt_optimizer.py

Possible supporting tests:

backend/tests/test_prompt_optimizer.py

Only create additional files if genuinely necessary.

==================================================
OUTPUT CONTRACT
==================================================

Create a Pydantic model such as:

PromptOptimizationResult

with fields similar to:

{
    "original_request": "...",
    "optimized_request": "...",
    "intent": "...",
    "objective": "...",
    "requirements": [],
    "constraints": [],
    "known_technologies": [],
    "missing_information": [],
    "confidence": 0.0
}

Keep the model minimal.

Do not duplicate the full BuildSmartState.

==================================================
OPTIMIZATION RESPONSIBILITIES
==================================================

The optimizer should identify:

1. Objective

What does the user actually want to build/change?

2. Intent

Examples:

BUILD
MIGRATE
REPLACE
INTEGRATE
IMPROVE
EVALUATE
UNKNOWN

3. Explicit requirements

Only requirements actually stated by the user.

4. Explicit constraints

Examples:

- AWS
- Azure
- GCP
- React
- Python
- .NET
- budget constraints
- security constraints
- licensing restrictions

Only capture explicitly stated constraints.

5. Known technologies

Only technologies explicitly mentioned.

6. Missing information

Information that would materially help BuildSmart but was not provided.

Do not ask the user questions automatically in V1.

7. Optimized request

Produce a concise, clearer version of the original request.

==================================================
EXAMPLE
==================================================

Input:

"I want to build some kind of AI customer support assistant using AWS and our existing React app."

Expected conceptual output:

{
    "objective": "Build an AI-powered customer support assistant",
    "intent": "BUILD",
    "requirements": [
        "AI-powered customer support",
        "Customer support assistant"
    ],
    "constraints": [
        "AWS",
        "Existing React application"
    ],
    "known_technologies": [
        "AWS",
        "React"
    ],
    "missing_information": [],
    "optimized_request": "Build an AI-powered customer support assistant integrated with the existing React application and AWS environment."
}

==================================================
NO HALLUCINATION EXAMPLE
==================================================

Input:

"I want an AI chatbot."

The optimizer should NOT produce:

AWS
React
RAG
PostgreSQL
Kubernetes
Redis

unless the user stated them.

Instead:

requirements:
["AI chatbot"]

known_technologies:
[]

constraints:
[]

missing_information:
[
    relevant information that is genuinely missing
]

==================================================
SUPERVISOR INTEGRATION
==================================================

After optimization, SupervisorAgent should receive the optimized request.

Preserve the original request.

Recommended state behavior:

user_request:
original user input

normalized_request:
optimized request

Do not overwrite the original user_request.

If the existing BuildSmartState already uses normalized_request later in the workflow, integrate with that existing contract instead of creating duplicate fields.

==================================================
IMPORTANT: DO NOT BREAK EXISTING FLOW
==================================================

Do not change:

- Supervisor decision logic
- Decomposition logic
- Research logic
- Evaluation logic
- Decision logic
- Blueprint logic
- Validation logic
- UnifiedToolGateway
- MCP Manager
- MCP registry
- API contracts unnecessarily
- Lakebase schema unnecessarily
- LLM retry architecture
- LLM observability architecture

The optimizer should simply improve the input before SupervisorAgent.

==================================================
LLM CALL
==================================================

If an LLM call is required:

- Use the existing Groq LLM client.
- Use the existing centralized retry service.
- Use structured JSON output.
- Validate with Pydantic.
- Never log raw prompts.
- Token usage must automatically flow into the existing metrics system.
- Latency must automatically flow into existing metrics.
- Respect the existing retry maximum of 3 retries.

Do not introduce another retry implementation.

==================================================
TOKEN / CONTEXT CONTROL
==================================================

The optimizer itself must remain lightweight.

Set a reasonable input boundary for user requests.

Do not send the entire BuildSmartState.

The optimizer receives only the user's request and minimal required context.

Avoid unnecessary LLM tokens.

==================================================
ERROR BEHAVIOR
==================================================

If optimization fails:

The system must NOT lose the user's original request.

Fallback:

optimized_request = original_request

intent = UNKNOWN

requirements = []

constraints = []

known_technologies = []

Then continue to SupervisorAgent.

A prompt optimization failure must never make the entire BuildSmart workflow unavailable.

Use the existing error/logging/observability framework.

==================================================
TESTING
==================================================

Create tests covering:

1. Clear request.
2. Vague request.
3. Explicit AWS constraint.
4. Explicit technology constraint.
5. Multiple requirements.
6. No hallucinated technologies.
7. Empty/invalid optimizer output.
8. LLM failure fallback.
9. Retry behavior through existing retry service.
10. Original request preserved.
11. Optimized request passed to SupervisorAgent.
12. Token/latency metrics are recorded through existing observability.

Mock LLM calls in unit tests.

Do NOT require live Groq for the unit test suite.

==================================================
API
==================================================

Do NOT expose a new API endpoint.

The existing:

POST /api/v1/analyses

should internally perform:

request
 ↓
optimizer
 ↓
workflow

The API response should remain backward compatible.

If useful and already compatible with the current schema, expose optimization metadata through an optional field.

Do NOT make this mandatory unless the existing API contract can safely support it.

==================================================
OBSERVABILITY
==================================================

The optimizer is an LLM boundary if it invokes Groq.

Therefore:

- agent/service name should identify it as PromptOptimizer
- token usage should appear in llm_tokens.log
- latency should be captured
- cost should be captured
- retries should be captured
- analysis_id should be preserved

Do not log:
- API keys
- raw prompts
- sensitive user data unnecessarily

==================================================
DOCUMENTATION
==================================================

Create or update:

docs/prompt_optimizer.md

Document:

- purpose
- architecture
- input/output
- deterministic preprocessing
- LLM optimization
- no-hallucination rule
- fallback behavior
- retry behavior
- observability
- V1 limitations
- future V2 evolution

==================================================
V2 BOUNDARY
==================================================

Do NOT implement:

- memory retrieval
- conversation memory
- RAG-based personalization
- feedback learning
- GEPA
- automatic prompt evolution
- skill selection
- autonomous prompt experimentation

These belong to future V2.

Document them as future enhancements only.

==================================================
HUMAN FEEDBACK FOUNDATION
==================================================

Add only the architectural placeholder/documentation for future human feedback.

Future examples:

- user rejects candidate
- user prefers a specific technology
- user changes REUSE to BUILD
- user rejects an architecture
- user marks a recommendation as irrelevant

Do NOT implement feedback storage or learning now.

The optimizer should be designed so that future feedback can eventually be supplied as optional context without redesigning the entire service.

==================================================
VALIDATION
==================================================

After implementation:

1. Run the complete pytest suite.
2. Run PromptOptimizer unit tests.
3. Run the existing API tests.
4. Run the existing gateway/MCP tests.
5. Run a real CLI test if Groq credentials are available.
6. Verify existing workflow behavior.
7. Verify no existing endpoint broke.
8. Verify token metrics still work.
9. Verify retry metrics still work.
10. Verify no secrets appear in logs.

Report:

- files created
- files modified
- architecture changes
- tests added
- total test count
- passed/failed
- real Groq test result
- API regression result
- observability result
- known limitations

==================================================
PROJECT MEMORY
==================================================

Update:

BUILDSMART/BuildSmart_PROJECT_MEMORY.md

Add a new section:

STEP 11.10.X — LIGHTWEIGHT PROMPT OPTIMIZER

Record:

- objective
- architecture
- files
- state changes
- LLM usage
- retry integration
- observability integration
- fallback behavior
- tests
- manual verification
- V1/V2 boundary
- human feedback future direction
- next step

DO NOT overwrite historical entries.

STOP after completing this step.
Do not proceed to Skills implementation or V2 memory implementation.