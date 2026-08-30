import React from 'react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col pb-6 mb-6 border-b border-[var(--bs-border-light)]">
      <h1 className="text-2xl font-bold text-[var(--bs-text-primary)] tracking-tight">
        Engineering Intelligence
      </h1>
      <p className="text-sm text-[var(--bs-text-tertiary)] mt-1 font-medium">
        Understand what BuildScout discovered, evaluated, and recommends.
      </p>
    </div>
  );
};

export default DashboardHeader;
