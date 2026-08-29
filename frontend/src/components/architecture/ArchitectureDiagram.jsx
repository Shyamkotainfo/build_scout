import React from 'react';
import { Database, LayoutTemplate, Settings, Cloud, Code, Box, ArrowDown } from 'lucide-react';

const getDecisionStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'REUSE': return 'border-[var(--bs-status-success)] bg-[var(--bs-status-success)]/10 text-[var(--bs-status-success)]';
    case 'ADAPT': return 'border-[var(--bs-status-warning)] bg-[var(--bs-status-warning)]/10 text-[var(--bs-status-warning)]';
    case 'BUILD': return 'border-[var(--bs-orange-500)] bg-[var(--bs-orange-500)]/10 text-[var(--bs-orange-500)]';
    default: return 'border-[var(--bs-border-medium)] bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)]';
  }
};

const getIconForComponent = (name) => {
  const n = name.toLowerCase();
  if (n.includes('database') || n.includes('storage')) return <Database className="h-5 w-5" />;
  if (n.includes('ui') || n.includes('frontend')) return <LayoutTemplate className="h-5 w-5" />;
  if (n.includes('api') || n.includes('gateway')) return <Cloud className="h-5 w-5" />;
  if (n.includes('service') || n.includes('engine')) return <Settings className="h-5 w-5" />;
  if (n.includes('auth')) return <Code className="h-5 w-5" />;
  return <Box className="h-5 w-5" />;
};

const ArchitectureDiagram = ({ blueprint, decisions }) => {
  if (!blueprint?.components || blueprint.components.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Architecture Map</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No components available for mapping.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Architecture Map</h2>
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-12 overflow-x-auto shadow-sm">
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
          
          <div className="flex flex-col items-center px-6 py-2 border-2 border-dashed border-[var(--bs-border-medium)] rounded-full mb-6">
             <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">USER / CLIENT</span>
          </div>
          <ArrowDown className="h-6 w-6 text-[var(--bs-text-tertiary)] mb-6" />

          {blueprint.components.map((comp, index) => {
            const decisionData = decisions?.find(d => d.component_id === comp.component_id);
            const decisionType = decisionData?.decision || comp.decision;
            const style = getDecisionStyle(decisionType);
            
            return (
              <React.Fragment key={comp.component_id}>
                <div 
                  className={`relative flex flex-col md:flex-row items-center p-5 rounded-xl border-2 w-full max-w-lg shadow-sm bg-[var(--bs-bg-primary)] ${style} transition-transform hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className="flex-shrink-0 mb-3 md:mb-0 md:mr-5 p-3 rounded-full bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] text-[var(--bs-text-primary)]">
                    {getIconForComponent(comp.component_name)}
                  </div>
                  <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-base font-bold text-[var(--bs-text-primary)] mb-1">{comp.component_name}</h3>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                      <span className="text-[10px] font-mono text-[var(--bs-text-secondary)] bg-[var(--bs-bg-secondary)] px-2 py-0.5 rounded border border-[var(--bs-border-light)]">
                        {comp.technology || 'Unknown'}
                      </span>
                      {decisionType && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--bs-bg-primary)] border ${style}`}>
                          {decisionType}
                        </span>
                      )}
                    </div>
                    {comp.responsibility && (
                      <p className="text-xs text-[var(--bs-text-secondary)] line-clamp-2">
                        {comp.responsibility}
                      </p>
                    )}
                  </div>
                </div>

                {index < blueprint.components.length - 1 && (
                  <ArrowDown className="h-6 w-6 text-[var(--bs-text-tertiary)] my-4" />
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;

