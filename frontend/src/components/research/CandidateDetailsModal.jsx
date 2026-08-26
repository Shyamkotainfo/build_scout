import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

const getScoreBadge = (score) => {
  if (score >= 90) return { label: 'Excellent', color: 'bg-green-900/40 text-green-400 border-green-800/60' };
  if (score >= 70) return { label: 'Good', color: 'bg-blue-900/40 text-blue-400 border-blue-800/60' };
  if (score >= 50) return { label: 'Moderate', color: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/60' };
  return { label: 'Weak', color: 'bg-red-900/40 text-red-400 border-red-800/60' };
};

const getDecisionStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'REUSE': return 'bg-green-900/40 text-green-400 border-green-800/60';
    case 'ADAPT': return 'bg-yellow-900/40 text-yellow-400 border-yellow-800/60';
    case 'BUILD': return 'bg-blue-900/40 text-blue-400 border-blue-800/60';
    default: return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};

const CandidateDetailsModal = ({ candidate, evaluation, decision, onClose }) => {
  if (!candidate) return null;

  const metaKeys = Object.keys(candidate.metadata || {}).filter(k => k !== 'stars' && k !== 'license' && candidate.metadata[k] != null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
              {candidate.name}
              {candidate.url && (
                <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded transition-colors">
                  Open Source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </h2>
            <div className="text-sm font-mono text-slate-400">Component: {candidate.component_id}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors focus:outline-none p-2 rounded-full hover:bg-slate-800">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Metadata */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <p className="text-sm text-slate-300 mb-6">{candidate.description}</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600/60">
                  <ShieldCheck className="h-4 w-4" />
                  License: {candidate.license || 'Unknown'}
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-slate-300 border border-slate-600/60">
                  ★ Stars: {candidate.stars != null ? candidate.stars.toLocaleString() : 'Unknown'}
                </span>
              </div>
              
              {metaKeys.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 border-t border-slate-700 pt-4 mt-2">
                  {metaKeys.map(k => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-0.5">{k.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-slate-300 truncate">{String(candidate.metadata[k])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Evaluation */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Evaluation</h3>
            {evaluation ? (
              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Score</span>
                    <span className="text-3xl font-bold text-white leading-none">{evaluation.score}</span>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-bold border ${getScoreBadge(evaluation.score).color}`}>
                    {getScoreBadge(evaluation.score).label}
                  </span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Why this candidate scored this way</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{evaluation.reasoning}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="text-xs font-semibold text-yellow-500/80 uppercase tracking-wider mb-2">Concerns</h4>
                      {evaluation.concerns?.length > 0 ? (
                        <ul className="space-y-1">
                          {evaluation.concerns.map((c, i) => (
                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2 before:content-['•'] before:text-yellow-600">{c}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-slate-500">None identified.</span>
                      )}
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Missing Evidence</h4>
                      {evaluation.missing_evidence?.length > 0 ? (
                        <ul className="space-y-1">
                          {evaluation.missing_evidence.map((m, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2 before:content-['•'] before:text-slate-600">{m}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-slate-500">None.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center text-sm text-slate-500">
                No evaluation is available.
              </div>
            )}
          </div>

          {/* Decision */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Decision</h3>
            {decision ? (
              <div className={`rounded-lg border bg-slate-800 p-5 ${getDecisionStyle(decision.decision).replace(/bg-[^\s]+|text-[^\s]+/, '')}`}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
                  <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-bold border tracking-wide shadow-sm ${getDecisionStyle(decision.decision)}`}>
                    {decision.decision?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  {decision.selected_candidate_name === candidate.name ? (
                    <span className="text-sm font-medium text-green-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Selected Candidate
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-500">
                      Selected: {decision.selected_candidate_name || 'No candidate selected'}
                    </span>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Why?</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{decision.reason}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider w-20">Confidence</span>
                    <div className="flex-1 max-w-xs h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                      <div 
                        className={`h-full ${decision.confidence > 0.8 ? 'bg-green-500' : decision.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, decision.confidence * 100))}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono text-slate-300">{Math.round(decision.confidence * 100)}%</span>
                  </div>

                  {(decision.risks?.length > 0 || decision.implementation_notes?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700/50">
                      {decision.risks?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-red-400/80 uppercase tracking-wider mb-2">Risks</h4>
                          <ul className="space-y-1">
                            {decision.risks.map((r, i) => (
                              <li key={i} className="text-sm text-slate-400 flex items-start gap-2 before:content-['•'] before:text-slate-600">{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {decision.implementation_notes?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-blue-400/80 uppercase tracking-wider mb-2">Implementation Notes</h4>
                          <ul className="space-y-1">
                            {decision.implementation_notes.map((n, i) => (
                              <li key={i} className="text-sm text-slate-400 flex items-start gap-2 before:content-['•'] before:text-slate-600">{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center text-sm text-slate-500">
                No decision has been recorded.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsModal;
