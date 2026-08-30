import React from 'react';

const MetricCard = ({ title, value, emptyStateMessage }) => (
  <div className="overflow-hidden rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] p-5 shadow">
    <dt className="truncate text-sm font-medium text-[var(--bs-text-secondary)]">{title}</dt>
    <dd className="mt-2 text-2xl font-semibold tracking-tight text-[var(--bs-text-primary)]">
      {value !== null && value !== undefined ? (
        value
      ) : (
        <span className="text-base font-normal text-[var(--bs-text-tertiary)]">{emptyStateMessage || 'Awaiting analysis data'}</span>
      )}
    </dd>
  </div>
);

const PlatformOverview = ({ analysis }) => {
  // If no analysis exists, we show the empty states.
  let analysesCount = null;
  let reuseCount = null;
  let adaptCount = null;
  let buildCount = null;

  if (analysis) {
    analysesCount = 1; // Since we only track the latest locally
    reuseCount = 0;
    adaptCount = 0;
    buildCount = 0;

    if (analysis.decisions) {
      analysis.decisions.forEach((decision) => {
        if (decision.type === 'REUSE') reuseCount++;
        else if (decision.type === 'ADAPT') adaptCount++;
        else if (decision.type === 'BUILD') buildCount++;
      });
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Platform Overview</h2>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Analyses" value={analysesCount} />
        <MetricCard title="REUSE" value={reuseCount} />
        <MetricCard title="ADAPT" value={adaptCount} />
        <MetricCard title="BUILD" value={buildCount} />
      </dl>
    </div>
  );
};

export default PlatformOverview;
