# BuildScout — Competitive Landscape

## Executive Summary

BuildScout is positioned as an **agentic solution discovery and reuse platform**: before engineering teams build something new, it researches what already exists, evaluates candidates, checks technical/security/licensing fit, makes **REUSE / ADAPT / BUILD** decisions, and produces a validated blueprint.

## Competitor Comparison

| Product / Tool | Primary Focus | OSS Discovery | Agents / Workflow | Architecture | License / Security | Memory / Context |
|---|---|---:|---:|---:|---:|---:|
| **BuildScout** | Solution discovery, reuse decisions, blueprint | **Strong** | **Multi-agent** | **Strong** | **Strong** | V1 persistence; V2 memory planned |
| **Reposeek** | Reusable open-source repository discovery | **Strong** | AI-assisted | Limited | Partial | Limited |
| **OSSReco** | Open-source software recommendation | **Strong** | AI recommendation | Limited | Partial | Limited |
| **StackForMe** | Technology / stack recommendation | Partial | AI recommendation | **Strong** | Partial | Limited |
| **KATACHI** | AWS architecture generation/evaluation | Limited | AI-driven | **Strong** | **Strong** | Limited |
| **CloudPilot AI** | AWS architecture/deployment assistance | Limited | AI-driven | **Strong** | **Strong** | Partial |
| **Architext** | AI architecture/project planning | Limited | AI-assisted | **Strong** | Partial | Partial |
| **GitHub Copilot** | AI coding/development assistance | Repository-aware | **Agentic** | Not primary | Security/governance | Strong context |
| **Amazon Q Developer** | Cloud/developer assistance | Partial | **Agentic** | **Strong** | **Strong** | Context-based |
| **Sourcegraph Cody / Amp** | Codebase understanding/coding | Code-focused | Agentic | Not primary | Security/governance | **Strong context** |

> Competitor capabilities change over time. This is a demo/strategy comparison, not a permanent product specification.

## Feature Comparison

| Capability | BuildScout | Reposeek | OSSReco | StackForMe | KATACHI | CloudPilot | Architext |
|---|---:|---:|---:|---:|---:|---:|---:|
| Natural-language request | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Requirement decomposition | **✓** | Partial | Partial | Partial | Partial | Partial | ✓ |
| OSS discovery | **✓** | **✓** | **✓** | Partial | Limited | Limited | Limited |
| Web research | **✓** | Partial | Partial | Partial | Partial | ✓ | Partial |
| Candidate evaluation | **✓** | Partial | ✓ | ✓ | ✓ | ✓ | Partial |
| License evaluation | **✓** | Partial | Partial | Partial | Partial | ✓ | Partial |
| Security evaluation | **✓** | Partial | Partial | Partial | **✓** | **✓** | Partial |
| Technology recommendation | **✓** | Limited | ✓ | **✓** | ✓ | ✓ | ✓ |
| Architecture research | **✓** | Limited | Limited | ✓ | **✓** | **✓** | **✓** |
| REUSE / ADAPT / BUILD | **✓** | Partial | Partial | Limited | Limited | Limited | Limited |
| Solution comparison | **✓** | Partial | ✓ | ✓ | Partial | ✓ | Partial |
| Blueprint generation | **✓** | Limited | Limited | Partial | **✓** | **✓** | **✓** |
| Validation | **✓** | Limited | Limited | Partial | **✓** | **✓** | Partial |
| MCP/tool gateway | **✓** | Not core | Not core | Not core | Not core | Provider-specific | Not core |
| Multi-agent workflow | **✓** | Limited | Limited | Limited | AI workflow | AI workflow | AI workflow |
| Persistent analysis | **✓** | Limited | Limited | Limited | Limited | Partial | Partial |
| Human feedback loop | V2 | Limited | Limited | Limited | Limited | Partial | Partial |
| Semantic memory | V2 | Limited | Limited | Limited | Limited | Partial | Partial |

## BuildScout's Architectural Difference

Current V1:

```text
User Request
    ↓
Prompt Optimizer
    ↓
Supervisor
    ↓
Decomposition
    ↓
Research
    ↓
Evaluation
    ↓
Decision
    ↓
Blueprint
    ↓
Validation
    ↓
Lakebase + API
```

Research/tool execution:

```text
Agent
  ↓
Unified Tool Gateway
  ↓
Tool Registry
  ↓
MCP or Local Tool
  ↓
Normalized Result
```

Current capabilities include:

- `github.search`
- `web.search`
- `security.get`
- `license.get`
- `aws.documentation`
- `cloud.architecture`

This means MCP is the **execution layer**, not the product itself.

## BuildScout vs Reposeek

