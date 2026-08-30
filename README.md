# BuildScout

BuildScout is an AI-powered solution discovery and architecture decision system.

Teams often start building a new solution without first checking whether reusable solutions, open-source components, previous work, or existing architecture patterns already exist. BuildScout solves this by analyzing plain-English project requests, searching for existing components, and automatically deciding whether to reuse, adapt, or build each piece of the architecture.

## 1. WHAT BUILDSCOUT DOES

USER PROBLEM
↓
UNDERSTAND REQUIREMENTS
↓
DISCOVER EXISTING SOLUTIONS
↓
EVALUATE CANDIDATES
↓
DECIDE REUSE / ADAPT / BUILD
↓
GENERATE ARCHITECTURE
↓
VALIDATE ARCHITECTURE
↓
PRESENT FINAL RECOMMENDATION

By automatically executing this entire research and architecture lifecycle before a single line of code is written, BuildScout prevents teams from reinventing the wheel. It accelerates project starts, guarantees alignment with established patterns, and ensures maximum reuse of existing components.

## 2. END-TO-END FLOW

1. **User submits a problem**: The process starts with a plain-English request describing the software the user wants to build.
2. **Prompt optimization**: Re-writes and expands the initial prompt for clarity, adding domain context to ensure the AI understands the true scope.
3. **Supervisor**: Orchestrates the workflow, delegating to specialized sub-agents via a directed LangGraph pipeline.
4. **Requirement decomposition**: Breaks the optimized prompt down into specific functional and non-functional requirements and identifies the necessary system components.
5. **Research / solution discovery**: Searches for existing open-source, enterprise, or pattern-based solutions that map to the identified components.
6. **Candidate evaluation**: Objectively scores the discovered candidates on metrics like capability match, maturity, and integration effort.
7. **Decision**: Makes the core strategic choice for each component: Should we REUSE it as-is, ADAPT it to fit our needs, or BUILD it from scratch?
8. **Architecture blueprint**: Synthesizes the individual component decisions into a complete technical architecture, complete with data flows and integration points.
9. **Validation**: Acts as a final quality gate. It verifies that the generated blueprint addresses the requirements and is architecturally sound.
10. **Persistence**: Saves the complete analysis safely to Lakebase (Databricks/Postgres), so it can be viewed later.
11. **Frontend presentation**: Presents the findings on a beautiful, interactive React dashboard, allowing users to drill down into the research, decisions, and final architecture.

## 3. AGENTS

| Agent | Purpose | Input | Output |
|---|---|---|---|
| Prompt Optimizer | Refines the user request | Raw user request | Normalized request |
| Supervisor | Orchestrates the LangGraph workflow | State | Next agent to run |
| Decomposition Agent | Breaks down the prompt into requirements | Normalized request | Requirements & Components |
| Research Agent | Finds existing solutions for components | Components & Requirements | Reusable Candidates |
| Evaluation Agent | Scores discovered candidates | Candidates & Requirements | Evaluations |
| Decision Agent | Decides whether to reuse, adapt, or build | Evaluations & Components | Decisions |
| Blueprint Agent | Generates the final system architecture | Decisions | Architecture Blueprint |
| Validation Agent | Quality-checks the final architecture | Blueprint | Validation Score & Status |

**Agent Relationships:**
- **Research Agent** → finds candidates
- **Evaluation Agent** → determines candidate quality
- **Decision Agent** → REUSE / ADAPT / BUILD
- **Blueprint Agent** → converts decisions into architecture
- **Validation Agent** → checks the resulting architecture

## 4. REUSE / ADAPT / BUILD

The core intelligence of BuildScout lies in its ability to automatically categorize component implementation strategies:

- **REUSE**: Use an existing solution exactly as-is. This is chosen when an existing library, API, or service perfectly matches the requirement out of the box.
- **ADAPT**: Use an existing solution but modify or wrap it. This is chosen when a solution provides 80% of the functionality, but requires custom integration logic.
- **BUILD**: Build the capability completely from scratch. This is chosen when no suitable reusable solutions were found, or the requirement is highly proprietary.

