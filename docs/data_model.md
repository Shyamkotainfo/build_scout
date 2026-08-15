# BuildSmart — Data Model

## 1. Purpose

This document defines the logical and physical data model for the BuildSmart MVP.

BuildSmart needs to persist five categories of information:

1. The user's solution analysis.
2. The technical requirements and components discovered by agents.
3. Reusable candidates discovered from public ecosystems.
4. Evidence and evaluations used to make Build / Reuse / Adapt decisions.
5. Agent execution and tool-call traces needed for transparency and debugging.

The MVP uses PostgreSQL. `pgvector` is optional but recommended when semantic candidate/component similarity is enabled.

---

## 2. Core Entity Model

```mermaid
erDiagram

    ANALYSIS ||--o{ REQUIREMENT : contains
    REQUIREMENT ||--o{ COMPONENT : decomposes_to
    COMPONENT ||--o{ CANDIDATE : has
    SOURCE ||--o{ CANDIDATE : provides

    CANDIDATE ||--o{ CANDIDATE_EVALUATION : evaluated_by
    CANDIDATE_EVALUATION ||--o{ EVIDENCE : supported_by

    COMPONENT ||--o{ DECISION : receives
    CANDIDATE ||--o{ DECISION : selected_for

    ANALYSIS ||--o{ AGENT_RUN : executes
    AGENT_RUN ||--o{ TOOL_CALL : invokes
    AGENT_RUN ||--o{ AGENT_MESSAGE : produces

    ANALYSIS ||--o| BLUEPRINT : produces

    ANALYSIS {
        uuid id PK
        text user_request
        text normalized_request
        varchar domain
        varchar status
        numeric reuse_confidence
        numeric effort_from_scratch_days
        numeric effort_with_reuse_days
        timestamp created_at
        timestamp updated_at
    }

    REQUIREMENT {
        uuid id PK
        uuid analysis_id FK
        varchar name
        text description
        varchar category
        varchar priority
        int sequence
    }

    COMPONENT {
        uuid id PK
        uuid requirement_id FK
        varchar canonical_name
        varchar component_type
        text description
        text technical_role
        vector embedding
    }

    SOURCE {
        uuid id PK
        varchar source_type
        varchar name
        text base_url
        varchar trust_level
        boolean enabled
    }

    CANDIDATE {
        uuid id PK
        uuid component_id FK
        uuid source_id FK
        varchar name
        text url
        text repository_url
        text description
        varchar language
        int stars
        int forks
        int open_issues
        timestamp last_commit_at
        timestamp latest_release_at
        varchar license_name
        varchar license_spdx
        jsonb metadata
    }

    CANDIDATE_EVALUATION {
        uuid id PK
        uuid candidate_id FK
        numeric compatibility_score
        numeric health_score
        numeric security_score
        numeric license_score
        numeric adoption_score
        numeric maintenance_score
        numeric overall_score
        numeric confidence_score
        varchar integration_effort
        varchar risk_level
        text rationale
    }

    EVIDENCE {
        uuid id PK
        uuid evaluation_id FK
        varchar evidence_type
        text source_url
        text source_title
        text claim
        text evidence_text
        timestamp retrieved_at
        numeric confidence
    }

    DECISION {
        uuid id PK
        uuid component_id FK
        uuid candidate_id FK
        varchar decision
        numeric confidence
        varchar risk_level
        varchar integration_effort
        text rationale
    }

    BLUEPRINT {
        uuid id PK
        uuid analysis_id FK
        jsonb architecture
        jsonb component_mapping
        jsonb integration_flow
        jsonb data_flow
        jsonb api_interfaces
        jsonb technology_stack
        jsonb implementation_phases
        numeric estimated_effort_days
    }

    AGENT_RUN {
        uuid id PK
        uuid analysis_id FK
        uuid parent_run_id FK
        varchar agent_name
        varchar status
        text input_summary
        jsonb output
        int tool_call_count
        int retry_count
        timestamp started_at
        timestamp completed_at
    }

    TOOL_CALL {
        uuid id PK
        uuid agent_run_id FK
        varchar tool_name
        varchar tool_type
        jsonb arguments
        jsonb result_summary
        varchar status
        int latency_ms
        timestamp started_at
        timestamp completed_at
    }

    AGENT_MESSAGE {
        uuid id PK
        uuid agent_run_id FK
        varchar target_agent
        varchar message_type
        jsonb payload
        timestamp created_at
    }
```

---

## 3. Entity Definitions

### 3.1 `analysis`

The root entity for a BuildSmart run.

Recommended statuses:

