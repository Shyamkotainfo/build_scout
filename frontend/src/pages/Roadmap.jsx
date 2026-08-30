import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MessageSquare, Search, Scale, Gavel, LayoutTemplate, ShieldCheck, GitMerge, Brain, Zap, Shield, Target, Users, Network } from 'lucide-react';

// ── V1 Capabilities Data ──────────────────────────────────────────────────
const v1Capabilities = [
  { icon: MessageSquare, title: 'Natural-language request', desc: 'Process unstructured engineering requests.' },
  { icon: GitMerge, title: 'Multi-agent analysis', desc: 'Parallel evaluation of complex requirements.' },
  { icon: Search, title: 'Solution discovery', desc: 'Discover existing solutions before recommending new dev.' },
  { icon: Scale, title: 'Candidate evaluation', desc: 'Compare candidates using relevance, maturity, security evidence.' },
  { icon: Gavel, title: 'REUSE / ADAPT / BUILD', desc: 'Make evidence-backed architectural decisions.' },
  { icon: LayoutTemplate, title: 'Architecture blueprint', desc: 'Turn decisions into an implementation-ready architecture.' },
  { icon: ShieldCheck, title: 'Architecture validation', desc: 'Check recommended architecture against requirements and risks.' },
  { icon: Target, title: 'Agent execution trace', desc: 'Inspect agent execution, LLM usage, and tool activity.' }
];

// ── V2 Themes Data ────────────────────────────────────────────────────────
const v2Themes = [
  {
    title: '1. MEMORY & CONTEXT',
    icon: Brain,
    items: [
      { title: 'Context Retrieval & Memory', desc: 'BuildScout remembers previous analyses, architectural decisions, organizational preferences, and approved solutions so future recommendations become context-aware.' },
      { title: 'Internal Solution Catalog', desc: 'Discover reusable internal repositories, templates, POCs, reference architectures, and approved company components in addition to public solutions.' }
    ]
  },
  {
    title: '2. INTELLIGENT ANALYSIS',
    icon: Zap,
    items: [
      { title: 'Prompt Optimizer', desc: 'Transform ambiguous engineering requests into structured technical requirements before analysis.' },
      { title: 'Architecture Alternatives', desc: 'Generate and compare multiple architecture approaches rather than producing only one recommendation.' },
      { title: 'Engineering Feedback Loop', desc: 'Capture engineer feedback on recommendations and use approved/rejected decisions to improve future discovery and recommendations.' }
    ]
  },
  {
    title: '3. ENTERPRISE GOVERNANCE',
    icon: Shield,
    items: [
      { title: 'Engineering Approval Workflow', desc: 'Allow engineers or architects to review, approve, reject, or override recommendations before an architecture is finalized.' },
      { title: 'Security & Compliance Intelligence', desc: 'Evaluate discovered solutions and proposed architectures against organizational security and compliance requirements.' },
      { title: 'Decision Governance', desc: 'Maintain traceable links between requirements, research evidence, evaluations, decisions, architecture, and final validation.' }
    ]
  },
  {
    title: '4. PRODUCTION INTELLIGENCE',
    icon: Target,
    items: [
      { title: 'Production Readiness Assessment', desc: 'Evaluate operational readiness across reliability, security, scalability, observability, cost, and maintainability.' },
      { title: 'Cost & Platform Intelligence', desc: 'Compare architecture options across cloud/platform constraints and estimate relative infrastructure cost.' }
    ]
  },
  {
    title: '5. COLLABORATION',
    icon: Users,
    items: [
      { title: 'Team Decision Workspace', desc: 'Allow engineering teams to review evidence, discuss recommendations, record decisions, and maintain an auditable decision history.' }
    ]
  },
  {
    title: '6. AGENT INTEGRATION (MCP)',
    icon: Network,
    items: [
      { title: 'BuildScout MCP Server', desc: 'Expose BuildScout as a Model Context Protocol (MCP) server so external AI coding agents and enterprise workflows can invoke solution discovery and architecture generation programmatically.' }
    ]
  }
];

