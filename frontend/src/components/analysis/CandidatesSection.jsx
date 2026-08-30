import React from 'react';
import { ExternalLink, Search } from 'lucide-react';
import Badge from '../ui/Badge';

const CandidatesSection = ({ candidates, evaluations }) => {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  const evalCount = evaluations?.length || 0;

  return (
    <div className="flex flex-col mb-12">
      <div className="flex flex-col mb-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-2 uppercase flex items-center gap-2">
          <Search className="w-5 h-5 text-[var(--bs-orange-500)]" />
          What BuildScout Discovered
        </h2>
        
        <div className="flex items-center gap-4 text-sm text-[var(--bs-text-secondary)] font-mono">
          <span className="bg-[var(--bs-bg-secondary)] px-3 py-1 rounded-md border border-[var(--bs-border-light)]">
            <span className="font-bold text-[var(--bs-text-primary)]">{candidates.length}</span> candidates discovered
          </span>
          <span className="bg-[var(--bs-bg-secondary)] px-3 py-1 rounded-md border border-[var(--bs-border-light)]">
            <span className="font-bold text-[var(--bs-text-primary)]">{evalCount}</span> candidates evaluated
          </span>
          <span className="bg-[var(--bs-bg-secondary)] px-3 py-1 rounded-md border border-[var(--bs-border-light)] text-[var(--bs-text-tertiary)] uppercase text-xs tracking-wider font-semibold">
            GitHub · Web · MCP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate, idx) => (
          <div key={`${candidate.component_id}-${idx}`} className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-5 flex flex-col hover:border-[var(--bs-orange-500)] transition-colors group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-[var(--bs-text-primary)] text-base truncate pr-2">
                {candidate.name}
              </h3>
              {candidate.url && (
                <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="text-[var(--bs-text-tertiary)] hover:text-[var(--bs-orange-500)] shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-[10px] font-mono">
                {candidate.component_id}
              </Badge>
              {candidate.license && (
                <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] border border-[var(--bs-border-light)] px-1.5 py-0.5 rounded bg-[var(--bs-bg-primary)]">
                  {candidate.license}
                </span>
              )}
              {candidate.stars != null && (
                <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] border border-[var(--bs-border-light)] px-1.5 py-0.5 rounded bg-[var(--bs-bg-primary)] flex items-center gap-1">
                  ★ {candidate.stars.toLocaleString()}
                </span>
              )}
            </div>
            
            <p className="text-sm text-[var(--bs-text-secondary)] line-clamp-3 mb-4 flex-1">
              {candidate.description}
            </p>
            
            {candidate.metadata && candidate.metadata.source && (
              <div className="mt-auto pt-3 border-t border-[var(--bs-border-light)] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)]">
                  Source
                </span>
                <span className="text-xs text-[var(--bs-text-secondary)] font-mono">
                  {candidate.metadata.source}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidatesSection;
