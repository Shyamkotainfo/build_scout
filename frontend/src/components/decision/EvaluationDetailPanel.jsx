import React from 'react';
import { X, ExternalLink, BrainCircuit } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Link } from 'react-router-dom';

const EvaluationDetailPanel = ({ candidate, evaluation, onClose, analysisId }) => {
  if (!candidate) return null;

  const source = candidate.metadata?.source?.toLowerCase() || 'unknown';
  
  const overallScore = evaluation?.score ?? evaluation?.overall_score;
  const relevance = evaluation?.dimensions?.relevance ?? evaluation?.relevance_score;
  const compatibility = evaluation?.dimensions?.compatibility ?? evaluation?.compatibility_score;
  const health = evaluation?.dimensions?.health ?? evaluation?.health_score ?? evaluation?.maturity_score;
  const license = evaluation?.dimensions?.license ?? evaluation?.license_score;
  const security = evaluation?.dimensions?.security ?? evaluation?.security_score;

  const renderScoreBar = (label, score) => {
    if (score == null) {
      return (
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] w-28 truncate">{label}</span>
          <span className="text-xs italic text-[var(--bs-text-tertiary)] flex-1 text-right">Not evaluated</span>
        </div>
      );
    }
    
    // Create text-based block bar
    const filledBlocks = Math.round(score / 10);
    const emptyBlocks = 10 - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-bold text-[var(--bs-text-secondary)] w-28 truncate">{label}</span>
        <span className="font-mono text-xs text-[var(--bs-orange-500)] tracking-[0.2em]">{bar}</span>
        <span className="text-xs font-mono font-bold text-[var(--bs-text-primary)] w-8 text-right">{score}</span>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[800px] lg:h-[700px] bg-[var(--bs-bg-secondary)] border-[var(--bs-border-medium)] shadow-lg overflow-hidden flex-1">
      <div className="flex items-center justify-between p-4 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)] shrink-0">
        <div className="flex items-center gap-2 truncate pr-2">
          <span className="font-bold text-[var(--bs-text-primary)] truncate">{candidate.name}</span>
        </div>
        <button onClick={onClose} className="p-1 text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        
        {/* EVIDENCE */}
        <section>
          <div className="flex items-center justify-between mb-3 border-b border-[var(--bs-border-light)] pb-2">
            <h3 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Evidence (Facts)</h3>
            {source === 'github' && <Badge variant="secondary">GitHub</Badge>}
            {(source === 'tavily' || source === 'web') && <Badge variant="info">Web Search</Badge>}
            {source === 'local' && <Badge variant="success">Local</Badge>}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">License Evidence</span>
                <span className="text-sm font-semibold text-[var(--bs-text-secondary)]">{candidate.license || 'Not available from retrieved evidence'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[var(--bs-text-tertiary)] mb-1">Health Evidence</span>
                <span className="text-sm font-semibold text-[var(--bs-text-secondary)]">{candidate.stars != null ? `${candidate.stars.toLocaleString()} stars` : 'Not available'}</span>
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
            
            <div className="mt-2">
               <Link to={`/research/${analysisId}`} className="text-xs text-[var(--bs-blue-400)] hover:underline font-bold tracking-widest uppercase flex items-center gap-1">
                 View Full Research Trace
               </Link>
            </div>
          </div>
        </section>

        {/* BUILDSCOUT EVALUATION */}
        <section>
          <div className="flex items-center gap-2 mb-3 border-b border-[var(--bs-border-light)] pb-2">
            <BrainCircuit className="h-4 w-4 text-[var(--bs-orange-500)]" />
            <h3 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">BuildScout Evaluation</h3>
          </div>
          
          <div className="bg-[var(--bs-bg-primary)] p-4 rounded-md border border-[var(--bs-border-light)] mb-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--bs-border-light)]/50">
              <span className="text-sm font-bold text-[var(--bs-text-primary)]">Overall Score</span>
              {overallScore != null ? (
                <span className="text-2xl font-bold text-[var(--bs-orange-500)] leading-none">{overallScore}</span>
              ) : (
                <span className="text-sm italic text-[var(--bs-text-tertiary)]">Not evaluated</span>
              )}
            </div>
            
            <div className="space-y-1">
              {renderScoreBar('Relevance', relevance)}
              {renderScoreBar('Compatibility', compatibility)}
              {renderScoreBar('Health', health)}
              {renderScoreBar('License', license)}
              {renderScoreBar('Security', security)}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Why?</span>
              <p className="text-sm text-[var(--bs-text-primary)] leading-relaxed bg-[var(--bs-bg-tertiary)] p-3 rounded-md border border-[var(--bs-border-light)]">
                {evaluation?.reasoning || evaluation?.reason || 'Evaluation reasoning unavailable.'}
              </p>
            </div>

            {evaluation?.missing_evidence && evaluation.missing_evidence.length > 0 && (
              <div>
                <span className="block text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Missing Evidence</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--bs-text-secondary)]">
                  {evaluation.missing_evidence.map((me, i) => (
                    <li key={i}>{me}</li>
                  ))}
                </ul>
                <p className="text-xs text-[var(--bs-text-tertiary)] italic mt-2">
                  Missing evidence implies information was unavailable, not necessarily negative evidence.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </Card>
  );
};

export default EvaluationDetailPanel;
