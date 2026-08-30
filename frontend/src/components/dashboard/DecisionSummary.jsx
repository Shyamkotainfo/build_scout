import React from 'react';

const DecisionSummary = ({ analysis }) => {
  if (!analysis) return null;

  const { decisions = [] } = analysis;

  let reuseCount = 0;
  let adaptCount = 0;
  let buildCount = 0;
  
  decisions.forEach(d => {
    const type = (d.decision_type || '').toUpperCase();
    if (type === 'REUSE') reuseCount++;
    if (type === 'ADAPT') adaptCount++;
    if (type === 'BUILD') buildCount++;
  });

  return (
    <div className="rounded-lg border bg-[var(--bs-bg-primary)] border-[var(--bs-border-light)] p-6 shadow-sm">
      <h3 className="text-xs font-bold tracking-widest text-[var(--bs-text-tertiary)] uppercase mb-6">
        Solution Strategy
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REUSE */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-5 bg-[var(--bs-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--bs-status-success)]"></div>
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-wider">
                Reuse
              </span>
              <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{reuseCount}</span>
            </div>
            <p className="text-xs text-[var(--bs-text-tertiary)]">
              Existing solutions
            </p>
          </div>
        </div>

        {/* ADAPT */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-5 bg-[var(--bs-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--bs-status-warning)]"></div>
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-wider">
                Adapt
              </span>
              <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{adaptCount}</span>
            </div>
            <p className="text-xs text-[var(--bs-text-tertiary)]">
              Modify proven solutions
            </p>
          </div>
        </div>

        {/* BUILD */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-5 bg-[var(--bs-bg-secondary)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--bs-orange-500)]"></div>
          <div className="pl-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-wider">
                Build
              </span>
              <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{buildCount}</span>
            </div>
            <p className="text-xs text-[var(--bs-text-tertiary)]">
              New implementation required
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DecisionSummary;
