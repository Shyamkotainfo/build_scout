import React from 'react';

const CandidatePreview = ({ analysis }) => {
  if (!analysis || !analysis.candidates || analysis.candidates.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Technology Candidates</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No candidate data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-[var(--bs-text-primary)] mb-4">Technology Candidates</h2>
      <div className="overflow-hidden rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] shadow">
        <ul role="list" className="divide-y divide-[var(--bs-border-light)]">
          {analysis.candidates.map((candidate, idx) => {
            const meta = candidate.metadata || {};
            const stars = meta.stars || meta.stargazers_count;
            const license = meta.license?.name || meta.license || 'Unknown';
            
            return (
              <li key={idx} className="p-4 hover:bg-[var(--bs-bg-hover)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-[var(--bs-text-primary)] truncate">
                      {candidate.name}
                    </p>
                    <a 
                      href={candidate.repository_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-1 text-xs text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-secondary)] truncate"
                    >
                      {candidate.repository_url || 'No URL'}
                    </a>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--bs-text-tertiary)]">
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-[var(--bs-text-secondary)]">License</span>
                      <span>{license}</span>
                    </div>
                    <div className="flex flex-col items-end w-16">
                      <span className="font-medium text-[var(--bs-text-secondary)]">Stars</span>
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