This prioritization (Reuse over Build) dramatically saves development time and reduces maintenance overhead.

## 5. ARCHITECTURE

The Architecture page represents the **final technical blueprint** produced after the decisions are made. It is NOT another research page—it is the final system design.

It includes:
- **Components** and their specific **Responsibilities**
- **Technology Choices** directly mapped from the Decision stage
- **Data Flows** between components
- **Integration Points**
- **Implementation Phases**
- **Risks**

**The Relationship:**
- Research → Evidence
- Decision → Choice
- Architecture → Final system design
- Validation → Quality gate

## 6. VALIDATION

Validation acts as the final quality gate before the architecture is presented to the user. 
It ensures:
- **Requirement coverage**: Did we miss anything the user asked for?
- **Architecture consistency**: Does the data flow make logical sense?
- **Risks/Warnings**: Are there security or scalability concerns?

The output is an **overall score** and a status of **PASS**, **WARNING**, or **FAIL**.

## 7. FRONTEND PAGES

| Page | Purpose |
|---|---|
| Dashboard | High-level metrics showing the impact of BuildScout (e.g., time saved, reuse vs build stats). |
| New Analysis | The entry point to submit a new problem for AI analysis. |
| Analyses | A history table of all past persistent analyses executed on the platform. |
| Research | Displays the candidates discovered by the Research Agent. |
| Decisions | Shows the REUSE / ADAPT / BUILD logic and the final selected candidate. |
| Architecture | Presents the final, synthesized architecture blueprint and component map. |
| Validation | Shows the final quality score and any structural warnings. |
| Agent Trace | Provides full observability into the LangGraph execution, tokens, latency, and steps. |
| Metrics | Detailed LLM observability metrics (latency, token usage) over time. |
| Documentation | In-app view of the repository documentation. |
| Roadmap | The strategic product roadmap for future releases. |
| V2 Specification | Details for the upcoming V2 release (MCP, integrations). |
| Data Model | An interactive representation of the database schema. |

A judge should look closely at the **Architecture** to see the synthesized output, the **Decisions** to see the AI reasoning, and the **Agent Trace** to verify that real work is being done by specialized agents in the background.

## 8. EXAMPLE

**"Illustrative Example"**

*Prompt:* "I want to build an AI customer-support assistant that can answer questions from company documents, search a knowledge base, and escalate complex issues to human agents."

- **Requirements**: document search, question answering, escalation, authentication, API integration.
- **Research**: Discovered reusable open-source knowledge/search components like Haystack, as well as UI chat kits.
- **Evaluation**: Scored candidates based on ease of integration and feature match.
- **Decision**: 
  - REUSE existing search component (Haystack)
  - ADAPT an existing chat interface
  - BUILD missing custom human escalation logic
- **Architecture**: Defines the document ingestion pipeline, knowledge store, retrieval layer, LLM/RAG layer, and the human escalation handler, connecting them via defined data flows.
- **Validation**: Produces an architecture score of 85, verifying all requirements were addressed, though raising a warning about context window limits in the escalation pipeline.

## 9. V1 — WHAT WE BUILT

### V1
In Version 1, we implemented a fully functional end-to-end pipeline:
- AI-driven solution discovery and requirement decomposition
- Candidate evaluation using LLMs
- REUSE / ADAPT / BUILD automated decisions
- Architecture blueprint generation
- Architecture validation (Quality gate)
- Persistent analysis history backed by Databricks/Postgres (Lakebase)
- Agent trace and execution timestamps
- LLM metrics (Token usage, latency tracking)
- Beautiful frontend dashboard with specialized explorers (Research, Architecture, Validation)
- Offline/last-known-good history behavior for resilience
- Heavy LangGraph parallelization and prompt optimizations

## 10. V1 PERFORMANCE OPTIMIZATIONS

We aggressively optimized the V1 backend to reduce a >10 minute pipeline to under 4.5 minutes.

