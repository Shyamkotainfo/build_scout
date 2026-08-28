import React from 'react';
import { Layers } from 'lucide-react';
import Card from '../ui/Card';

const ComponentSidebar = ({ components, selectedComponentId, onSelect, candidates }) => {
  if (!components || components.length === 0) {
    return (
      <Card className="w-full lg:w-64 shrink-0 h-[600px] overflow-y-auto p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)]">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Components
        </h2>
        <div className="text-sm text-[var(--bs-text-secondary)] italic">No components available.</div>
      </Card>
    );
  }

  return (
    <Card className="w-full lg:w-64 shrink-0 h-[600px] flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)]">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4" /> Components
      </h2>
      <ul className="space-y-2 overflow-y-auto flex-1 pr-1">
        {components.map((comp) => {
          const compCandidates = candidates?.filter(c => c.component_id === comp.id) || [];
          const isSelected = selectedComponentId === comp.id;
          
          return (
            <li key={comp.id}>
              <button
                onClick={() => onSelect(comp.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-[var(--bs-bg-tertiary)] border-[var(--bs-orange-500)] text-[var(--bs-orange-500)]'
                    : 'bg-[var(--bs-bg-primary)] border-[var(--bs-border-light)] text-[var(--bs-text-primary)] hover:border-[var(--bs-orange-500)]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-semibold text-sm truncate ${isSelected ? 'text-[var(--bs-orange-500)]' : 'text-[var(--bs-text-primary)]'}`}>{comp.name}</span>
                  <span className="text-[10px] font-mono text-[var(--bs-text-tertiary)] bg-[var(--bs-bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--bs-border-light)] ml-2 shrink-0">
                    {comp.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--bs-text-secondary)] truncate pr-2">{comp.category}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${compCandidates.length > 0 ? 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-primary)] border-[var(--bs-border-medium)]' : 'bg-[var(--bs-bg-primary)] text-[var(--bs-text-tertiary)] border-[var(--bs-border-light)]'}`}>
                    {compCandidates.length}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default ComponentSidebar;
