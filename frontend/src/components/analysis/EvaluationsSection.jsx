import React from 'react';

const EvaluationsSection = ({ evaluations }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Evaluations</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-900/40 text-green-400 border-green-800/60' };
    if (score >= 70) return { label: 'Good', color: 'bg-blue-900/40 text-blue-400 border-blue-800/60' };
    if (score >= 50) return { label: 'Moderate', color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/60' };
    return { label: 'Weak', color: 'bg-red-900/40 text-red-400 border-red-800/60' };
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Evaluations</h2>
      <div className="space-y-4">
        {evaluations.map((evalData, idx) => {
          const badge = getScoreBadge(evalData.score);
          
          return (
            <div key={`${evalData.component_id}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-800 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-200">{evalData.candidate_name}</h3>
                    <span className="text-slate-500 text-sm">→</span>
                    <span className="text-sm font-mono text-slate-400">{evalData.component_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Score</span>
                    <span className="text-xl font-bold text-white leading-none">{evalData.score}</span>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm prose-invert max-w-none mb-4">
                <p className="text-slate-300">{evalData.reasoning}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-slate-700/50 pt-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Concerns</h4>
                  {evalData.concerns && evalData.concerns.length > 0 ? (
                    <ul className="space-y-1">
                      {evalData.concerns.map((c, i) => (
                        <li key={i} className="text-sm text-yellow-400/90 flex items-start gap-2 before:content-['•'] before:text-yellow-600">
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-slate-500">None identified.</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Missing Evidence</h4>
                  {evalData.missing_evidence && evalData.missing_evidence.length > 0 ? (
                    <ul className="space-y-1">
                      {evalData.missing_evidence.map((m, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2 before:content-['•'] before:text-slate-600">
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-slate-500">None.</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluationsSection;
