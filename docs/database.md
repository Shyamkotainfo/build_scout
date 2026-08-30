# BuildSmart — Database Architecture

> **Source of truth**: `backend/database/models.py`
> This document reflects **actually implemented** columns and relationships only.

---

## 1. Persistence Stack

```
FastAPI
    │
    ▼
AnalysisService / RetrievalService
    │
    ▼
AnalysisRepository  (backend/database/repositories.py)
    │
    ▼
SQLAlchemy ORM  (synchronous sessions)
    │
    ▼
Databricks Lakebase  (PostgreSQL-compatible)
```

---

## 2. Connection

**File**: `backend/database/connection.py`

- Engine created via `create_engine()` with `psycopg2` driver
- SSL mode: `require` (configured per env)
- `get_session()` yields a `Session`, closed on exit
- `is_database_configured()` returns `True` only when all required env vars are present

**Configuration** (`backend/.env`):

| Env Var | Description |
|---|---|
| `LAKEBASE_HOST` | PostgreSQL host |
| `LAKEBASE_PORT` | Port (default: 5432) |
| `LAKEBASE_DATABASE` | Database name |
| `LAKEBASE_USER` | Username |
| `LAKEBASE_PASSWORD` | Password / JWT token |
| `LAKEBASE_SSL_MODE` | SSL mode (e.g., `require`) |

> 🔒 **Security**: `LAKEBASE_PASSWORD` is never logged, printed, or returned in API responses.

---

## 3. Entity Reference

All UUIDs use `UUID(as_uuid=True)` (native PostgreSQL UUID type).
All timestamps use `DateTime(timezone=True)`.
JSONB columns store structured sub-documents.

---

### 3.1 `analysis`

Root entity for a BuildSmart run.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | auto-generated |
| `user_request` | Text | original user input, NOT NULL |
| `normalized_request` | Text | normalised by supervisor |
| `domain` | String | e.g. `document_intelligence` |
| `status` | String | e.g. `VALIDATED`, `FAILED` |
| `reuse_confidence` | Numeric | confidence score from validation |
| `effort_from_scratch_days` | Numeric | estimated effort |
| `effort_with_reuse_days` | Numeric | estimated effort with reuse |
| `created_at` | Timestamp | auto-set |
| `updated_at` | Timestamp | auto-updated |

**Relationships**: `requirements` (1→N), `blueprints` (1→N), `agent_runs` (1→N)

---

### 3.2 `requirement`

A business/technical requirement extracted by `DecompositionAgent`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `analysis_id` | UUID FK → `analysis.id` | NOT NULL |
| `name` | String | short label |
| `description` | Text | full description |
| `category` | String | |
| `priority` | String | e.g. `HIGH`, `MEDIUM` |
| `sequence` | Integer | ordering index |

---

### 3.3 `component`

A normalised technical capability. May or may not map 1:1 to a requirement.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `analysis_id` | UUID FK → `analysis.id` | nullable; used for direct lookup |
| `requirement_id` | UUID FK → `requirement.id` | nullable; populated when agent provides it |
| `canonical_name` | String | e.g. `PDF_INGESTION_SERVICE` |
| `component_type` | String | e.g. `DATA_INGESTION` |
| `description` | Text | |
| `technical_role` | Text | |

> **Note**: `analysis_id` is the primary lookup key. `requirement_id` is optional because `DecompositionAgent` does not always provide it in agent output.

---

### 3.4 `source`

Represents a public ecosystem source (GitHub, PyPI, web, etc.).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `source_type` | String | e.g. `GITHUB`, `WEB` |
| `name` | String | |
| `base_url` | Text | |
| `trust_level` | String | |
| `enabled` | Boolean | default true |

> Used by `Candidate` — populated when MCP is active (FUTURE / PLANNED).

---

### 3.5 `candidate`

A reusable project/library discovered by `ResearchAgent`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `component_id` | UUID FK → `component.id` | NOT NULL |
| `source_id` | UUID FK → `source.id` | nullable |
| `name` | String | |
| `url` | Text | |
| `repository_url` | Text | |
| `description` | Text | |
| `language` | String | |
| `stars` | Integer | |
| `forks` | Integer | |
| `open_issues` | Integer | |
| `last_commit_at` | Timestamp | |
| `latest_release_at` | Timestamp | |
| `license_name` | String | |
| `license_spdx` | String | indexed |
| `metadata` | JSONB | additional metadata |

