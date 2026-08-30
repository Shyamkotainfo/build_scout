import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { GitBranch, Link as LinkIcon, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getConfidencePercent } from '../../utils/formatters';

const ComponentDecisionPanel = ({ component, decision, allCandidates, analysisId }) => {
  if (!component) return null;

  if (!decision) {
    return (
      <Card className="bg-[var(--bs-bg-secondary)] border-[var(--bs-border-light)] p-6 mb-8">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
          Decision Intelligence
        </h2>
        <p className="text-sm text-[var(--bs-text-secondary)] italic">No decision has been made for {component.name} yet.</p>
      </Card>
    );
  }

  const decisionType = (decision.decision_type || decision.decision || '').toUpperCase();
  
  const getDecisionStyles = () => {
    switch (decisionType) {
      case 'REUSE': return { bg: 'bg-[var(--bs-status-success)]/10', border: 'border-[var(--bs-status-success)]', text: 'text-[var(--bs-status-success)]' };
      case 'ADAPT': return { bg: 'bg-[var(--bs-status-warning)]/10', border: 'border-[var(--bs-status-warning)]', text: 'text-[var(--bs-status-warning)]' };
      case 'BUILD': return { bg: 'bg-[var(--bs-orange-500)]/10', border: 'border-[var(--bs-orange-500)]', text: 'text-[var(--bs-orange-500)]' };
      default: return { bg: 'bg-[var(--bs-bg-tertiary)]', border: 'border-[var(--bs-border-light)]', text: 'text-[var(--bs-text-primary)]' };
    }
  };
  
  const styles = getDecisionStyles();
  const selectedCandidateName = decision.selected_candidate_name;

  // Extract alternatives correctly from either alternatives_considered or compute from allCandidates
  let alternatives = decision.alternatives_considered || [];
  if (alternatives.length === 0 && allCandidates && allCandidates.length > 0) {
    alternatives = allCandidates
      .filter(c => c.name !== selectedCandidateName)
      .map(c => ({ name: c.name }));
  }

  return (
    <div className="mb-8 border border-[var(--bs-border-light)] rounded-lg overflow-hidden shadow-sm bg-[var(--bs-bg-primary)]">
      {/* Header Banner */}
      <div className={`p-4 md:p-6 border-b ${styles.border} ${styles.bg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-start gap-4">
          <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center ${styles.border} border bg-[var(--bs-bg-primary)]`}>
            <GitBranch className={`h-4 w-4 ${styles.text}`} />
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1 flex items-center gap-2">
              Decision for {component.name}
            </h2>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold tracking-tight ${styles.text}`}>{decisionType}</span>
            </div>
            <p className="text-sm text-[var(--bs-text-secondary)] mt-1">
              {decisionType === 'REUSE' && 'Existing solution is suitable with minimal change.'}
              {decisionType === 'ADAPT' && 'Existing solution is valuable but requires modification.'}
              {decisionType === 'BUILD' && 'No candidate sufficiently satisfies the requirements.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end">
          <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Confidence</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-[var(--bs-text-primary)]">
              {getConfidencePercent(decision.confidence)}%
            </span>
            <div className="w-16 h-2 bg-[var(--bs-bg-tertiary)] rounded-full overflow-hidden border border-[var(--bs-border-light)]">
              <div 
                className={`h-full ${getConfidencePercent(decision.confidence) > 80 ? 'bg-[var(--bs-status-success)]' : getConfidencePercent(decision.confidence) > 50 ? 'bg-[var(--bs-status-warning)]' : 'bg-[var(--bs-status-critical)]'}`}
                style={{ width: `${getConfidencePercent(decision.confidence)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        
        {/* Selected Candidate and Reason */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block">Selected Candidate</span>
            {selectedCandidateName ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[var(--bs-status-success)]" />
                <span className="font-bold text-[var(--bs-text-primary)] text-lg">{selectedCandidateName}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--bs-orange-500)]" />
                <span className="font-bold text-[var(--bs-text-primary)] text-lg">Custom Implementation</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block">Why?</span>
            <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">
              {decision.reason || decision.rationale || 'Selected as the optimal path forward for this component.'}
            </p>
          </div>
        </div>

        {/* Alternatives Considered */}
        {alternatives.length > 0 && (
          <div className="pt-6 border-t border-[var(--bs-border-light)]">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block mb-4">Alternatives Considered</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {alternatives.map((alt, idx) => (
                <div key={idx} className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded p-3">
                  <span className="font-bold text-sm text-[var(--bs-text-primary)] block mb-1">{alt.name || alt}</span>
                  {(alt.reason_rejected || alt.reason) ? (
                    <p className="text-xs text-[var(--bs-text-tertiary)] mt-2 border-t border-[var(--bs-border-light)] pt-2">
                      {alt.reason_rejected || alt.reason}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--bs-text-tertiary)] mt-2 border-t border-[var(--bs-border-light)] pt-2 italic">
                      Did not score as highly as the selected candidate.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to Architecture */}
        <div className="pt-4 flex justify-end">
          <Link 
            to={`/architecture/${analysisId}`}
            className="text-xs font-bold text-[var(--bs-orange-500)] hover:text-[var(--bs-orange-400)] transition-colors uppercase tracking-widest flex items-center gap-1"
          >
            View in Architecture Blueprint <LinkIcon className="h-3 w-3" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ComponentDecisionPanel;
