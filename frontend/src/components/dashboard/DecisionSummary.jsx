import React from 'react';

const DecisionSummary = ({ analysis }) => {
  if (!analysis || !analysis.decisions || analysis.decisions.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Decision Summary</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No decisions available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Decision Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysis.decisions.map((decision, idx) => (
          <div key={idx} className="rounded-lg border border-slate-700 bg-slate-800 p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-medium text-slate-300">{decision.component}</div>
              <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  decision.type === 'REUSE'
                    ? 'bg-green-900/40 text-green-400 border border-green-800/60'
                    : decision.type === 'ADAPT'
                    ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/60'
                    : 'bg-blue-900/40 text-blue-400 border border-blue-800/60'
                }`}
              >
                {decision.type}
              </span>
            </div>
            
            <div className="mb-4 flex-1">
              <div className="text-xs text-slate-500 mb-1">Selected:</div>
              <div className="text-sm text-white font-medium">{decision.selected_candidate || 'Custom Build'}</div>
            </div>

            <div className="pt-3 border-t border-slate-700 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500">Confidence</span>
                <span className="text-xs font-mono text-slate-300">{Math.round((decision.confidence || 0) * 100)}%</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-3" title={decision.reason}>
                {decision.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionSummary;
