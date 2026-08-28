import React from 'react';
import { Database, LayoutTemplate, Settings, Cloud, Code, Box } from 'lucide-react';

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
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--bs-text-primary)] mb-4">Architecture Map</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No components available for mapping.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Architecture Map</h2>
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-8 overflow-x-auto shadow-sm">
        <div className="flex flex-wrap justify-center gap-6 min-w-max mx-auto">
          {blueprint.components.map((comp) => {
            const decisionData = decisions?.find(d => d.component_id === comp.component_id);
            const decisionType = decisionData?.decision || comp.decision;
            const style = getDecisionStyle(decisionType);
            
            return (
              <div 
                key={comp.component_id} 
                className={`relative flex flex-col items-center p-5 rounded-xl border-2 w-64 shadow-md bg-[var(--bs-bg-primary)] ${style}`}
              >
                <div className="mb-3 p-3 rounded-full bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] text-[var(--bs-text-primary)]">
                  {getIconForComponent(comp.component_name)}
                </div>
                <h3 className="text-sm font-bold text-[var(--bs-text-primary)] text-center mb-1">{comp.component_name}</h3>
                <span className="text-[10px] font-mono text-[var(--bs-text-secondary)] mb-3 bg-[var(--bs-bg-secondary)] px-2 py-0.5 rounded">
                  {comp.technology || 'Unknown'}
                </span>
                {decisionType && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-[var(--bs-bg-primary)] border ${style}`}>
                    {decisionType}
                  </span>
                )}
                
                {comp.responsibility && (
                  <p className="mt-4 text-[10px] text-[var(--bs-text-secondary)] text-center line-clamp-2 leading-relaxed">
                    {comp.responsibility}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;

