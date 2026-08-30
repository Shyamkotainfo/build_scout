import React from 'react';
import { Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const AgentTraceSection = ({ agentHistory, traces, analysisId }) => {
  if (!agentHistory || agentHistory.length === 0) {
    return null;
  }

  // Fallback if traces aren't provided but history is
  const displayTraces = traces && traces.length > 0 
    ? traces 
    : agentHistory.map((node, i) => ({
        agent_name: node,
        status: 'COMPLETED',
        execution_order: i + 1,
        tool_calls: []
      }));

  return (
    <div className="flex flex-col mb-12">
      <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-6 flex items-center gap-2 uppercase">
        <Activity className="w-5 h-5 text-[var(--bs-orange-500)]" />
        Agent Execution Pipeline
      </h2>
      
      <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-8 mb-6 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {displayTraces.map((trace, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 ${
                  trace.status === 'COMPLETED' 
                    ? 'bg-[var(--bs-status-success)] text-[var(--bs-bg-primary)] border-[var(--bs-status-success)]'
                    : trace.status === 'FAILED'
                    ? 'bg-[var(--bs-status-critical)] text-[var(--bs-bg-primary)] border-[var(--bs-status-critical)]'
                    : 'bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-primary)] border-[var(--bs-border-light)]'
                }`}>
                  {trace.execution_order || i + 1}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--bs-text-secondary)] mt-3">
                  {trace.agent_name}
                </span>
                <span className="text-[10px] font-mono text-[var(--bs-text-tertiary)] mt-1">
                  {trace.tool_calls?.length || 0} tools
                </span>
              </div>
              
              {i < displayTraces.length - 1 && (
                <div className="w-16 h-0.5 bg-[var(--bs-border-light)] -mt-6"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mr-2">
          Observability Links:
        </span>
        <Link to={`/traces/${analysisId}`} className="text-sm text-[var(--bs-text-secondary)] hover:text-[var(--bs-orange-500)] flex items-center gap-1 transition-colors border border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)] px-3 py-1.5 rounded">
          <Activity className="w-4 h-4" /> Full Trace
        </Link>
        <Link to={`/metrics/${analysisId}`} className="text-sm text-[var(--bs-text-secondary)] hover:text-[var(--bs-orange-500)] flex items-center gap-1 transition-colors border border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)] px-3 py-1.5 rounded">
          <ExternalLink className="w-4 h-4" /> Usage Metrics
        </Link>
      </div>
    </div>
  );
};

export default AgentTraceSection;
