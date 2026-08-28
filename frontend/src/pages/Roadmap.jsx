import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  COMPLETED: {
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cardBorder: 'border-emerald-200 hover:border-emerald-300',
    nodeOuter: 'border-emerald-400 bg-white',
    nodeDot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  CURRENT: {
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    cardBorder: 'border-blue-300 hover:border-blue-400 shadow-sm',
    nodeOuter: 'border-blue-500 bg-white shadow-[0_0_0_4px_rgba(59,130,246,0.12)]',
    nodeDot: 'bg-blue-500 animate-pulse',
    icon: Clock,
  },
  PLANNED: {
    badge: 'bg-slate-100 text-slate-500 border border-slate-200',
    cardBorder: 'border-slate-200 hover:border-slate-300',
    nodeOuter: 'border-slate-300 bg-white',
    nodeDot: 'bg-slate-300',
    icon: Circle,
  },
};

// ── RoadmapItem — renders card always to the side the test can find once ────
const RoadmapItem = ({ title, description, status, taskNumber, isV2 }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PLANNED;
  const displayLabel = isV2 ? 'PLANNED — V2' : status; // Tests assert exact: 'COMPLETED', 'CURRENT', 'PLANNED — V2'
  const displayBadge = isV2 ? STATUS_CONFIG.PLANNED.badge : cfg.badge;
  const versionLabel = isV2 ? 'V2' : `Task ${String(taskNumber).padStart(2, '0')}`;
  // Even taskNumbers go to right side on desktop
  const alignRight = taskNumber % 2 === 0;

  return (
    <div className="relative flex items-start mb-10">
      {/* ── Desktop left spacer (when card is on right) ── */}
      <div className={`hidden md:block md:w-[46%] ${alignRight ? '' : 'invisible'}`} />

      {/* ── Timeline node ── */}
      <div className="relative z-10 flex-shrink-0 flex items-start justify-center w-8 md:w-[8%] pt-5">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${cfg.nodeOuter}`}>
          <div className={`w-2 h-2 rounded-full ${cfg.nodeDot}`} />
        </div>
      </div>

      {/* ── Card — always in document flow, positioned via flex order ── */}
      <div className={`flex-1 md:w-[46%] ${alignRight ? '' : 'md:order-first md:pr-8'} pl-4 md:pl-0 ${alignRight ? 'md:pl-8' : ''}`}>
        <div className={`bg-white rounded-xl border p-5 transition-all duration-200 ${cfg.cardBorder}`}>
          {/* Card header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${displayBadge}`}>
              {status === 'COMPLETED' && <CheckCircle2 size={11} aria-hidden="true" />}
              {status === 'CURRENT' && <Clock size={11} aria-hidden="true" />}
              {status === 'PLANNED' && <Circle size={11} aria-hidden="true" />}
              <span>{displayLabel}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 shrink-0 mt-0.5">{versionLabel}</span>
          </div>
          <h3 className="text-[0.9375rem] font-bold text-[var(--bs-navy-900)] mb-1.5 leading-snug">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

// ── Legend chip ──────────────────────────────────────────────────────────────
const LegendChip = ({ dotClass, label }) => (
  <div className="flex items-center gap-2 text-sm text-slate-600">
    <div className={`w-3 h-3 rounded-full ${dotClass}`} />
    {label}
  </div>
);

// ── Roadmap page ─────────────────────────────────────────────────────────────
const Roadmap = () => {
  const items = [
    { taskNumber: 1,  title: 'Frontend Foundation',            status: 'COMPLETED', isV2: false, description: 'Established the React+Vite architecture, integrated standard UI components, and wired up the core API client for seamless backend communication.' },
    { taskNumber: 2,  title: 'Developer Dashboard',            status: 'COMPLETED', isV2: false, description: 'Built the primary developer-facing interface, including the sidebar navigation, layout shell, and dark aesthetic design system.' },
    { taskNumber: 3,  title: 'New Analysis + Result',          status: 'COMPLETED', isV2: false, description: 'Created the core capability to submit a new requirement and visualize the resulting architecture blueprint and solution recommendation.' },
    { taskNumber: 4,  title: 'Research Explorer',              status: 'COMPLETED', isV2: false, description: 'Exposed the internal logic of the Research and Evaluation agents, allowing users to deeply inspect candidate solutions and reasoning.' },
    { taskNumber: 5,  title: 'Architecture + Agent Trace',     status: 'COMPLETED', isV2: false, description: 'Visualized the multi-agent execution pipeline sequentially and rendered the intended system blueprint with data flows.' },
    { taskNumber: 6,  title: 'MCP + LLM Observability',        status: 'COMPLETED', isV2: false, description: 'Built dedicated observability consoles for token usage, latency metrics, and Model Context Protocol capability tracing.' },
    { taskNumber: 7,  title: 'Documentation Center & V2 Spec', status: 'CURRENT',   isV2: false, description: 'Building the integrated documentation portal, secure Markdown rendering, local search, and defining the V2 architectural roadmap.' },
    { taskNumber: 8,  title: 'Human Feedback Loop',            status: 'PLANNED',   isV2: true,  description: "Allowing developers to provide corrections and feedback on BuildSmart's recommendations to improve the evaluation weights over time." },
    { taskNumber: 9,  title: 'Context Retrieval & Memory',     status: 'PLANNED',   isV2: true,  description: 'Persisting past architectural decisions and organizational preferences so future analyses are context-aware out of the box.' },
    { taskNumber: 10, title: 'Prompt Optimizer',               status: 'PLANNED',   isV2: true,  description: 'Adding a pre-processing step that rewrites ambiguous user requests into highly structured technical prompts before agent execution.' },
    { taskNumber: 11, title: 'Internal Solution Catalog',      status: 'PLANNED',   isV2: true,  description: 'Expanding discovery beyond public open source to include internal company repositories, templates, and POCs.' },
  ];

  return (
    <div className="min-h-full bg-white -m-6 pb-24">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/docs"
              className="p-1.5 text-slate-400 hover:text-[var(--bs-navy-900)] hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Back to docs"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--bs-navy-900)] tracking-tight">
                Product Roadmap
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Past milestones, current focus, and future V2 plans.
              </p>
            </div>
          </div>

          <Link
            to="/v2"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[var(--bs-navy-900)] hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            V2 Detail <ExternalLink size={13} className="text-slate-400" />
          </Link>
        </div>

        {/* Status legend */}
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pb-4 flex items-center gap-6">
          <LegendChip dotClass="bg-emerald-500" label="Completed" />
          <LegendChip dotClass="bg-blue-500" label="Current" />
          <LegendChip dotClass="bg-slate-300" label="Planned — V2" />
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-14 relative">
        {/* Vertical line — positioned at left for mobile, center for desktop */}
        <div className="absolute top-14 bottom-14 left-[calc(1.5rem+4px)] md:left-1/2 w-px bg-slate-200 -translate-x-1/2 pointer-events-none" />
        <div>
          {items.map((item) => (
            <RoadmapItem key={item.taskNumber} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