```text
CREATED
DECOMPOSING
SEARCHING
EVALUATING
DECIDING
BLUEPRINT_GENERATING
VALIDATING
COMPLETED
FAILED
```

Example:

```json
{
  "id": "analysis-uuid",
  "user_request": "Build an AI document intelligence platform",
  "domain": "document_intelligence",
  "status": "EVALUATING",
  "reuse_confidence": 0.87
}
```

### 3.2 `requirement`

A business or technical capability derived from the original request.

Examples:

```text
Document ingestion
PDF parsing
OCR
Embedding generation
Semantic retrieval
API
Authentication
```

### 3.3 `component`

A normalized technical capability.

Use canonical names so different user wording maps to the same concept:

```text
"PDF extraction"
"PDF parser"
"document text extraction"
        ↓
DOCUMENT_PARSING
```

Recommended canonical component types:

```text
DATA_INGESTION
DOCUMENT_PARSING
OCR
TEXT_PROCESSING
CHUNKING
EMBEDDING
VECTOR_DATABASE
RETRIEVAL
RERANKING
LLM
API
AUTHENTICATION
FRONTEND
OBJECT_STORAGE
MESSAGE_QUEUE
OBSERVABILITY
SECURITY
DOMAIN_LOGIC
```

### 3.4 `source`

Represents a public ecosystem source.

Examples:

```text
GITHUB
WEB
DOCUMENTATION
PACKAGE_REGISTRY
CLOUD_ARCHITECTURE
LICENSE
SECURITY
```

### 3.5 `candidate`

A reusable project, library, package, framework, reference implementation or architecture.

Important principle:

> A candidate is a project-level concept; GitHub, PyPI and documentation URLs can be represented as metadata/evidence for the same candidate.

### 3.6 `candidate_evaluation`

Stores the evaluation result.

Suggested weights:

```text
compatibility  = 30%
health         = 20%
security       = 15%
license        = 15%
adoption       = 10%
maintenance    = 10%
```

### 3.7 `evidence`

Every important recommendation should be traceable to evidence.

Evidence should contain:

- Source.
- URL.
- Claim.
- Supporting text/metric.
- Retrieval timestamp.
- Confidence.

### 3.8 `decision`

Allowed values:

```text
REUSE
ADAPT
BUILD
```

A `BUILD` decision may have `candidate_id = NULL`.

### 3.9 `blueprint`

Stores the final implementation plan.

Prefer JSONB for generated structures because the blueprint schema will evolve quickly during the hackathon.

### 3.10 `agent_run`

Tracks agent execution for the agentic UI and debugging.

Example:

```text
Supervisor
  └── Decomposition
  └── Research
       ├── GitHub Search
       └── Web Search
  └── Evaluation
  └── Decision
  └── Blueprint
  └── Validation
```

### 3.11 `tool_call`

Stores tool usage without exposing secrets.

Never persist:

```text
API keys
OAuth tokens
Authorization headers
raw sensitive credentials
```

---

## 4. Recommended Indexes

```sql
CREATE INDEX idx_analysis_status
ON analysis(status);

CREATE INDEX idx_requirement_analysis
ON requirement(analysis_id);

CREATE INDEX idx_component_requirement
ON component(requirement_id);

CREATE INDEX idx_candidate_component
ON candidate(component_id);

CREATE INDEX idx_candidate_source
ON candidate(source_id);

CREATE INDEX idx_candidate_license
ON candidate(license_spdx);

CREATE INDEX idx_evaluation_candidate
ON candidate_evaluation(candidate_id);

CREATE INDEX idx_decision_component
ON decision(component_id);

CREATE INDEX idx_agent_run_analysis
ON agent_run(analysis_id);

CREATE INDEX idx_tool_call_agent_run
ON tool_call(agent_run_id);
```

If using pgvector:

```sql
CREATE INDEX idx_component_embedding
ON component
USING hnsw (embedding vector_cosine_ops);
```

---

## 5. Data Ownership

| Entity | Primary Owner |
|---|---|
| Analysis | Backend / Supervisor |
| Requirement | Decomposition Agent |
| Component | Decomposition Agent |
| Candidate | Research Agent |
| Evaluation | Evaluation Agent |
| Evidence | Research / Evaluation |
| Decision | Decision Agent |
| Blueprint | Blueprint Agent |
| Agent Run | Agent Runtime |
| Tool Call | MCP / Tool Runtime |

---

## 6. MVP Principle

Do not create a complex enterprise schema during the hackathon.

The minimum persisted path is:

```text
Analysis
  → Requirements
  → Components
  → Candidates
  → Evaluations
  → Evidence
  → Decisions
  → Blueprint
```

Agent execution records are added for traceability and demo value.
