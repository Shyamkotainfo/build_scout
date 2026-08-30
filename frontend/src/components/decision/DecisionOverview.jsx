import React from 'react';

const DecisionOverview = ({ decisions }) => {
  if (!decisions || decisions.length === 0) {
    return (
      <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-6">
        <p className="text-sm text-[var(--bs-text-secondary)] italic">No decision data available.</p>
      </div>
    );
  }

  const total = decisions.length;
  let reuse = 0;
  let adapt = 0;
  let build = 0;

  decisions.forEach(d => {
    const type = (d.decision_type || d.decision || '').toUpperCase();
    if (type === 'REUSE') reuse++;
    if (type === 'ADAPT') adapt++;
    if (type === 'BUILD') build++;
  });

  const getPercentage = (count) => total > 0 ? ((count / total) * 100).toFixed(1) : 0;

  return (
    <div className="mb-8">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
        Decision Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* REUSE */}
        <div className="flex flex-col border border-[var(--bs-status-success)]/30 rounded-lg p-6 bg-[var(--bs-bg-primary)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-status-success)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-[var(--bs-status-success)] uppercase tracking-wider">
                REUSE
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold text-[var(--bs-text-primary)] leading-none">{reuse}</span>
                <span className="block text-xs font-bold text-[var(--bs-text-tertiary)] mt-1">{getPercentage(reuse)}%</span>
              </div>
            </div>
            <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed mt-auto">
              Use existing solution with minimal change.
            </p>
          </div>
        </div>

        {/* ADAPT */}
        <div className="flex flex-col border border-[var(--bs-status-warning)]/30 rounded-lg p-6 bg-[var(--bs-bg-primary)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-status-warning)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-[var(--bs-status-warning)] uppercase tracking-wider">
                ADAPT
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold text-[var(--bs-text-primary)] leading-none">{adapt}</span>
                <span className="block text-xs font-bold text-[var(--bs-text-tertiary)] mt-1">{getPercentage(adapt)}%</span>
              </div>
            </div>
            <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed mt-auto">
              Extend or modify an existing solution.
            </p>
          </div>
        </div>

        {/* BUILD */}
        <div className="flex flex-col border border-[var(--bs-orange-500)]/30 rounded-lg p-6 bg-[var(--bs-bg-primary)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--bs-orange-500)]"></div>
          <div className="pl-3 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-[var(--bs-orange-500)] uppercase tracking-wider">
                BUILD
              </span>
              <div className="text-right">
                <span className="text-3xl font-bold text-[var(--bs-text-primary)] leading-none">{build}</span>
                <span className="block text-xs font-bold text-[var(--bs-text-tertiary)] mt-1">{getPercentage(build)}%</span>
              </div>
            </div>
            <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed mt-auto">
              No suitable candidate met the requirements.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DecisionOverview;
