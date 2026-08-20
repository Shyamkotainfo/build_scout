import React, { useState, useMemo } from 'react';
import { Search, Filter, ExternalLink, ShieldCheck, CheckSquare, Square } from 'lucide-react';

const CandidateList = ({ componentId, candidates, onSelectCandidate, comparisonSelection, toggleComparisonSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');

  const componentCandidates = useMemo(() => {
    return candidates?.filter(c => c.component_id === componentId) || [];
  }, [candidates, componentId]);

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
    if (s === 'github') return <span className="bg-slate-800 text-slate-300 border border-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">GitHub</span>;
    if (s === 'tavily' || s === 'web') return <span className="bg-blue-900/40 text-blue-400 border border-blue-800/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Web Search</span>;
    if (s === 'local') return <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Local</span>;
    return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Unknown</span>;
  };

  if (!componentId) {
    return (
      <div className="flex-1 bg-slate-800/30 border border-slate-700 border-dashed rounded-lg flex items-center justify-center h-[600px]">
        <p className="text-slate-500">Select a component to view candidates.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[600px]">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="block w-full sm:w-32 rounded-md border-slate-700 bg-slate-800 py-2 pl-3 pr-8 text-sm text-slate-200 focus:border-blue-500 focus:ring-blue-500"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
          >
            {sources.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Sources' : s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No research candidates were discovered for this component.</p>
          </div>
        ) : (
          filteredCandidates.map(candidate => {
            const isSelectedForCompare = comparisonSelection.includes(candidate.name);
            const source = candidate.metadata?.source;
            
            return (
              <div key={candidate.name} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition-colors flex gap-4">
                <div className="pt-1">
                  <button 
                    onClick={() => toggleComparisonSelection(candidate.name)}
                    className="text-slate-400 hover:text-blue-400 transition-colors focus:outline-none"
                    title={isSelectedForCompare ? "Remove from comparison" : "Add to comparison"}
                  >
                    {isSelectedForCompare ? <CheckSquare className="h-5 w-5 text-blue-500" /> : <Square className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3 truncate pr-4">
                      <button 
                        onClick={() => onSelectCandidate(candidate)}
                        className="text-base font-semibold text-blue-400 hover:text-blue-300 truncate text-left focus:outline-none"
                      >
                        {candidate.name}
                      </button>
                      {getSourceBadge(source)}
                    </div>
                    {candidate.url && (
                      <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-300 line-clamp-2 mb-3">{candidate.description}</p>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-700/50 px-2 py-1 text-xs font-medium text-slate-300 border border-slate-600/60">
                      <ShieldCheck className="h-3 w-3" />
                      {candidate.license || 'Unknown'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      ★ {candidate.stars != null ? candidate.stars.toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CandidateList;
