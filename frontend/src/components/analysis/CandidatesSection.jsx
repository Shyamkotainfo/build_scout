import React from 'react';
import { ExternalLink } from 'lucide-react';

const CandidatesSection = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Solution Candidates</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Solution Candidates</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {candidates.map((candidate, idx) => {
          const meta = candidate.metadata || {};
          // Safely extract metadata keys
          const renderMeta = () => {
            const keys = Object.keys(meta).filter(k => k !== 'stars' && k !== 'license' && meta[k] != null);
            if (keys.length === 0) return null;
            return (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 border-t border-slate-700 pt-3">
                {keys.map(k => (
                  <div key={k} className="flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{k.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-slate-300 truncate">{String(meta[k])}</span>
                  </div>
                ))}
              </div>
            );
          };

          return (
            <div key={`${candidate.component_id}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-800 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-base font-semibold text-blue-400 mb-1 flex items-center gap-2">
                    {candidate.name}
                    {candidate.url && (
                      <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </h3>
                  <span className="text-xs font-mono text-slate-500">For component: {candidate.component_id}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-md bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300 border border-slate-600/60">
                    License: {candidate.license || 'Unknown'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    ★ {candidate.stars != null ? candidate.stars.toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 mt-2 flex-1">{candidate.description}</p>
              
              {renderMeta()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidatesSection;
