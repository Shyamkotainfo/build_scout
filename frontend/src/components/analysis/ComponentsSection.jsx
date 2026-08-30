import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ComponentsSection = ({ components }) => {
  const [expanded, setExpanded] = useState({});

  if (!components || components.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Components</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Components</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((comp) => (
          <div key={comp.id} className="rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)] flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[var(--bs-text-tertiary)]">{comp.id}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bs-status-running-light)] text-[var(--bs-status-running)] border border-[var(--bs-status-running-border)]">
                  {comp.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-[var(--bs-text-primary)] mb-2">{comp.name}</h3>
              <p className="text-sm text-[var(--bs-text-secondary)]">{comp.description}</p>
            </div>
            
            {comp.dependencies && comp.dependencies.length > 0 && (
              <div className="border-t border-[var(--bs-border-light)] bg-[var(--bs-bg-tertiary)] rounded-b-lg">
                <button
                  onClick={() => toggleExpand(comp.id)}
                  className="flex items-center justify-between w-full p-3 text-sm text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {expanded[comp.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Dependencies ({comp.dependencies.length})
                  </span>
                </button>
                {expanded[comp.id] && (
                  <ul className="px-4 pb-4 space-y-1">
                    {comp.dependencies.map((dep, idx) => (
                      <li key={idx} className="text-xs text-[var(--bs-text-secondary)] flex items-center before:content-['•'] before:mr-2 before:text-[var(--bs-text-tertiary)]">
                        {dep}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentsSection;
