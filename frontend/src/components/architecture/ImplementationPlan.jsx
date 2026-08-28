import React from 'react';
import { Target, ArrowDown } from 'lucide-react';

const ImplementationPlan = ({ phases }) => {
  if (!phases || phases.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target className="h-4 w-4" /> Implementation Plan
        </h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--bs-text-secondary)]">No implementation phases available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Target className="h-4 w-4" /> Implementation Plan
      </h2>
      
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm">
        <div className="flex flex-col">
          {phases.map((phase, i) => (
            <div key={i} className="flex flex-col mb-4 last:mb-0">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-[var(--bs-blue-500)]/20 border-2 border-[var(--bs-blue-500)] flex items-center justify-center shrink-0 z-10">
                    <span className="text-[10px] font-bold text-[var(--bs-blue-500)]">{i + 1}</span>
                  </div>
                  {i < phases.length - 1 && (
                    <div className="w-0.5 h-full bg-[var(--bs-border-light)] my-1 min-h-[50px]"></div>
                  )}
                </div>
                
                <div className="flex-1 pb-6">
                  <h4 className="text-base font-bold text-[var(--bs-text-primary)] mb-1">
                    {phase.phase || `Phase ${i + 1}`}
                  </h4>
                  <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed mb-4">
                    {phase.description || phase.objective || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {phase.components?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block mb-1">Components</span>
                        <ul className="space-y-1">
                          {phase.components.map((c, j) => (
                            <li key={j} className="text-xs text-[var(--bs-text-secondary)] flex items-start gap-1 before:content-['•'] before:text-[var(--bs-text-tertiary)]">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {phase.deliverables?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block mb-1">Deliverables</span>
                        <ul className="space-y-1">
                          {phase.deliverables.map((d, j) => (
                            <li key={j} className="text-xs text-[var(--bs-text-secondary)] flex items-start gap-1 before:content-['•'] before:text-[var(--bs-text-tertiary)]">{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.dependencies?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block mb-1">Dependencies</span>
                        <ul className="space-y-1">
                          {phase.dependencies.map((d, j) => (
                            <li key={j} className="text-xs text-[var(--bs-text-secondary)] flex items-start gap-1 before:content-['•'] before:text-[var(--bs-text-tertiary)]">{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImplementationPlan;
