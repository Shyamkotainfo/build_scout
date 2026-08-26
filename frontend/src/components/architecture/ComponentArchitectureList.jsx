import React from 'react';
import { Layers } from 'lucide-react';

const ComponentArchitectureList = ({ blueprint, decisions }) => {
  if (!blueprint?.components || blueprint.components.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold leading-6 text-white mb-4">Component Architecture</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No components available.</p>
        </div>
      </div>
    );
  }

  const getDecisionStyle = (type) => {
    switch (type?.toUpperCase()) {
      case 'REUSE': return 'bg-green-900/40 text-green-400 border-green-800/60';
      case 'ADAPT': return 'bg-yellow-900/40 text-yellow-400 border-yellow-800/60';
      case 'BUILD': return 'bg-blue-900/40 text-blue-400 border-blue-800/60';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold leading-6 text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-slate-400" /> Component Architecture
        </h2>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-800">
          {blueprint.components.map((comp) => {
            const decisionData = decisions?.find(d => d.component_id === comp.component_id);
            const decisionType = decisionData?.decision?.toUpperCase();
            
            return (
              <div key={comp.component_id} className="p-6 hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-200">{comp.component_name}</h3>
                      {decisionType && (
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${getDecisionStyle(decisionType)}`}>
                          {decisionType}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-500">ID: {comp.component_id}</span>
                  </div>
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Technology</span>
                    <span className="inline-flex items-center rounded bg-blue-900/30 px-2.5 py-1 text-sm font-medium text-blue-400 border border-blue-800/50">
                      {comp.technology || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Responsibility</h4>
                    <p className="text-sm text-slate-300">{comp.responsibility}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Integration</h4>
                    <p className="text-sm text-slate-400">{comp.integration}</p>
                  </div>
                </div>

                {decisionData && (
                  <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 rounded p-4 border border-slate-800">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Decision Reason</h4>
                      <p className="text-sm text-slate-300">{decisionData.reason}</p>
                    </div>
                    {decisionData.risks?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-2">Risks</h4>
                        <ul className="space-y-1">
                          {decisionData.risks.map((r, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-1 before:content-['•'] before:text-slate-600">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComponentArchitectureList;