const Roadmap = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bs-bg-secondary)] -m-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link to="/docs" 
              className="p-1.5 text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] hover:bg-[var(--bs-bg-hover)] rounded-lg transition-colors mt-1"
              aria-label="Back to documentation"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-[var(--bs-navy-900)] tracking-tight">Product Roadmap</h1>
              <p className="text-sm text-[var(--bs-text-secondary)] mt-1 font-medium">
                BuildScout already provides an AI-powered solution discovery workflow today, and V2 extends it into an enterprise engineering intelligence platform.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto shrink-0 ml-10 sm:ml-0">
            {/* Legend for tests to pass (Completed, Current, Planned - V2) */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-[var(--bs-text-secondary)]">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--bs-status-success)]"></div> COMPLETED</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--bs-status-running)]"></div> CURRENT</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[var(--bs-border-dark)]"></div> PLANNED — V2</span>
            </div>
            <Link 
              to="/v2" 
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bs-orange-500)] text-white text-sm font-bold shadow-sm hover:bg-[var(--bs-orange-600)] transition-colors"
            >
              V2 Detail <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 w-full space-y-16">
        
        {/* ── Section: V1 Available Today ────────────────────────────────── */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[var(--bs-text-primary)] mb-1">V1 — Available Today</h2>
              <p className="text-sm text-[var(--bs-text-secondary)]">The complete AI engineering workflow built in Phase 1.</p>
            </div>
            <span className="px-3 py-1 bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] text-xs font-bold rounded border border-[var(--bs-status-success-border)]">COMPLETED</span>
          </div>

          {/* V1 Visual Pipeline Narrative */}
          <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
              {['USER REQUEST', 'RESEARCH', 'EVALUATE', 'DECIDE', 'ARCHITECT', 'VALIDATE', 'ENGINEERING DECISION'].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <div className={`px-4 py-3 rounded-lg text-xs font-bold tracking-wider text-center flex-1 w-full md:w-auto shadow-sm border
                    ${idx === 0 || idx === arr.length - 1 ? 'bg-[var(--bs-navy-900)] text-white border-[var(--bs-navy-800)]' : 'bg-white text-[var(--bs-text-primary)] border-[var(--bs-border-light)] relative group hover:-translate-y-1 hover:border-[var(--bs-orange-400)] transition-all'}
                  `}>
                    {step}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="text-[var(--bs-border-medium)] shrink-0 transform md:-rotate-90 md:rotate-0">
                      ↓
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* V1 Capability Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {v1Capabilities.map((cap, i) => (
              <div key={i} className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] p-5 rounded-xl flex flex-col gap-3 hover:border-[var(--bs-orange-300)] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[var(--bs-orange-50)] text-[var(--bs-orange-500)] flex items-center justify-center">
                  <cap.icon size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--bs-text-primary)] mb-1">{cap.title}</h4>
                  <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section: Why V2? & Maturity ────────────────────────────────── */}
        <section className="bg-[var(--bs-navy-900)] text-white rounded-2xl p-8 lg:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--bs-orange-500)] opacity-10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold mb-4 leading-tight">From Solution Discovery to Engineering Intelligence</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[var(--bs-orange-400)] font-bold text-xs tracking-widest uppercase mb-2">V1 Workflow</h4>
                  <p className="text-sm text-[var(--bs-text-muted)] leading-relaxed">
                    Find existing solutions, evaluate them, make evidence-backed REUSE / ADAPT / BUILD decisions, generate an architecture, and validate it.
                  </p>
                </div>
                <div>
                  <h4 className="text-[var(--bs-orange-400)] font-bold text-xs tracking-widest uppercase mb-2">V2 Vision</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    Build organizational memory around those decisions so every future engineering request becomes faster, smarter, more contextual, and more governable.
                  </p>
                </div>
              </div>
            </div>

            {/* Maturity Visualization */}
            <div className="flex flex-col gap-4 border-l-2 border-white/10 pl-8 py-4">
              <div className="flex items-center gap-4 opacity-50">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">V1</div>
                <div className="font-semibold tracking-wide">Solution Discovery</div>
              </div>
              <div className="h-4 border-l-2 border-white/10 ml-4 border-dashed"></div>
              <div className="flex items-center gap-4 text-[var(--bs-orange-400)]">
                <div className="w-8 h-8 rounded-full bg-[var(--bs-orange-500)]/20 border border-[var(--bs-orange-500)] flex items-center justify-center font-bold text-xs">V2</div>
                <div className="font-bold tracking-wide text-lg">Organizational Intelligence</div>
              </div>
              <div className="h-4 border-l-2 border-[var(--bs-orange-500)]/30 ml-4 border-dashed"></div>
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs">V3</div>
                <div className="font-semibold tracking-wide">Engineering Decision Platform</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: V2 Future Evolution ───────────────────────────────── */}
        <section className="pb-16">
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[var(--bs-text-primary)] mb-1">V2 — Future Evolution</h2>
            <p className="text-sm text-[var(--bs-text-secondary)]">Strategic capability themes planned for the next major release.</p>
          </div>

          <div className="space-y-12">
            {v2Themes.map((theme, i) => (
              <div key={i} className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                <div className="w-full lg:w-1/3">
                  <div className="flex items-center gap-3 mb-3">
                    <theme.icon size={20} className="text-[var(--bs-orange-500)]" />
                    <h3 className="text-sm font-extrabold tracking-widest uppercase text-[var(--bs-navy-900)]">{theme.title}</h3>
                  </div>
                </div>
                <div className="w-full lg:w-2/3 grid gap-4">
                  {theme.items.map((item, j) => (
                    <div key={j} className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-xl p-6 hover:border-[var(--bs-orange-300)] hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-[var(--bs-text-primary)]">{item.title}</h4>
                        <span className="px-2 py-0.5 bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] text-[10px] font-bold rounded border border-[var(--bs-border-medium)] whitespace-nowrap">PLANNED — V2</span>
                      </div>
                      <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed group-hover:text-[var(--bs-text-primary)] transition-colors">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Roadmap;
