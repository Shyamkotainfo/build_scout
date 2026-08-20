import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const IntegrationPoints = ({ integrationPoints }) => {
  if (!integrationPoints || integrationPoints.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold leading-6 text-white mb-4">Integration Points</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No integration points available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold leading-6 text-white mb-4 flex items-center gap-2">
        <ArrowRightLeft className="h-5 w-5 text-indigo-400" /> Integration Points
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrationPoints.map((point, idx) => {
          // Flexible rendering
          const name = point.name || `Integration ${idx + 1}`;
          const desc = point.description || null;
          
          const extraKeys = Object.keys(point).filter(k => k !== 'name' && k !== 'description');

          return (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <h3 className="text-base font-bold text-slate-200 mb-2">{name}</h3>
              {desc && <p className="text-sm text-slate-400 mb-4">{desc}</p>}
              
              {extraKeys.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-3 border-t border-slate-700/50">
                  {extraKeys.map(k => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                        {k.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-slate-300">
                        {typeof point[k] === 'object' ? JSON.stringify(point[k]) : String(point[k])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationPoints;
