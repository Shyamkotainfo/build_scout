import React from 'react';
import { ExternalLink, X, CheckCircle, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import StatusIndicator from '../ui/StatusIndicator';
import { Link } from 'react-router-dom';

const CandidateDetailPanel = ({ candidate, evaluation, decision, onClose, analysisId }) => {
  if (!candidate) return null;

  const source = candidate.metadata?.source?.toLowerCase() || 'unknown';

  const getDecisionBadge = (decisionType) => {
    switch (decisionType) {
      case 'REUSE': return <Badge variant="success">REUSE</Badge>;
      case 'ADAPT': return <Badge variant="warning">ADAPT</Badge>;
      case 'BUILD': return <Badge variant="error">BUILD</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="flex flex-col h-[600px] bg-[var(--bs-bg-secondary)] border-[var(--bs-border-medium)] shadow-lg overflow-hidden flex-1 lg:max-w-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold text-[var(--bs-text-primary)] truncate">{candidate.name}</span>
        </div>
        <button onClick={onClose} className="p-1 text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* INTERPRETATION vs FACTS */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="h-4 w-4 text-[var(--bs-orange-500)]" />
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">BuildScout Interpretation</h3>
          </div>
          <p className="text-sm text-[var(--bs-text-primary)] leading-relaxed bg-[var(--bs-bg-tertiary)] p-3 rounded-md border border-[var(--bs-border-light)]">
            {candidate.description || 'No interpretation provided.'}
          </p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bs-border-light)] pb-2">
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Retrieved Evidence (Facts)</h3>
            {source === 'github' && <Badge variant="secondary">GitHub</Badge>}
            {(source === 'tavily' || source === 'web') && <Badge variant="info">Web Search</Badge>}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">License</span>
                <span className="text-sm font-semibold text-[var(--bs-text-secondary)]">{candidate.license || 'Not available from retrieved evidence'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">Stars</span>
                <span className="text-sm font-semibold text-[var(--bs-text-secondary)]">{candidate.stars != null ? candidate.stars.toLocaleString() : 'Not available'}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">Source URL</span>
              {candidate.url ? (
                <a href={candidate.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--bs-blue-400)] hover:underline flex items-center gap-1 break-all">
                  {candidate.url} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <span className="text-sm text-[var(--bs-text-tertiary)] italic">Source URL unavailable</span>
              )}
            </div>

            <div className="bg-[var(--bs-bg-primary)] rounded-md border border-[var(--bs-border-light)] p-3 mt-4">
               <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-2">Metadata Dump</span>
               {candidate.metadata && Object.keys(candidate.metadata).length > 0 ? (
                 <pre className="text-[10px] text-[var(--bs-text-secondary)] overflow-x-auto whitespace-pre-wrap">
                   {JSON.stringify(candidate.metadata, null, 2)}
                 </pre>
               ) : (
                 <span className="text-xs text-[var(--bs-text-tertiary)] italic">No additional metadata found.</span>
               )}
            </div>
          </div>
        </section>

        {/* Evaluation and Decision connections */}
        <section className="pt-4 border-t border-[var(--bs-border-light)] space-y-4">
          <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Analysis Connections</h3>
          
          <div className="bg-[var(--bs-bg-primary)] rounded-md border border-[var(--bs-border-light)] p-4 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-[var(--bs-text-secondary)] mb-1">Evaluation Score</span>
              {evaluation ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--bs-text-primary)]">{evaluation.score || evaluation.overall_score || 'N/A'}</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">/ 100</span>
                </div>
              ) : (
                <span className="text-xs text-[var(--bs-text-tertiary)] italic">Not evaluated yet</span>
              )}
            </div>
            {evaluation && (
               <Link to={`/analyses/${analysisId}`} className="text-xs text-[var(--bs-blue-400)] hover:underline">
                 View Evaluation
               </Link>
            )}
          </div>

          {decision && decision.selected_candidate_name === candidate.name && (
            <div className="bg-[var(--bs-bg-tertiary)] rounded-md border border-[var(--bs-green-500)] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--bs-green-400)] flex items-center gap-1 uppercase tracking-widest">
                  <CheckCircle className="h-3 w-3" /> Selected
                </span>
                {getDecisionBadge(decision.decision)}
              </div>
              <p className="text-xs text-[var(--bs-text-secondary)] mt-2">
                {decision.reason || decision.rationale || 'Selected for final architecture blueprint.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </Card>
  );
};

export default CandidateDetailPanel;
