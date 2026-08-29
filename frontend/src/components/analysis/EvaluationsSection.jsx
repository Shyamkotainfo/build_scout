import React from 'react';

const EvaluationsSection = ({ evaluations }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Evaluations</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]' };
    if (score >= 70) return { label: 'Good', color: 'bg-[var(--bs-status-running-light)] text-[var(--bs-status-running)] border-[var(--bs-status-running-border)]' };
    if (score >= 50) return { label: 'Moderate', color: 'bg-[var(--bs-status-warning-light)] text-[var(--bs-status-warning)] border-[var(--bs-status-warning-border)]' };
    return { label: 'Weak', color: 'bg-[var(--bs-status-critical-light)] text-[var(--bs-status-critical)] border-[var(--bs-status-critical-border)]' };
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Evaluations</h2>
      <div className="space-y-4">
        {evaluations.map((evalData, idx) => {
          const badge = getScoreBadge(evalData.score);
          
          return (
            <div key={`${evalData.component_id}-${idx}`} className="rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-[var(--bs-text-primary)]">{evalData.candidate_name}</h3>
                    <span className="text-[var(--bs-text-secondary)] text-sm">→</span>
                    <span className="text-sm font-mono text-[var(--bs-text-tertiary)]">{evalData.component_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[var(--bs-text-secondary)] uppercase font-semibold tracking-wider">Score</span>
                    <span className="text-xl font-bold text-[var(--bs-text-primary)] leading-none">{evalData.score}</span>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-[var(--bs-text-secondary)]">{evalData.reasoning}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 border-t border-[var(--bs-border-light)] pt-4">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Concerns</h4>
                  {evalData.concerns && evalData.concerns.length > 0 ? (
                    <ul className="space-y-1">
                      {evalData.concerns.map((c, i) => (
                        <li key={i} className="text-sm text-[var(--bs-status-warning)] flex items-start gap-2 before:content-['•'] before:text-[var(--bs-status-warning)]">
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-[var(--bs-text-tertiary)]">None identified.</span>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Missing Evidence</h4>
                  {evalData.missing_evidence && evalData.missing_evidence.length > 0 ? (
                    <ul className="space-y-1">
                      {evalData.missing_evidence.map((m, i) => (
                        <li key={i} className="text-sm text-[var(--bs-text-secondary)] flex items-start gap-2 before:content-['•'] before:text-[var(--bs-text-tertiary)]">
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-[var(--bs-text-tertiary)]">None.</span>
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
