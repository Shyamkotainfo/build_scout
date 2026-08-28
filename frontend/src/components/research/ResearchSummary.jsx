import React, { useMemo } from 'react';
import Card from '../ui/Card';

const ResearchSummary = ({ analysis }) => {
  if (!analysis) return null;

  const numComponents = analysis.components?.length || 0;
  const numCandidates = analysis.candidates?.length || 0;
  
  const sources = useMemo(() => {
    const s = new Set();
    (analysis.candidates || []).forEach(c => {
      if (c.metadata?.source) {
        s.add(c.metadata.source.toLowerCase());
      }
    });
    const arr = Array.from(s);
    if (arr.length === 0) return 'None';
    return arr.map(source => source === 'tavily' ? 'web' : source).join(' · ');
  }, [analysis.candidates]);

  const numSearchOperations = useMemo(() => {
    if (!analysis.traces) return 0;
    return analysis.traces.reduce((total, trace) => {
      const calls = trace.tool_calls?.filter(t => t.name?.includes('search') || t.name?.includes('lookup') || t.provider === 'MCP') || [];
      return total + calls.length;
    }, 0);
  }, [analysis.traces]);

  return (
    <Card className="mb-6 bg-[var(--bs-bg-secondary)] border-[var(--bs-border-light)] p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-[var(--bs-border-light)]">
        <div className="px-4 first:pl-0 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Components Investigated</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{numComponents}</span>
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Candidates Discovered</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{numCandidates}</span>
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Sources</span>
          <span className="text-lg font-bold text-[var(--bs-text-secondary)] uppercase tracking-widest mt-2">{sources}</span>
        </div>
        <div className="px-4 flex flex-col items-start">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Search Operations</span>
          <span className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">{numSearchOperations}</span>
        </div>
      </div>
    </Card>
  );
};

export default ResearchSummary;
