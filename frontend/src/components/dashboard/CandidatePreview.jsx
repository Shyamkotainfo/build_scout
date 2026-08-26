import React from 'react';

const CandidatePreview = ({ analysis }) => {
  if (!analysis || !analysis.candidates || analysis.candidates.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Technology Candidates</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No candidate data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Technology Candidates</h2>
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow">
        <ul role="list" className="divide-y divide-slate-700/50">
          {analysis.candidates.map((candidate, idx) => {
            const meta = candidate.metadata || {};
            const stars = meta.stars || meta.stargazers_count;
            const license = meta.license?.name || meta.license || 'Unknown';
            
            return (
              <li key={idx} className="p-4 hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-blue-400 truncate">
                      {candidate.name}
                    </p>
                    <a 
                      href={candidate.repository_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-slate-400 hover:text-slate-300 truncate"
                    >
                      {candidate.repository_url || 'No URL'}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-slate-300">License</span>
                      <span>{license}</span>
                    </div>
                    <div className="flex flex-col items-end w-16">
                      <span className="font-medium text-slate-300">Stars</span>
                      <span>{stars !== undefined ? stars : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CandidatePreview;
