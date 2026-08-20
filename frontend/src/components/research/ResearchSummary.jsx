import React from 'react';

const ResearchSummary = ({ analysis }) => {
  if (!analysis) return null;

  const numComponents = analysis.components?.length || 0;
  const numCandidates = analysis.candidates?.length || 0;
  const numEvaluations = analysis.evaluations?.length || 0;
  const numDecisions = analysis.decisions?.length || 0;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-slate-700">
        <div className="px-4 first:pl-0 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Components Researched</span>
          <span className="text-2xl font-bold text-white">{numComponents}</span>
        </div>
        <div className="px-4 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Candidates Discovered</span>
          <span className="text-2xl font-bold text-blue-400">{numCandidates}</span>
        </div>
        <div className="px-4 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Evaluations</span>
          <span className="text-2xl font-bold text-yellow-400">{numEvaluations}</span>
        </div>
        <div className="px-4 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Decisions</span>
          <span className="text-2xl font-bold text-green-400">{numDecisions}</span>
        </div>
      </div>
    </div>
  );
};

export default ResearchSummary;
