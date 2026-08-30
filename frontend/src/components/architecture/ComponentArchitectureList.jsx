import React from 'react';
import { Layers } from 'lucide-react';

const getDecisionStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'REUSE': return 'bg-[var(--bs-status-success)]/10 text-[var(--bs-status-success)] border-[var(--bs-status-success)]';
    case 'ADAPT': return 'bg-[var(--bs-status-warning)]/10 text-[var(--bs-status-warning)] border-[var(--bs-status-warning)]';
    case 'BUILD': return 'bg-[var(--bs-orange-500)]/10 text-[var(--bs-orange-500)] border-[var(--bs-orange-500)]';
    default: return 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border-[var(--bs-border-light)]';
  }
};

const ComponentArchitectureList = ({ blueprint, decisions }) => {
  if (!blueprint?.components || blueprint.components.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Architecture Components
        </h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No components available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4" /> Architecture Components
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blueprint.components.map((comp) => {
          const decisionData = decisions?.find(d => d.component_id === comp.component_id);
          const decisionType = decisionData?.decision || comp.decision;
          const style = getDecisionStyle(decisionType);

          return (
            <div 
              key={comp.component_id}
              className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between mb-4 border-b border-[var(--bs-border-light)] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--bs-text-primary)] mb-1">{comp.component_name}</h3>
                  {decisionType && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border ${style}`}>
                      {decisionType}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">
                  {comp.responsibility || 'No description available.'}
                </p>
              </div>

              <div className="mt-auto pt-4 flex flex-col gap-3">
                <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-md p-3">
                  <span className="block text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Recommended Solution</span>
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">{comp.technology || 'Custom Implementation'}</span>
                </div>
                
                {decisionData?.reason && (
                  <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-md p-3">
                    <span className="block text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Why</span>
                    <span className="text-sm text-[var(--bs-text-secondary)]">{decisionData.reason}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComponentArchitectureList;
