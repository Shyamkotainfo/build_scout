import React, { useState } from 'react';
import Badge from '../ui/Badge';
import { ArrowUpDown } from 'lucide-react';

const DecisionsSection = ({ decisions }) => {
  const [filter, setFilter] = useState('ALL');
  
  if (!decisions || decisions.length === 0) {
    return null;
  }

  const normalizedDecisions = decisions.map(d => ({
    ...d,
    decisionType: (d.decision_type || d.decision || 'UNKNOWN').toUpperCase()
  }));

  const buildDecisions = normalizedDecisions.filter(d => d.decisionType === 'BUILD');
  
  const filteredDecisions = filter === 'ALL' 
    ? normalizedDecisions 
    : normalizedDecisions.filter(d => d.decisionType === filter);

  return (
    <div className="flex flex-col gap-10 mb-12">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)]">
            DECISION TABLE
          </h2>
          <div className="flex items-center gap-2 bg-[var(--bs-bg-secondary)] p-1 rounded-md border border-[var(--bs-border-light)]">
            {['ALL', 'REUSE', 'ADAPT', 'BUILD'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                  filter === f
                    ? 'bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-primary)] shadow-sm'
                    : 'text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-secondary)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bs-bg-secondary)] border-b border-[var(--bs-border-light)] uppercase text-[10px] tracking-wider text-[var(--bs-text-tertiary)]">
              <tr>
                <th className="px-6 py-4 font-bold">Component</th>
                <th className="px-6 py-4 font-bold">Decision</th>
                <th className="px-6 py-4 font-bold">Selected Solution</th>
                <th className="px-6 py-4 font-bold">Confidence</th>
                <th className="px-6 py-4 font-bold max-w-xs truncate">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bs-border-light)]">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-[var(--bs-text-secondary)]">
                    No decisions found for this filter.
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((decision, idx) => (
                  <tr key={`${decision.component_id}-${idx}`} className="hover:bg-[var(--bs-bg-secondary)] transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-[var(--bs-text-primary)]">
                      {decision.component_id}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          decision.decisionType === 'REUSE'
                            ? 'success'
                            : decision.decisionType === 'ADAPT'
                            ? 'warning'
                            : decision.decisionType === 'BUILD'
                            ? 'orange'
                            : 'default'
                        }
                      >
                        {decision.decisionType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[var(--bs-text-primary)]">
                      {decision.selected_candidate_name || 'Custom Implementation'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[var(--bs-text-secondary)]">
                          {Math.round((decision.confidence || 0) * 100)}%
                        </span>
                        <div className="w-16 h-1.5 bg-[var(--bs-bg-tertiary)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${decision.confidence > 0.8 ? 'bg-[var(--bs-status-success)]' : decision.confidence > 0.5 ? 'bg-[var(--bs-status-warning)]' : 'bg-[var(--bs-status-critical)]'}`}
                            style={{ width: `${Math.min(100, Math.max(0, (decision.confidence || 0) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal min-w-[250px] max-w-md text-xs text-[var(--bs-text-secondary)]">
                      {decision.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {buildDecisions.length > 0 && (
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-4">
            WHY BUILD?
          </h2>
          <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
            These capabilities did not have sufficiently strong existing candidates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildDecisions.map((decision, idx) => (
              <div key={idx} className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-5 rounded-lg flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-[var(--bs-text-primary)]">{decision.component_id}</span>
                  <span className="text-xs font-bold text-[var(--bs-orange-500)] bg-[var(--bs-bg-primary)] border border-[var(--bs-orange-500)] px-2 py-0.5 rounded">
                    BUILD
                  </span>
                </div>
                <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed flex-1">
                  {decision.reason}
                </p>
                {decision.risks && decision.risks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--bs-border-light)]">
                    <span className="text-xs font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)] mb-2 block">
                      Build Risks
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--bs-text-secondary)]">
                      {decision.risks.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionsSection;
