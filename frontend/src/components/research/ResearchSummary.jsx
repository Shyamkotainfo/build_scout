import React, { useMemo } from 'react';
import Card from '../ui/Card';

const ResearchSummary = ({ analysis }) => {
  if (!analysis) return null;

  const numComponents = analysis.components?.length || 0;
  const numCandidates = analysis.candidates?.length || 0;
  
  const sourcesText = useMemo(() => {
    if (!analysis.candidates || analysis.candidates.length === 0) return 'Unavailable';
    const s = new Set();
    analysis.candidates.forEach(c => {
      if (c.metadata?.source) {
        s.add(c.metadata.source.toLowerCase());
      }
    });
    const numSources = s.size;
    if (numSources === 0) return 'Unavailable';
    return `${numSources} ${numSources === 1 ? 'source' : 'sources'}`;
  }, [analysis.candidates]);

  const strongMatches = useMemo(() => {
    if (!analysis.evaluations || analysis.evaluations.length === 0) return 'N/A';
    const strongCount = analysis.evaluations.filter(e => {
      const score = e.score ?? e.overall_score ?? 0;
      return score >= 80;
    }).length;
    return strongCount;
  }, [analysis.evaluations]);

  return (
    <Card className="mb-6 bg-[var(--bs-bg-secondary)] border-[var(--bs-border-light)] p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-[var(--bs-border-light)]">
        <div className="px-4 first:pl-0 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Components Analyzed</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{numComponents}</span>
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Candidates Found</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{numCandidates}</span>
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Sources Reviewed</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{sourcesText !== 'Unavailable' ? sourcesText.split(' ')[0] : 'N/A'}</span>
          {sourcesText !== 'Unavailable' && <span className="text-[10px] text-[var(--bs-text-tertiary)] font-bold uppercase tracking-widest mt-1">Unique Sources</span>}
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Strong Matches</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{strongMatches}</span>
          {strongMatches !== 'N/A' && <span className="text-[10px] text-[var(--bs-text-tertiary)] font-bold uppercase tracking-widest mt-1">Score ≥ 80</span>}
        </div>
      </div>
    </Card>
  );
};

export default ResearchSummary;