- **Optimization #1 (Context Truncation)**: Heavily compacted the context passed down the LangGraph pipeline, preventing downstream agents (Blueprint, Validation) from token exhaustion.
- **Optimization #2 (Parallelization)**: Split the Evaluation agent into a threaded parallel execution model, scoring candidates concurrently.
- **Optimization #3 (Database Queries)**: Optimized the Lakebase persistence layer to utilize batch inserts instead of iterative commits.
- **Optimization #5 & #6 (Caching & Lean Prompts)**: Aggressively trimmed Pydantic output schemas (removing redundant rationales) to force faster LLM generation speeds.
- **Optimization #7 (Evidence Store)**: We investigated implementing a centralized Evidence Store to cache research between different analyses. This optimization was **intentionally NOT implemented** because we measured the hit-rate benefits to be effectively zero under the current architecture, as every new architecture request requires highly contextual, bespoke research.

## 11. V2 — FUTURE DIRECTION

Using our V2 specification, the future direction focuses on deeper integration and stronger governance. A major evolution path is positioning **BuildScout as an MCP Server**.

**BuildScout MCP Server (PLANNED - V2):**
BuildScout evolves from a standalone solution intelligence application into a reusable intelligence service that can participate in larger AI-agent ecosystems. The planned MCP Server will allow external AI Agents and enterprise workflows to programmatically invoke BuildScout's capabilities.

**Future Architecture:**
```
External AI Agents
        ↓
MCP Client
        ↓
BuildScout MCP Server
        ↓
BuildScout Intelligence Layer
        ↓
Discovery → Evaluation → Decision → Architecture → Validation
        ↓
Structured Response
```

**Future MCP Tools:**
The following are *PLANNED* MCP tools (they do not currently exist in V1):
- `analyze_solution`: Run the complete BuildScout analysis
- `discover_solutions`: Discover reusable solutions
- `evaluate_candidates`: Evaluate discovered candidates
- `make_build_decision`: Determine REUSE / ADAPT / BUILD
- `generate_architecture`: Generate the architecture blueprint
- `validate_architecture`: Validate the proposed architecture
- `get_analysis`: Retrieve a previous analysis
- `get_analysis_history`: Retrieve historical analyses

**Other Future Capabilities:**
- **Expanded solution intelligence**: Integrating Model Context Protocol (MCP) servers to actively search live GitHub repositories and NPM registries rather than relying on LLM parametric memory.
- **Deeper enterprise integrations**: Native integrations into Jira and Confluence to automatically generate epics and tickets directly from the Architecture Blueprint.
- **Advanced decision intelligence**: Allowing human-in-the-loop overrides on Decisions before the Architecture is generated.
- **Stronger governance**: Automated cost-estimation for the selected architectural components.

## 12. V1 VS V2

| Area | V1 | V2 |
|---|---|---|
| Solution Discovery | Relies on LLM parametric memory | Integrates live MCP servers (GitHub, Web) |
| Evaluation | LLM-based heuristic scoring | Deep dependency and vulnerability scanning |
| Decision Intelligence | Fully automated (Agentic) | Human-in-the-loop override capability |
| Architecture | Text and JSON component mapping | Exportable Infrastructure-as-Code (Terraform) |
| Validation | Logical AI validation | Enterprise policy & compliance gating |
| Enterprise Capabilities | Persistent history | Jira/Confluence automatic ticket generation |
| Observability | Agent trace & basic token metrics | Deep LangSmith integration & cost analysis |
| AI Agent Integration | Limited/Standalone | MCP-enabled |
| External Agent Invocation | Not available | Planned |
| MCP Server | Not available | Planned |

## 13. DATA MODEL

BuildScout uses a robust relational data model persisted in Lakebase (PostgreSQL-compatible) using SQLAlchemy.

The major entities are:
- `Analysis`: The root entity tracking the user request.
- `Requirement`: The decomposed functional needs.
- `Component`: The architectural building blocks.
- `Candidate`: The discovered reusable solutions.
- `Evaluation`: The scoring metrics for candidates.
- `Decision`: The selected candidate and the Build/Reuse/Adapt strategy.
- `Blueprint`: The synthesized JSON architecture.
- `Validation`: The quality score and checks.
- `AgentRun`: Execution traces, latencies, and token metrics.

