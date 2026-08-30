import React from 'react';
import { Layers, Database, ArrowRightLeft, Target, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge';

const BlueprintSection = ({ blueprint }) => {
  if (!blueprint || Object.keys(blueprint).length === 0 || !blueprint.architecture_style) {
    return null;
  }

  return (
    <div className="flex flex-col mb-12">
      <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-6 flex items-center gap-2 uppercase">
        <Layers className="w-5 h-5 text-[var(--bs-orange-500)]" />
        Architecture Preview
      </h2>
      
      {/* Summary Header */}
      <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-6 mb-6 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Solution Summary</h3>
          <p className="text-[var(--bs-text-secondary)] text-sm leading-relaxed">
            {blueprint.solution_summary || 'Not provided.'}
          </p>
        </div>
        <div className="md:w-64 shrink-0 flex flex-col gap-2">
          <div className="bg-[var(--bs-bg-primary)] rounded-md p-4 border border-[var(--bs-border-light)] h-full flex flex-col justify-center">
            <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Architecture Style</span>
            <span className="text-lg font-bold text-[var(--bs-orange-500)] capitalize">{blueprint.architecture_style || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Flow & Integrations */}
        <div className="space-y-6">
          <div className="bg-[var(--bs-bg-secondary)] rounded-lg p-5 border border-[var(--bs-border-light)]">
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Database className="h-4 w-4" /> Data Flow
            </h3>
            {blueprint.data_flow && blueprint.data_flow.length > 0 ? (
              <ul className="space-y-3">
                {blueprint.data_flow.map((flow, i) => (
                  <li key={i} className="text-sm text-[var(--bs-text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--bs-orange-500)] mt-0.5 flex-shrink-0">→</span> {flow}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--bs-text-tertiary)]">No data flow documented.</p>
            )}
          </div>

          <div className="bg-[var(--bs-bg-secondary)] rounded-lg p-5 border border-[var(--bs-border-light)]">
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Integration Points
            </h3>
            {blueprint.integration_points && blueprint.integration_points.length > 0 ? (
              <ul className="space-y-3">
                {blueprint.integration_points.map((pt, i) => (
                  <li key={i} className="text-sm text-[var(--bs-text-secondary)] flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--bs-orange-500)] mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--bs-text-primary)]">{pt.name || 'Integration'}: </span>
                      {pt.description || JSON.stringify(pt)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--bs-text-tertiary)]">No integration points documented.</p>
            )}
          </div>
        </div>

        {/* Phases, Assumptions, Risks */}
        <div className="space-y-6">
          <div className="bg-[var(--bs-bg-secondary)] rounded-lg p-5 border border-[var(--bs-border-light)]">
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" /> Implementation Phases
            </h3>
            {blueprint.implementation_phases && blueprint.implementation_phases.length > 0 ? (
              <div className="space-y-4">
                {blueprint.implementation_phases.map((phase, i) => (
                  <div key={i} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-[var(--bs-border-light)] last:before:hidden">
                    <span className="absolute left-[3px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--bs-orange-500)] ring-4 ring-[var(--bs-bg-secondary)]" />
                    <h4 className="text-sm font-bold text-[var(--bs-text-primary)] mb-1">{phase.phase || `Phase ${i+1}`}</h4>
                    <p className="text-sm text-[var(--bs-text-secondary)]">{phase.description || JSON.stringify(phase)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--bs-text-tertiary)]">No phases documented.</p>
            )}
          </div>

          <div className="bg-[var(--bs-bg-secondary)] rounded-lg p-5 border border-[var(--bs-border-light)]">
            <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Assumptions & Risks
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[var(--bs-text-tertiary)] mb-2 uppercase">Assumptions</h4>
                {blueprint.assumptions && blueprint.assumptions.length > 0 ? (
                  <ul className="space-y-1">
                    {blueprint.assumptions.map((a, i) => (
                      <li key={i} className="text-sm text-[var(--bs-text-secondary)] before:content-['•'] before:mr-2 before:text-[var(--bs-text-tertiary)]">{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--bs-text-tertiary)]">None documented.</p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--bs-text-tertiary)] mb-2 uppercase">Risks</h4>
                {blueprint.risks && blueprint.risks.length > 0 ? (
                  <ul className="space-y-1">
                    {blueprint.risks.map((r, i) => (
                      <li key={i} className="text-sm text-[var(--bs-status-critical)] before:content-['•'] before:mr-2 before:text-[var(--bs-status-critical)] opacity-90">{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--bs-text-tertiary)]">None documented.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueprintSection;
