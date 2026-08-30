import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Database, Code, GitMerge, FileText, CheckCircle, Scale, ShieldAlert, Cpu, Share2, Layers, Search, Gavel } from 'lucide-react';

const EntityCard = ({ title, definition, fields, whyItMatters, connectsTo, demoComment, icon: Icon }) => (
  <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-xl p-8 lg:p-10 shadow-sm relative overflow-hidden group hover:border-[var(--bs-orange-300)] transition-colors">
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
      <Icon size={160} />
    </div>

    <div className="relative z-10 grid lg:grid-cols-12 gap-12">
      {/* Left Column: Core Definition */}
      <div className="lg:col-span-7">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[var(--bs-orange-50)] text-[var(--bs-orange-500)] rounded-xl border border-[var(--bs-orange-100)]">
            <Icon size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--bs-navy-900)] tracking-tight">{title}</h2>
        </div>
        <p className="text-lg font-medium text-[var(--bs-text-secondary)] mb-8 leading-relaxed">
          {definition}
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-3 border-b border-[var(--bs-border-light)] pb-2">What It Stores</h3>
            <ul className="space-y-2">
              {fields.map((field, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--bs-text-secondary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--bs-orange-500)] mt-1.5 shrink-0" />
                  <span className="font-mono text-xs mt-0.5">{field}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-3 border-b border-[var(--bs-border-light)] pb-2">Connects To</h3>
            <ul className="space-y-2">
              {connectsTo.map((rel, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-[var(--bs-text-primary)]">
                  <Share2 size={14} className="text-[var(--bs-text-tertiary)] mt-0.5" />
                  {rel}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
           <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Why It Matters</h3>
           <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">{whyItMatters}</p>
        </div>
      </div>

      {/* Right Column: Presenter Area */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="bg-[var(--bs-bg-secondary)] border-l-4 border-[var(--bs-navy-900)] p-6 lg:p-8 rounded-r-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-[var(--bs-status-running)] animate-pulse" />
             <h4 className="text-xs font-extrabold tracking-widest uppercase text-[var(--bs-navy-900)]">What To Say</h4>
          </div>
          <p className="text-lg text-[var(--bs-text-primary)] italic leading-relaxed font-medium">
            "{demoComment}"
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DataModel = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[var(--bs-bg-secondary)] -m-6 scroll-smooth">
      {/* ── Navigation Header ────────────────────────────────────────────── */}
      <div className="border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--bs-text-secondary)] hover:text-[var(--bs-navy-900)] transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex gap-4">
            <Link to="/trace" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--bs-text-secondary)] hover:text-[var(--bs-orange-500)] transition-colors">
              Agent Trace <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Viewport 1: Hero Visual ──────────────────────────────────────── */}
      <section className="bg-[var(--bs-bg-primary)] border-b border-[var(--bs-border-light)] pt-16 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[var(--bs-bg-secondary)] rounded-2xl mb-8 border border-[var(--bs-border-light)]">
            <Database size={32} className="text-[var(--bs-orange-500)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--bs-navy-900)] tracking-tight mb-4">
            Data Model
          </h1>
          <p className="text-lg md:text-xl text-[var(--bs-text-secondary)] max-w-3xl mx-auto font-medium">
            How BuildScout connects requirements, evidence, decisions, architecture, and validation.
          </p>
          <p className="text-sm text-[var(--bs-text-tertiary)] mt-2 font-medium">
            Every analysis creates a traceable chain from the original engineering request to the final recommendation.
          </p>

          <div className="mt-20 relative max-w-4xl mx-auto px-4 md:px-0">
             <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-8">BuildScout Data Flow</h3>
             <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0 relative z-10">
                
                {/* Visual Flow Pipeline */}
                {['Analysis', 'Requirements', 'Candidates', 'Evaluations', 'Decisions', 'Blueprint', 'Validation'].map((node, i, arr) => (
                  <React.Fragment key={node}>
                    <div className={`px-4 py-3 rounded-lg border text-xs font-bold tracking-wider shadow-sm transition-all duration-300 hover:-translate-y-1 z-20 w-full md:w-auto bg-white
                      ${i === 0 ? 'border-[var(--bs-orange-400)] border-2 text-[var(--bs-orange-600)]' : 'border-[var(--bs-border-medium)] text-[var(--bs-text-secondary)] hover:border-[var(--bs-navy-900)] hover:text-[var(--bs-navy-900)]'}`}>
                      {node}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-0.5 h-6 md:w-full md:h-0.5 bg-[var(--bs-border-medium)] mx-auto md:mx-0 z-10" />
                    )}
                  </React.Fragment>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* ── Viewport 2: Core Entities ────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 lg:px-12 py-24 space-y-24">
        
        <div className="text-center mb-16">
           <h2 className="text-3xl font-extrabold text-[var(--bs-navy-900)]">Core Database Entities</h2>
           <p className="text-[var(--bs-text-secondary)] mt-2">The exact physical tables supporting the investigation.</p>
        </div>

        <EntityCard
          title="Analysis"
          icon={Database}
          definition="The central record representing one BuildScout investigation."
          fields={['user_request', 'normalized_request', 'domain', 'validation_result', 'status']}
          whyItMatters="This is the parent context. Everything BuildScout discovers and decides during one investigation is permanently attached to this analysis ID."
          connectsTo={['Requirements', 'Blueprints', 'Agent Runs', 'LLM Calls']}
          demoComment="This is the parent object. Everything BuildScout discovers and decides during one investigation is connected back to this analysis."
        />

        <EntityCard
          title="Requirement & Component"
          icon={Layers}
          definition="The decomposed architectural needs extracted from the user's initial request."
          fields={['name', 'description', 'priority', 'component_type', 'technical_role']}
          whyItMatters="By breaking down the monolith request into discrete components, agents can independently research and evaluate specific technologies."
          connectsTo={['Analysis', 'Candidates', 'Decisions']}
          demoComment="Requirements are the bridge between what the user asked for and what the agents actually investigate. We decompose the prompt into actionable building blocks."
        />

        <EntityCard
          title="Candidate & Source"
          icon={Search}
          definition="Potential solutions discovered during the research phase."
          fields={['name', 'repository_url', 'license_spdx', 'stars', 'last_commit_at']}
          whyItMatters="This represents the real-world discovery mechanism, proving that recommendations are based on actual, maintained ecosystem projects."
          connectsTo={['Component', 'CandidateEvaluations']}
          demoComment="Before building from scratch, the system records existing solutions it found in the wild. This proves we actually did the research."
        />

        <EntityCard
          title="CandidateEvaluation & Evidence"
          icon={Scale}
          definition="The quantitative and qualitative scoring of a candidate, backed by verifiable evidence."
          fields={['health_score', 'security_score', 'overall_score', 'risk_level', 'evidence_type', 'claim', 'source_url']}
          whyItMatters="This ensures the system doesn't just guess. Every score is tied to specific scraped evidence (like a CVE report or commit history)."
          connectsTo={['Candidate']}
          demoComment="We don't just ask an LLM to guess what is best. We store the raw evidence and the individual scoring matrix so the evaluation is completely verifiable."
        />

        <EntityCard
          title="Decision"
          icon={Gavel}
          definition="The final recorded choice (REUSE, ADAPT, BUILD) for a specific architectural component."
          fields={['decision', 'confidence', 'integration_effort', 'rationale']}
          whyItMatters="The Decision table locks in the engineering recommendation and provides the 'why' before the system generates code or configuration."
          connectsTo={['Component', 'Candidate']}
          demoComment="This is the climax of the analysis. For every component, BuildScout makes a definitive, evidence-backed decision on whether to build, adapt, or reuse."
        />

        <EntityCard
          title="Blueprint"
          icon={FileText}
          definition="The generated system architecture derived from the sum of all decisions."
          fields={['architecture', 'integration_flow', 'data_flow', 'technology_stack']}
          whyItMatters="This transforms isolated decisions into a cohesive implementation plan."
          connectsTo={['Analysis']}
          demoComment="The Blueprint takes all those component-level decisions and wires them together into a complete, implementable architecture."
        />
      </section>


      {/* ── Viewport 3: Traceability & Observability ─────────────────────── */}
      <section className="bg-[var(--bs-navy-900)] text-white py-24 border-t-4 border-[var(--bs-orange-500)]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
           <div>
             <h2 className="text-3xl font-extrabold mb-6 tracking-tight">Why Traceability Matters</h2>
             <p className="text-lg text-[var(--bs-text-muted)] mb-8 leading-relaxed">
               BuildScout is not simply generating one final answer out of a black box LLM call. It preserves the exact chain of thought, agent actions, tool executions, and data retrieval that led to the recommendation.
             </p>
             <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm">
                <h4 className="text-xs font-extrabold tracking-widest uppercase text-[var(--bs-orange-400)] mb-3">What To Say</h4>
                <p className="text-lg font-medium italic leading-relaxed text-white">
                  "The important thing here is that the final recommendation is not a black box. We can trace how it was produced."
                </p>
             </div>
           </div>
           
           <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 p-5 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                   <h4 className="font-bold">AgentRun</h4>
                   <p className="text-sm text-gray-400 mt-1">Tracks agent execution and status.</p>
                </div>
                <Cpu className="text-[var(--bs-orange-400)] opacity-50" size={24} />
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                   <h4 className="font-bold">ToolCall</h4>
                   <p className="text-sm text-gray-400 mt-1">Records MCP parameters and tool latency.</p>
                </div>
                <Code className="text-[var(--bs-orange-400)] opacity-50" size={24} />
              </div>
              <div className="bg-white/5 border border-white/10 p-5 rounded-lg flex items-center justify-between shadow-sm">
                <div>
                   <h4 className="font-bold">LLMCall</h4>
                   <p className="text-sm text-gray-400 mt-1">Stores token metrics, latency, and retries.</p>
                </div>
                <Layers className="text-[var(--bs-orange-400)] opacity-50" size={24} />
              </div>
           </div>
        </div>
      </section>

      {/* ── Viewport 4: The Process Narrative ────────────────────────────── */}
      <section className="bg-[var(--bs-bg-primary)] py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-[var(--bs-navy-900)] mb-4">From Request to Engineering Decision</h2>
            <p className="text-lg text-[var(--bs-text-secondary)]">How the data model is populated step by step.</p>
          </div>

          <div className="relative border-l-2 border-[var(--bs-border-light)] ml-6 md:ml-0 md:border-l-0 max-w-4xl mx-auto">
            {/* Steps */}
            {[
              { step: 1, title: 'UNDERSTAND THE REQUEST', whatHappens: 'BuildScout receives the engineering problem.', dataCreated: 'Analysis + Requirements' },
              { step: 2, title: 'DISCOVER EXISTING SOLUTIONS', whatHappens: 'Research agents search for reusable solutions.', dataCreated: 'Candidates + Research evidence' },
              { step: 3, title: 'EVALUATE', whatHappens: 'Candidates are compared.', dataCreated: 'Evaluations' },
              { step: 4, title: 'DECIDE', whatHappens: 'Architect agent recommends REUSE, ADAPT, or BUILD for each architectural component.', dataCreated: 'Decisions' },
              { step: 5, title: 'ARCHITECT AND VALIDATE', whatHappens: 'Decisions are assembled into an architecture and validated against risks.', dataCreated: 'Blueprint + Validation' }
            ].map((item, index) => (
              <div key={index} className="mb-12 relative md:flex md:items-center md:justify-center">
                 <div className="absolute -left-[25px] md:relative md:left-0 md:w-12 md:h-12 w-12 h-12 rounded-full bg-[var(--bs-bg-primary)] border-2 border-[var(--bs-border-light)] flex items-center justify-center font-extrabold text-lg text-[var(--bs-navy-900)] shadow-sm z-10">
                    {item.step}
                 </div>
                 
                 <div className="ml-10 md:ml-8 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-6 md:w-[600px] shadow-sm relative overflow-hidden group hover:border-[var(--bs-orange-300)] transition-colors">
                   {/* Background connection line for desktop */}
                   <div className="hidden md:block absolute top-1/2 -left-8 w-8 h-0.5 bg-[var(--bs-border-light)] -z-10" />
                   
                   <h3 className="font-extrabold tracking-widest text-[var(--bs-navy-900)] text-sm mb-4 uppercase">{item.title}</h3>
                   <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                       <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1 block">What happens</span>
                       <p className="text-sm text-[var(--bs-text-secondary)]">{item.whatHappens}</p>
                     </div>
                     <div className="bg-[var(--bs-orange-50)] rounded-lg p-3 border border-[var(--bs-orange-100)]">
                       <span className="text-[10px] font-bold text-[var(--bs-orange-600)] uppercase tracking-widest mb-1 block">Data created</span>
                       <p className="text-sm font-semibold text-[var(--bs-orange-800)]">{item.dataCreated}</p>
                     </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer Summary ───────────────────────────────────────────────── */}
      <section className="bg-[var(--bs-bg-secondary)] border-t border-[var(--bs-border-light)] py-20">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12 text-center">
          <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--bs-text-tertiary)] mb-6">The BuildScout Data Model in One Sentence</h3>
          <p className="text-2xl font-bold text-[var(--bs-navy-900)] leading-tight italic max-w-3xl mx-auto">
            "BuildScout maintains a traceable chain from engineering requirements to research evidence, engineering decisions, architecture, and validation."
          </p>
        </div>
      </section>
      
    </div>
  );
};

export default DataModel;
