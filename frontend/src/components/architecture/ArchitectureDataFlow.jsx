import React from 'react';
import { ArrowRight, Workflow } from 'lucide-react';

const ArchitectureDataFlow = ({ dataFlow }) => {
  if (!dataFlow || dataFlow.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Workflow className="h-4 w-4" /> Data Flow Map
        </h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--bs-text-secondary)]">No data flow available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Workflow className="h-4 w-4" /> Data Flow Map
      </h2>
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 overflow-x-auto shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 min-w-max mx-auto py-4">
          {dataFlow.map((flowStep, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg px-6 py-4 shadow-sm text-center min-w-[200px]">
                <span className="text-sm font-bold text-[var(--bs-text-primary)]">{flowStep}</span>
              </div>
              {idx < dataFlow.length - 1 && (
                <div className="text-[var(--bs-text-tertiary)] flex flex-col md:flex-row items-center justify-center">
                  <ArrowRight className="hidden md:block h-5 w-5 text-[var(--bs-blue-500)]" />
                  <ArrowRight className="block md:hidden h-5 w-5 text-[var(--bs-blue-500)] rotate-90 my-2" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDataFlow;
