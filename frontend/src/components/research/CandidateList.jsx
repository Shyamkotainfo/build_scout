import React, { useState, useMemo } from 'react';
import { Search, Filter, ExternalLink, ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const CandidateList = ({ componentId, candidates, decisions, onSelectCandidate, selectedCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');

  const componentCandidates = useMemo(() => {
    return candidates?.filter(c => c.component_id === componentId) || [];
  }, [candidates, componentId]);

  const componentDecision = useMemo(() => {
    return decisions?.find(d => d.component_id === componentId);
  }, [decisions, componentId]);

  const sources = useMemo(() => {
    const s = new Set(componentCandidates.map(c => c.metadata?.source?.toLowerCase() || 'unknown'));
    return ['ALL', ...Array.from(s)];
  }, [componentCandidates]);

  const filteredCandidates = useMemo(() => {
    return componentCandidates.filter(c => {
      const matchesSearch = !searchTerm || 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.url?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const source = c.metadata?.source?.toLowerCase() || 'unknown';
      const matchesSource = filterSource === 'ALL' || source === filterSource;
      
      return matchesSearch && matchesSource;
    });
  }, [componentCandidates, searchTerm, filterSource]);

  const getSourceBadge = (source) => {
    const s = source?.toLowerCase();
    if (s === 'github') return <Badge variant="secondary">GitHub</Badge>;
    if (s === 'tavily' || s === 'web') return <Badge variant="info">Web Search</Badge>;
    if (s === 'local') return <Badge variant="success">Local</Badge>;
    return <Badge variant="default">Unknown</Badge>;
  };

  if (!componentId) {
    return (
      <div className="flex-1 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] border-dashed rounded-lg flex items-center justify-center h-[600px]">
        <p className="text-[var(--bs-text-secondary)]">Select a component to view candidates.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[600px]">
      <Card className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-[var(--bs-text-tertiary)]" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-[var(--bs-border-medium)] bg-[var(--bs-bg-primary)] py-2 pl-10 pr-3 text-sm text-[var(--bs-text-primary)] placeholder-[var(--bs-text-tertiary)] focus:border-[var(--bs-orange-500)] focus:ring-[var(--bs-orange-500)] outline-none"
            placeholder="Search solutions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-[var(--bs-text-tertiary)]" />
          <select
            className="block w-full sm:w-32 rounded-md border border-[var(--bs-border-medium)] bg-[var(--bs-bg-primary)] py-2 pl-3 pr-8 text-sm text-[var(--bs-text-primary)] focus:border-[var(--bs-orange-500)] focus:ring-[var(--bs-orange-500)] outline-none"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            {sources.map(s => <option key={s} value={s}>{s === 'ALL' ? 'Source' : s}</option>)}
          </select>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg">
            <h3 className="text-lg font-bold text-[var(--bs-text-primary)] mb-2">No solutions found</h3>
            <p className="text-sm text-[var(--bs-text-secondary)] mb-6 max-w-sm mx-auto">BuildScout did not identify a suitable reusable solution for this component.</p>
            {componentDecision?.decision === 'BUILD' && (
              <span className="inline-block px-3 py-1 bg-[var(--bs-status-critical-light)] text-[var(--bs-status-critical)] border border-[var(--bs-status-critical-border)] rounded text-xs font-bold uppercase tracking-widest">
                Recommendation: BUILD
              </span>
            )}
          </div>
        ) : (
          filteredCandidates.map(candidate => {
            const isSelected = selectedCandidate?.name === candidate.name;
            const source = candidate.metadata?.source;
            
            return (
              <button 
                key={candidate.name} 
                onClick={() => onSelectCandidate(candidate)}
                className={`w-full text-left bg-[var(--bs-bg-secondary)] border rounded-lg p-4 transition-colors flex flex-col ${
                  isSelected 
                    ? 'border-[var(--bs-orange-500)] bg-[var(--bs-bg-tertiary)]' 
                    : 'border-[var(--bs-border-light)] hover:border-[var(--bs-orange-500)]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 truncate pr-4">
                    <span className={`text-base font-bold truncate ${isSelected ? 'text-[var(--bs-orange-500)]' : 'text-[var(--bs-text-primary)]'}`}>
                      {candidate.name}
                    </span>
                    {getSourceBadge(source)}
                  </div>
                  {candidate.url && (
                    <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-secondary)] flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">Description</h4>
                  <p className="text-sm text-[var(--bs-text-secondary)] line-clamp-2">{candidate.description}</p>
                </div>

                <div className="mb-4 bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] p-3 rounded-md">
                  <h4 className="text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1 text-[var(--bs-orange-500)]">Why Relevant</h4>
                  <p className="text-sm text-[var(--bs-text-primary)]">
                    {candidate.metadata?.relevance || candidate.description || 'Relevance explanation not available.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mt-auto pt-2 border-t border-[var(--bs-border-light)]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--bs-text-secondary)]">
                    <ShieldCheck className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
                    {candidate.license || 'Not available'}
                  </span>
                  <span className="text-xs font-bold text-[var(--bs-text-secondary)] flex items-center gap-1">
                    ★ {candidate.stars != null ? candidate.stars.toLocaleString() : 'Not available'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateList;
