import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, Check } from 'lucide-react';

const RoadmapItem = ({ title, description, status, taskNumber, isV2 }) => {
  return (
    <div className="relative pl-8 md:pl-0">
      {/* Timeline connector */}
      <div className="hidden md:block absolute top-8 bottom-[-2rem] left-[50%] w-px bg-slate-800 -translate-x-1/2 last:hidden" />
      
      <div className={`md:flex items-center justify-between w-full mb-8 ${taskNumber % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
        
        {/* Timeline Node */}
        <div className="absolute left-0 md:left-1/2 w-6 h-6 rounded-full border-4 border-slate-950 bg-slate-800 -translate-x-[11px] md:-translate-x-1/2 mt-6 md:mt-0 z-10 flex items-center justify-center">
          {status === 'COMPLETED' ? (
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : status === 'CURRENT' ? (
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-600" />
          )}
        </div>

        {/* Content Card */}
        <div className="md:w-[45%]">
          <div className={`bg-slate-900 border rounded-xl p-6 transition-all hover:-translate-y-1 ${
            status === 'COMPLETED' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
            status === 'CURRENT' ? 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-blue-500/60' :
            'border-slate-800 hover:border-slate-600'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
                status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                status === 'CURRENT' ? 'bg-blue-500/10 text-blue-400' :
                'bg-slate-800 text-slate-400'
              }`}>
                {status === 'COMPLETED' && <Check size={12} />}
                {status === 'CURRENT' && <Clock size={12} />}
                {status === 'PLANNED' && <Circle size={12} />}
                {isV2 ? 'PLANNED — V2' : status}
              </span>
              <span className="text-slate-500 text-sm font-mono">
                {isV2 ? 'V2' : `Task ${taskNumber}`}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {/* Empty space for the other side */}
        <div className="hidden md:block md:w-[45%]" />
      </div>
    </div>
  );
};

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/docs" className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Product Roadmap</h1>
              <p className="text-sm text-slate-400">Past milestones, current focus, and future V2 plans.</p>
            </div>
          </div>
          <Link to="/v2" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold rounded-lg transition-colors">
            View V2 Detail
          </Link>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-16 relative">
        <div className="absolute top-0 bottom-0 left-[27px] md:left-1/2 w-px bg-slate-800 -translate-x-1/2" />
        
        <div className="space-y-4">
          <RoadmapItem 
            taskNumber={1}
            title="Frontend Foundation"
            status="COMPLETED"
            description="Established the React+Vite architecture, integrated standard UI components, and wired up the core API client for seamless backend communication."
          />
          <RoadmapItem 
            taskNumber={2}
            title="Developer Dashboard"
            status="COMPLETED"
            description="Built the primary developer-facing interface, including the sidebar navigation, layout shell, and dark aesthetic design system."
          />
          <RoadmapItem 
            taskNumber={3}
            title="New Analysis + Result"
            status="COMPLETED"
            description="Created the core capability to submit a new requirement and visualize the resulting architecture blueprint and solution recommendation."
          />
          <RoadmapItem 
            taskNumber={4}
            title="Research Explorer"
            status="COMPLETED"
            description="Exposed the internal logic of the Research and Evaluation agents, allowing users to deeply inspect candidate solutions and reasoning."
          />
          <RoadmapItem 
            taskNumber={5}
            title="Architecture + Agent Trace"
            status="COMPLETED"
            description="Visualized the multi-agent execution pipeline sequentially and rendered the intended system blueprint with data flows."
          />
          <RoadmapItem 
            taskNumber={6}
            title="MCP + LLM Observability"
            status="COMPLETED"
            description="Built dedicated observability consoles for token usage, latency metrics, and Model Context Protocol capability tracing."
          />
          <RoadmapItem 
            taskNumber={7}
            title="Documentation Center & V2 Spec"
            status="CURRENT"
            description="Building the integrated documentation portal, secure Markdown rendering, local search, and defining the V2 architectural roadmap."
          />
          <RoadmapItem 
            taskNumber={8}
            isV2={true}
            title="Human Feedback Loop"
            status="PLANNED"
            description="Allowing developers to provide corrections and feedback on BuildSmart's recommendations to improve the evaluation weights over time."
          />
          <RoadmapItem 
            taskNumber={9}
            isV2={true}
            title="Context Retrieval & Memory"
            status="PLANNED"
            description="Persisting past architectural decisions and organizational preferences so future analyses are context-aware out of the box."
          />
          <RoadmapItem 
            taskNumber={10}
            isV2={true}
            title="Prompt Optimizer"
            status="PLANNED"
            description="Adding a pre-processing step that rewrites ambiguous user requests into highly structured technical prompts before agent execution."
          />
          <RoadmapItem 
            taskNumber={11}
            isV2={true}
            title="Internal Solution Catalog"
            status="PLANNED"
            description="Expanding discovery beyond public open source to include internal company repositories, templates, and POCs."
          />
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
