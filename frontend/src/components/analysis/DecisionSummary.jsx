import React from 'react';

const DecisionSummary = ({ decisions }) => {
  if (!decisions) return null;

  let reuseCount = 0;
  let adaptCount = 0;
  let buildCount = 0;
  
  decisions.forEach(d => {
    const type = (d.decision_type || d.decision || '').toUpperCase();
    if (type === 'REUSE') reuseCount++;
    if (type === 'ADAPT') adaptCount++;
    if (type === 'BUILD') buildCount++;
  });

  return (
    <div className="flex flex-col gap-6 mb-12">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-2">
          SOLUTION STRATEGY
        </h2>
        <p className="text-sm text-[var(--bs-text-secondary)]">
          BuildScout recommends the following high-level strategy based on existing candidate evaluations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REUSE */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-6 bg-[var(--bs-bg-secondary)] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-status-success)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-widest">
                Reuse
              </span>
              <span className="text-4xl font-bold text-[var(--bs-text-primary)] tracking-tight">{reuseCount}</span>
            </div>
            <p className="text-sm text-[var(--bs-text-tertiary)] flex-1">
              Use existing solutions with minimal changes.
            </p>
          </div>
        </div>

        {/* ADAPT */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-6 bg-[var(--bs-bg-secondary)] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-status-warning)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-widest">
                Adapt
              </span>
              <span className="text-4xl font-bold text-[var(--bs-text-primary)] tracking-tight">{adaptCount}</span>
            </div>
            <p className="text-sm text-[var(--bs-text-tertiary)] flex-1">
              Modify proven solutions to fit requirements.
            </p>
          </div>
        </div>

        {/* BUILD */}
        <div className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-6 bg-[var(--bs-bg-secondary)] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-orange-500)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[var(--bs-text-primary)] uppercase tracking-widest">
                Build
              </span>
              <span className="text-4xl font-bold text-[var(--bs-text-primary)] tracking-tight">{buildCount}</span>
            </div>
            <p className="text-sm text-[var(--bs-text-tertiary)] flex-1">
              Build new functionality where no suitable candidate exists.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DecisionSummary;