> ⚠️ Currently empty — MCP is **NOT** implemented.

---

### 3.6 `candidate_evaluation`

Evaluation result for a candidate.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `candidate_id` | UUID FK → `candidate.id` | NOT NULL |
| `compatibility_score` | Numeric | |
| `health_score` | Numeric | |
| `security_score` | Numeric | |
| `license_score` | Numeric | |
| `adoption_score` | Numeric | |
| `maintenance_score` | Numeric | |
| `overall_score` | Numeric | |
| `confidence_score` | Numeric | |
| `integration_effort` | String | |
| `risk_level` | String | |
| `rationale` | Text | |

---

### 3.7 `evidence`

Evidence tracing evaluation findings.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `evaluation_id` | UUID FK → `candidate_evaluation.id` | NOT NULL |
| `evidence_type` | String | |
| `source_url` | Text | |
| `source_title` | Text | |
| `claim` | Text | |
| `evidence_text` | Text | |
| `retrieved_at` | Timestamp | |
| `confidence` | Numeric | |

---

### 3.8 `decision`

A Build / Reuse / Adapt decision for a component.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `component_id` | UUID FK → `component.id` | NOT NULL |
| `candidate_id` | UUID FK → `candidate.id` | nullable (NULL for BUILD) |
| `decision` | String | `BUILD`, `REUSE`, or `ADAPT` |
| `confidence` | Numeric | |
| `risk_level` | String | |
| `integration_effort` | String | |
| `rationale` | Text | |

---

### 3.9 `blueprint`

Final implementation plan in JSONB fields.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `analysis_id` | UUID FK → `analysis.id` | NOT NULL |
| `architecture` | JSONB | solution summary and style |
| `component_mapping` | JSONB | per-component blueprint details |
| `integration_flow` | JSONB | integration points |
| `data_flow` | JSONB | data flow descriptions |
| `api_interfaces` | JSONB | API contracts |
| `technology_stack` | JSONB | technology choices |
| `implementation_phases` | JSONB | phased delivery plan |
| `estimated_effort_days` | Numeric | |

---

### 3.10 `agent_run`

Tracks one agent invocation for traceability.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `analysis_id` | UUID FK → `analysis.id` | NOT NULL |
| `parent_run_id` | UUID FK → `agent_run.id` | nullable (self-referential) |
| `agent_name` | String | e.g. `SupervisorAgent` |
| `status` | String | e.g. `COMPLETED` |
| `input_summary` | Text | |
| `output` | JSONB | |
| `tool_call_count` | Integer | |
| `retry_count` | Integer | |
| `started_at` | Timestamp | |
| `completed_at` | Timestamp | |

---

### 3.11 `tool_call`

Individual MCP tool invocations (populated when MCP is active).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `agent_run_id` | UUID FK → `agent_run.id` | NOT NULL |
| `tool_name` | String | |
| `tool_type` | String | |
| `arguments` | JSONB | |
| `result_summary` | JSONB | |
| `status` | String | |
| `latency_ms` | Integer | |
| `started_at` | Timestamp | |
| `completed_at` | Timestamp | |

---

### 3.12 `agent_message`

Inter-agent messages.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `agent_run_id` | UUID FK → `agent_run.id` | NOT NULL |
| `target_agent` | String | |
| `message_type` | String | |
| `payload` | JSONB | |
| `created_at` | Timestamp | auto-set |

---

## 4. Transaction Behavior

- `save_analysis()` in `AnalysisRepository` runs all inserts in a single SQLAlchemy session
- `session.flush()` is called between entity groups to enforce FK ordering
- `session.commit()` is called **once** by `AnalysisService` after the full graph state is persisted — fully atomic
- On any exception, the caller is responsible for `session.rollback()`

---

## 5. UUID Mapping

Agents use string IDs like `COMP-001`, `REQ-001`. The `save_analysis()` method maps these string keys to real PostgreSQL UUIDs using `_get_or_create_uuid()`, maintaining consistency across FK relationships within the same transaction.

---

## 6. Schema Migrations

Schema is managed via `Base.metadata.create_all(engine)` during initial setup. The `analysis_id` column was added to `component` via:

```sql
ALTER TABLE component ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES analysis(id);
CREATE INDEX IF NOT EXISTS idx_component_analysis ON component(analysis_id);
```
