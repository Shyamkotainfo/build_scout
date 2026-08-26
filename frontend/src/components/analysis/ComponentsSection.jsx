import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const ComponentsSection = ({ components }) => {
  const [expanded, setExpanded] = useState({});

  if (!components || components.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Components</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Components</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((comp) => (
          <div key={comp.id} className="rounded-lg border border-slate-700 bg-slate-800 flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">{comp.id}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-800/50">
                  {comp.category}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">{comp.name}</h3>
              <p className="text-sm text-slate-400">{comp.description}</p>
            </div>
            
            {comp.dependencies && comp.dependencies.length > 0 && (
              <div className="border-t border-slate-700 bg-slate-900/30">
                <button
                  onClick={() => toggleExpand(comp.id)}
                  className="flex items-center justify-between w-full p-3 text-sm text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {expanded[comp.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Dependencies ({comp.dependencies.length})
                  </span>
                </button>
                {expanded[comp.id] && (
                  <ul className="px-4 pb-4 space-y-1">
                    {comp.dependencies.map((dep, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-center before:content-['•'] before:mr-2 before:text-slate-600">
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
