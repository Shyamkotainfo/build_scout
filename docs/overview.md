# BuildSmart Overview

BuildSmart is an AI-powered solution discovery and reuse platform.

## The Problem
Teams often start building solutions from scratch without first discovering existing reusable assets. This leads to duplicated effort, fragmented architecture, and wasted engineering hours.

## The Solution
BuildSmart helps determine whether to **REUSE**, **ADAPT**, or **BUILD** a requested solution by executing a multi-agent architectural workflow.

When a user requests a solution, BuildSmart:
1. Translates the request into precise technical requirements.
2. Breaks the solution down into distinct components.
3. Researches existing internal or open-source candidates using external MCP integrations and native tools.
4. Evaluates the candidates against the requirements.
5. Makes a decisive recommendation (REUSE, ADAPT, or BUILD).
6. Assembles the recommendations into a comprehensive architectural blueprint.

## Multi-Agent Architecture
BuildSmart utilizes a sophisticated LangGraph-based multi-agent workflow. The workflow is orchestrated by a Supervisor agent that delegates specialized tasks to worker agents:
- **Decomposition Agent**: Breaks down requests.
- **Research Agent**: Discovers candidate solutions via the Unified Tool Gateway.
- **Evaluation Agent**: Scores candidates.
- **Decision Agent**: Selects the best candidate.
- **Blueprint Agent**: Generates the final architecture document.
- **Validation Agent**: Audits the result for consistency.

## Unified Tool Gateway
Rather than allowing agents to execute arbitrary code, BuildSmart routes all external capability requests through a secure **Unified Tool Gateway**. This gateway seamlessly manages connections to external Model Context Protocol (MCP) providers (like GitHub or Tavily) and falls back to safe local capabilities if external providers are unavailable.
