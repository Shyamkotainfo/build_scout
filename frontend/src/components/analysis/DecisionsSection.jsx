import React from 'react';

const DecisionsSection = ({ decisions }) => {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Decisions</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const getDecisionStyle = (type) => {
    switch (type?.toUpperCase()) {
      case 'REUSE': return 'bg-green-900/40 text-green-400 border-green-800/60 ring-green-900/20';
      case 'ADAPT': return 'bg-yellow-900/40 text-yellow-400 border-yellow-800/60 ring-yellow-900/20';
      case 'BUILD': return 'bg-blue-900/40 text-blue-400 border-blue-800/60 ring-blue-900/20';
      default: return 'bg-slate-800 text-slate-300 border-slate-700 ring-slate-800/50';
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold leading-6 text-white mb-6 flex items-center gap-2">
        Architecture Decisions
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {decisions.map((decision, idx) => (
          <div 
            key={`${decision.component_id}-${idx}`} 
            className={`rounded-lg border bg-slate-800/80 shadow-md flex flex-col overflow-hidden ring-1 ring-inset ${getDecisionStyle(decision.decision).replace(/bg-[^\s]+|text-[^\s]+/, '')}`}
          >
            {/* Header */}
            <div className={`px-4 py-3 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50`}>
              <div className="font-mono text-sm font-medium text-slate-300 truncate pr-2">
                {decision.component_id}
              </div>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border tracking-wide shadow-sm ${getDecisionStyle(decision.decision)}`}>
                {decision.decision?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            
            {/* Content */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Implementation</span>
                <div className="text-base font-semibold text-slate-100">
                  {decision.selected_candidate_name || 'Custom Implementation'}
                </div>
              </div>

              <div className="mb-4 flex-1">
                <p className="text-sm text-slate-300">{decision.reason}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50 mb-4">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className={`h-full ${decision.confidence > 0.8 ? 'bg-green-500' : decision.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, decision.confidence * 100))}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-slate-300">{Math.round(decision.confidence * 100)}%</span>
                </div>
              </div>

              {/* Collapsible details could go here, for now just show them if they exist */}
              {(decision.risks?.length > 0 || decision.implementation_notes?.length > 0) && (
                <div className="space-y-3 bg-slate-900/40 rounded p-3 text-xs border border-slate-700/50">
                  {decision.risks?.length > 0 && (
                    <div>
                      <span className="font-semibold text-red-400/80 block mb-1">Risks</span>
                      <ul className="space-y-1">
                        {decision.risks.map((r, i) => (
                          <li key={i} className="text-slate-400 before:content-['•'] before:mr-1.5 before:text-slate-600">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {decision.implementation_notes?.length > 0 && (
                    <div>
                      <span className="font-semibold text-blue-400/80 block mb-1">Notes</span>
                      <ul className="space-y-1">
                        {decision.implementation_notes.map((n, i) => (
                          <li key={i} className="text-slate-400 before:content-['•'] before:mr-1.5 before:text-slate-600">{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionsSection;
