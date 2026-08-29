import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const getDecisionStyle = (type) => {
  switch (type?.toUpperCase()) {
    case 'REUSE': return 'bg-[var(--bs-status-success)]/10 text-[var(--bs-status-success)] border-[var(--bs-status-success)]';
    case 'ADAPT': return 'bg-[var(--bs-status-warning)]/10 text-[var(--bs-status-warning)] border-[var(--bs-status-warning)]';
    case 'BUILD': return 'bg-[var(--bs-orange-500)]/10 text-[var(--bs-orange-500)] border-[var(--bs-orange-500)]';
    default: return 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border-[var(--bs-border-light)]';
  }
};

const ComponentArchitectureList = ({ blueprint, decisions, analysisId }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!blueprint?.components || blueprint.components.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold leading-6 text-[var(--bs-text-primary)] mb-4">Component Architecture</h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--bs-text-secondary)]">No components available.</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest flex items-center gap-2">
          <Layers className="h-4 w-4" /> Component Architecture Table
        </h2>
      </div>

      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bs-bg-secondary)] border-b border-[var(--bs-border-medium)]">
                <th className="px-4 py-3 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Component</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Technology</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Decision</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Purpose</th>
                <th className="px-4 py-3 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--bs-border-light)]">
              {blueprint.components.map((comp) => {
                const decisionData = decisions?.find(d => d.component_id === comp.component_id);
                const decisionType = decisionData?.decision || comp.decision;
                const isExpanded = expandedId === comp.component_id;
                const style = getDecisionStyle(decisionType);

                return (
                  <React.Fragment key={comp.component_id}>
                    <tr 
                      className="hover:bg-[var(--bs-bg-secondary)] cursor-pointer transition-colors"
                      onClick={() => toggleExpand(comp.component_id)}
                    >
                      <td className="px-4 py-4 text-sm font-bold text-[var(--bs-text-primary)]">
                        {comp.component_name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded bg-[var(--bs-status-running-light)] px-2 py-1 text-xs font-mono font-medium text-[var(--bs-status-running)] border border-[var(--bs-status-running-border)]">
                          {comp.technology || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {decisionType && (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase tracking-widest ${style}`}>
                            {decisionType}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--bs-text-secondary)] max-w-xs truncate">
                        {comp.responsibility}
                      </td>
                      <td className="px-4 py-4 text-[var(--bs-text-tertiary)]">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-[var(--bs-bg-secondary)] border-b border-[var(--bs-border-medium)]">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-bold text-[var(--bs-text-primary)] mb-2">{comp.component_name} Detail</h3>
                              
                              <div className="flex gap-3">
                                {analysisId && (
                                  <>
                                    <Link to={`/research/${analysisId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-1 uppercase tracking-widest transition-colors">
                                      Research Evidence <ExternalLink className="h-3 w-3" />
                                    </Link>
                                    <Link to={`/decisions/${analysisId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-1 uppercase tracking-widest transition-colors">
                                      Evaluation & Decision <ExternalLink className="h-3 w-3" />
                                    </Link>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <div>
                                <div className="mb-4">
                                  <h4 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Purpose & Responsibility</h4>
                                  <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">{comp.responsibility}</p>
                                </div>
                                <div className="mb-4">
                                  <h4 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Integration Points</h4>
                                  <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">{comp.integration || 'None specified'}</p>
                                </div>
                              </div>
                              
                              <div>
                                {decisionData && (
                                  <>
                                    <div className="mb-4">
                                      <h4 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Decision Rationale</h4>
                                      <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">{decisionData.reason}</p>
                                    </div>
                                    {decisionData.risks?.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="text-[10px] font-bold text-[var(--bs-status-warning)] uppercase tracking-widest mb-1">Implementation Risks</h4>
                                        <ul className="space-y-1">
                                          {decisionData.risks.map((r, i) => (
                                            <li key={i} className="text-sm text-[var(--bs-text-secondary)] flex items-start gap-2 before:content-['•'] before:text-[var(--bs-status-warning)]">{r}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {decisionData.implementation_notes?.length > 0 && (
                                      <div className="mb-4">
                                        <h4 className="text-[10px] font-bold text-[var(--bs-status-running)] uppercase tracking-widest mb-1">Implementation Notes</h4>
                                        <ul className="space-y-1">
                                          {decisionData.implementation_notes.map((note, i) => (
                                            <li key={i} className="text-sm text-[var(--bs-text-secondary)] flex items-start gap-2 before:content-['•'] before:text-[var(--bs-status-running)]">{note}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComponentArchitectureList;
