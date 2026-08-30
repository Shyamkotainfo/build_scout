import React from 'react';
import Badge from '../ui/Badge';
import { Search } from 'lucide-react';

const EvaluationMatrix = ({ candidates, evaluations, decisions, selectedCandidate, onSelectCandidate }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-6">
        <p className="text-sm text-[var(--bs-text-secondary)] italic">No candidates available for this component.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-8">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
        Evaluation Matrix
      </h2>
      <div className="overflow-x-auto rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[var(--bs-bg-secondary)] border-b border-[var(--bs-border-light)] uppercase text-[10px] tracking-wider text-[var(--bs-text-tertiary)]">
            <tr>
              <th className="px-4 py-3 font-bold">Candidate</th>
              <th className="px-4 py-3 font-bold">Score</th>
              <th className="px-4 py-3 font-bold">Rel.</th>
              <th className="px-4 py-3 font-bold">Health</th>
              <th className="px-4 py-3 font-bold">Security</th>
              <th className="px-4 py-3 font-bold">License</th>
              <th className="px-4 py-3 font-bold text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bs-border-light)]">
            {candidates.map((candidate, idx) => {
              const evalData = evaluations?.find(e => e.candidate_name === candidate.name) || {};
              const decisionData = decisions?.find(d => d.selected_candidate_name === candidate.name);
              const isSelected = selectedCandidate?.name === candidate.name;
              
              const overallScore = evalData.score ?? evalData.overall_score;
              const relevance = evalData.dimensions?.relevance ?? evalData.relevance_score;
              const health = evalData.dimensions?.health ?? evalData.health_score ?? evalData.maturity_score;
              const security = evalData.dimensions?.security ?? evalData.security_score;
              const license = evalData.dimensions?.license ?? evalData.license_score;

              const formatScore = (val) => val != null ? (
                <span className="font-mono font-bold text-[var(--bs-text-primary)]">{val}</span>
              ) : (
                <span className="text-[10px] italic text-[var(--bs-text-tertiary)]">Not evaluated</span>
              );

              return (
                <tr 
                  key={`${candidate.name}-${idx}`} 
                  data-testid={`candidate-row-${candidate.name}`}
                  onClick={() => onSelectCandidate(candidate)}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[var(--bs-bg-tertiary)] border-l-2 border-l-[var(--bs-orange-500)]' 
                      : 'hover:bg-[var(--bs-bg-secondary)] border-l-2 border-l-transparent'
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-[var(--bs-text-primary)] flex items-center gap-2">
                    <span>{candidate.name}</span>
                    {decisionData && (
                      <Badge variant="success">SELECTED</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatScore(overallScore)}</td>
                  <td className="px-4 py-3">{formatScore(relevance)}</td>
                  <td className="px-4 py-3">{formatScore(health)}</td>
                  <td className="px-4 py-3">{formatScore(security)}</td>
                  <td className="px-4 py-3">{formatScore(license)}</td>
                  <td className="px-4 py-3 text-right">
                    {decisionData ? (
                      <span className={`font-bold text-[10px] tracking-widest px-2 py-1 rounded ${
                        decisionData.decision === 'REUSE' ? 'bg-[var(--bs-status-success)]/10 text-[var(--bs-status-success)] border border-[var(--bs-status-success)]/30' :
                        decisionData.decision === 'ADAPT' ? 'bg-[var(--bs-status-warning)]/10 text-[var(--bs-status-warning)] border border-[var(--bs-status-warning)]/30' :
                        decisionData.decision === 'BUILD' ? 'bg-[var(--bs-orange-500)]/10 text-[var(--bs-orange-500)] border border-[var(--bs-orange-500)]/30' :
                        'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border border-[var(--bs-border-light)]'
                      }`}>
                        {decisionData.decision}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EvaluationMatrix;