Relationships flow downwards from Analysis.

[View Data Model](docs/data_model.md)

## 14. DOCUMENTATION LINKS

| Document | Description |
|---|---|
| [Data Model](docs/data_model.md) | Logical database model (ER diagram) and table structures. |
| [Architecture](docs/architecture.md) | High-level system architecture and layer descriptions. |
| [Agent Workflow](docs/agent_workflow.md) | Details the LangGraph topology and state transitions. |
| [API Documentation](docs/api.md) | Full API reference with schemas and examples. |
| [Database Strategy](docs/database.md) | Lakebase configuration and persistence logic. |
| [Testing Strategy](docs/testing.md) | Information on the backend and frontend testing suite. |


## 15. HOW TO RUN

**Backend Setup**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env based on the template
cp .env.example .env
# Edit .env with your AWS Bedrock credentials and Database URL
```

**Running Backend**
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. uvicorn api.main:app --host 127.0.0.1 --port 8000
```

**Running Backend Tests**
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest tests/
```

**Frontend Setup**
```bash
cd frontend
npm install
```

**Running Frontend**
```bash
cd frontend
npm run dev
```

**Building Frontend**
```bash
cd frontend
npm run build
```

## 16. DEMO FLOW

**Recommended Demo Flow:**
1. **Dashboard**: "Welcome to BuildScout. Here you can see the impact we've had on preventing wasted development time across the organization."
2. **New Analysis**: "Let's submit a request to build something new. We will ask for an AI customer support assistant."
3. **Run the example problem**: Submit the prompt and let the agents run.
4. **Show Research**: "Notice how the AI didn't just write code; it first searched for existing tools we can use."
5. **Show Decisions**: "Here is the core intelligence. The AI chose to REUSE an open-source tool for search, but BUILD the custom escalation logic."
6. **Show Architecture**: "This is the final blueprint, completely documented with responsibilities and integration points."
7. **Show Validation**: "And the AI validated its own work, giving us an 85% architecture score."
8. **Show Agent Trace**: "We can see exactly what the agents did in the background and how long they took."
9. **Show Metrics**: "We have full observability over LLM latency and token usage."
10. **Return to Analyses**: "And everything is safely persisted to Lakebase, allowing teams to review historical decisions."
11. **Briefly show V1/V2 direction**: Navigate to the Roadmap/V2 specs on the UI to discuss the future vision. Conclude by explaining that while the current demo shows BuildScout as a standalone application, the future direction (V2) is to make this same intelligence callable by other AI coding and enterprise agents via an MCP Server.

## 17. PROJECT STRUCTURE

The repository is logically separated into frontend and backend applications:

- `backend/`: Python FastAPI application containing the LangGraph AI agents, Lakebase persistence (SQLAlchemy), and REST API.
  - `backend/agents/`: Individual AI agents (Research, Decision, Blueprint, etc.)
  - `backend/api/`: REST endpoints
  - `backend/database/`: SQLAlchemy models and repository logic
  - `backend/tests/`: Comprehensive pytest suite
- `frontend/`: React + Vite frontend application.
  - `frontend/src/pages/`: UI views matching the agent workflow
  - `frontend/src/components/`: Reusable React components
- `docs/`: Core project documentation, specifications, and architecture notes.

## 18. IMPORTANT DESIGN PRINCIPLES

- **Persistent analysis history**: Every analysis is saved to a relational database; we do not rely solely on ephemeral browser state.
- **Transparent agent reasoning**: The Agent Trace and Decisions pages expose exactly *why* the AI made a choice.
- **REUSE before BUILD**: The primary objective of the system is to prevent reinventing the wheel by prioritizing reuse of existing components.
- **Bounded execution**: The LangGraph workflow is strictly bounded and directed to prevent infinite AI loops.
- **Validation as a quality gate**: Architecture is not accepted blindly; it is scored and checked for consistency before presentation.
- **No fabricated metrics**: All data points in the system represent actual tokens processed, milliseconds elapsed, and real decisions made by the LLM.
