import React from 'react';
import { Layers } from 'lucide-react';

const ComponentSidebar = ({ components, selectedComponentId, onSelect, candidates }) => {
  if (!components || components.length === 0) {
    return (
      <div className="w-full md:w-64 shrink-0 bg-slate-900 border border-slate-700 rounded-lg p-4 h-[600px] overflow-y-auto">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4" /> Components
        </h2>
        <div className="text-sm text-slate-500 italic">No components available.</div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-64 shrink-0 bg-slate-900 border border-slate-700 rounded-lg p-4 h-[600px] flex flex-col">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4" /> Components
      </h2>
      <ul className="space-y-2 overflow-y-auto flex-1 pr-1">
        {components.map((comp) => {
          const compCandidates = candidates?.filter(c => c.component_id === comp.id) || [];
          
          return (
            <li key={comp.id}>
              <button
                onClick={() => onSelect(comp.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors flex flex-col gap-1 ${
                  selectedComponentId === comp.id
                    ? 'bg-blue-900/40 border-blue-800/60 text-blue-200'
                    : 'bg-slate-800 border-slate-700/50 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm truncate">{comp.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded ml-2 shrink-0">
                    {comp.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 truncate pr-2">{comp.category}</span>
                  <span className={`px-1.5 rounded-full ${compCandidates.length > 0 ? 'bg-blue-900 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                    {compCandidates.length}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ComponentSidebar;