Reposeek is particularly close to BuildScout's **"find existing solutions before building"** idea.

The difference is the decision depth:

```text
Repository discovery
        ↓
Candidate evaluation
        ↓
Security
        ↓
License
        ↓
Comparison
        ↓
REUSE / ADAPT / BUILD
        ↓
Architecture
        ↓
Validation
```

**Positioning:** Reposeek-style products help answer *"What exists?"*; BuildScout aims to answer *"What should we reuse, adapt, or build, and why?"*

## BuildScout vs Architecture Tools

Architecture-focused tools such as KATACHI, CloudPilot AI and Architext overlap with BuildScout's architecture and validation stages.

BuildScout starts one step earlier:

```text
Requirements
    ↓
What already exists?
    ↓
Can it be reused?
    ↓
Can it be adapted?
    ↓
What must be built?
    ↓
Architecture
    ↓
Validation
```

This makes architecture a **consequence of the reuse/build decision**, rather than always starting with a greenfield architecture.

## BuildScout vs Coding Agents

Coding agents primarily answer:

> "How can AI help me write software?"

BuildScout answers:

> **"What should we build in the first place, and what can we reuse before implementation begins?"**

The two can be complementary:

```text
BuildScout
    ↓
Validated Blueprint
    ↓
Coding Agent
    ↓
Implementation
```

## Core Hackathon Differentiator

The strongest positioning should not be:

> "BuildScout is another AI architecture generator."

Instead:

> **"BuildScout is an AI solution discovery and reuse engine that determines what should be reused, adapted, or built before engineering teams start implementation."**

The central decision is:

```text
                 Can we reuse?
                      ↓
              ┌───────┴───────┐
              ↓               ↓
            YES               NO
              ↓               ↓
           REUSE            ADAPT?
                              ↓
                       ┌──────┴──────┐
                       ↓             ↓
                      YES            NO
                       ↓             ↓
                     ADAPT          BUILD
```

## Why This Matters

Traditional engineering flow:

```text
Business Requirement
        ↓
Design
        ↓
Coding
```

BuildScout introduces a research/decision layer:

```text
Business Requirement
        ↓
Understand
        ↓
Search Existing Solutions
        ↓
Evaluate
        ↓
Security + License
        ↓
Compare
        ↓
REUSE / ADAPT / BUILD
        ↓
Architecture
        ↓
Validation
        ↓
Implementation
```

Potential value:

- reduce duplicated engineering effort
- reduce unnecessary greenfield development
- improve technology choices
- surface license risks earlier
- surface security risks earlier
- reduce architecture rework

## V1 vs V2

### V1 — Current Core

- Multi-agent LangGraph workflow
- Unified Tool Gateway
- GitHub MCP
- Tavily MCP
- Local tools and fallbacks
- Lakebase persistence
- FastAPI
- LLM retry framework
- Token/cost/latency observability
- Lightweight Prompt Optimizer
- Project/documentation memory

### V2 — Future Intelligence

- Runtime Skills
- Skill Planner
- Memory/context retrieval
- Historical solution retrieval
- Human feedback
- Feedback-driven recommendations
- Advanced prompt optimization
- Skill versioning
- Skill composition
- Personalized recommendations
- Additional MCP/tool providers

## V2 Vision

```text
                         User
                          ↓
                  Prompt Optimizer
                          ↓
                  Memory Retrieval
                          ↓
                    Skill Planner
                          ↓
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
      Discovery       Evaluation       Architecture
        Skill            Skill             Skill
          ↓               ↓                ↓
          └───────────────┼────────────────┘
                          ↓
                    Reuse Decision
                          ↓
                       Blueprint
                          ↓
                      Validation
                          ↓
                    Human Feedback
                          ↓
                       Memory
                          ↓
                 Future Analysis
```

This creates the future loop:

> **Analyze → Recommend → Get Feedback → Remember → Improve.**

## Recommended Demo Story

1. Give BuildScout a real requirement.
2. Show requirement/component decomposition.
3. Show GitHub + web research through the Unified Tool Gateway.
4. Show candidate evaluation, security and license information.
5. Show **REUSE / ADAPT / BUILD** decisions.
6. Show the generated architecture blueprint.
7. Show validation and risks.

### Final demo statement

> **"Instead of asking AI to build faster, BuildScout first asks whether we should build at all."**

## Final Positioning

BuildScout is not primarily:

- an AI coding assistant
- an architecture diagram generator
- an OSS search engine
- a technology recommender
- an MCP client

BuildScout is:

> **An agentic solution discovery and reuse platform that researches existing capabilities, evaluates them across technical, security and licensing dimensions, makes REUSE / ADAPT / BUILD decisions, and generates a validated implementation blueprint.**
