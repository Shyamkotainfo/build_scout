# BuildSmart Frontend

This is the frontend developer dashboard for the BuildSmart project, built with Vite and React.

## Getting Started

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

The primary configuration variable is:
- `VITE_BACKEND_URL`: The URL of the BuildSmart FastAPI backend (default: `http://127.0.0.1:8000`).

### Running the Application

To start the development server:

```bash
npm run dev
```

### Main Pages and Workflows

1. **Dashboard** (`/`)
   - Visualizes system status, platform metrics (REUSE/ADAPT/BUILD components).
   - Syncs with `localStorage` to reflect the latest active analysis.
   - Highlights architecture decisions and workflow status at a glance.

2. **New Analysis** (`/new-analysis`)
   - Takes free-form user intent (e.g. "I want to build an AI customer-support assistant...").
   - Submits `POST /api/v1/analyses` to invoke the multi-agent backend.
   - Elegant "Execution State" loading screen without faking streaming progress.

3. **Analysis Result** (`/analyses/:analysisId`)
   - Robust read-only view of a completed analysis, breaking down:
     - Requirements & Component architecture
     - Agent candidate evaluations
     - Decision categorization (`REUSE` vs `BUILD`)
     - Complete System Blueprint
     - Engineering Validation report

4. **Research Explorer** (`/research/:analysisId`)
   - Engineering-focused workspace to explore all candidate options discovered during decomposition.
   - Contains a component sidebar and filtered candidate list.
   - Includes side-by-side comparison mode for up to 3 candidates.

5. **Architecture Blueprint** (`/architecture/:analysisId`)
   - Visual mapping of the proposed solution architecture.
   - Converts the blueprint's data flow into a sequential diagram.
   - Summarizes REUSE / ADAPT / BUILD metrics and details technology integrations.
   - Explicitly displays timeline implementation phases, assumptions, and risks.

6. **Agent Execution Trace** (`/traces/:analysisId`)
   - Observability panel for the complete agent execution pipeline.
   - Tracks Agent Execution status (`COMPLETED`, `FAILED`, `RUNNING`).
   - Surfaces individual LLM Tool Calls with pre-sanitized arguments.
   - Indicates where Fallbacks were engaged due to missing external providers.

7. **MCP & Tools Console** (`/mcp/:analysisId`)
   - Visual mapping of the MCP and Tool Gateway architectures.
   - Capability registry detailing usage patterns.
   - Summary of explicit tool usage vs native vs fallback calls.

8. **LLM Metrics Console** (`/metrics/:analysisId`)
   - Visual summary of token usage and breakdown of model metrics.
   - Cost and latency measurements.
   - Context compaction and retry reliability metrics.

### Running Tests

To run the frontend test suite (using Vitest):

```bash
npm run test
```

## Architecture Overview

The frontend serves as an independent visualization and control layer for the BuildSmart agentic workflow.

- **API Integration**: All API calls are routed through a centralized Axios client (`src/services/api_client.js`) which correctly normalizes errors into standard frontend states (e.g., separating `SERVICE_UNAVAILABLE` from general `NETWORK_FAILURE`).
- **Controlled Settings Persistence**: The UI includes a Settings configuration flow. It doesn't edit `.env` natively but relies on the backend `GET /api/v1/settings` and `PUT /api/v1/settings` endpoints to manage configuration securely. Secret values (e.g. `GROQ_API_KEY`) are masked before transmission to the browser.
- **Component Design**: Developed using Tailwind CSS with an emphasis on a developer dashboard aesthetic.
