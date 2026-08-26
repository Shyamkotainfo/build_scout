import React from 'react';
import { Target, AlertTriangle, FileWarning } from 'lucide-react';

const PhasesAndRisks = ({ blueprint }) => {
  if (!blueprint) return null;

  const phases = blueprint.implementation_phases || [];
  const assumptions = blueprint.assumptions || [];
  const risks = blueprint.risks || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
      {/* Implementation Phases */}
      <div>
        <h2 className="text-lg font-semibold leading-6 text-white mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" /> Implementation Phases
        </h2>
        {phases.length === 0 ? (
          <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
            <p className="text-sm text-slate-500">No implementation phases available.</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="space-y-6">
              {phases.map((phase, i) => (
                <div key={i} className="relative pl-8 before:absolute before:left-2.5 before:top-3 before:bottom-[-24px] before:w-px before:bg-slate-700 last:before:hidden">
                  <span className="absolute left-[5px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                  <h4 className="text-base font-bold text-slate-200 mb-1">{phase.phase || `Phase ${i+1}`}</h4>
                  <p className="text-sm text-slate-400">{phase.description || JSON.stringify(phase)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assumptions & Risks */}
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold leading-6 text-white mb-4 flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-yellow-500" /> Assumptions
          </h2>
          {assumptions.length === 0 ? (
            <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-6 text-center">
              <p className="text-sm text-slate-500">No assumptions recorded.</p>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
              <ul className="space-y-2">
                {assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2 before:content-['•'] before:text-slate-500">{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold leading-6 text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" /> Architectural Risks
          </h2>
          {risks.length === 0 ? (
            <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-6 text-center">
              <p className="text-sm text-slate-500">No risks recorded.</p>
            </div>
          ) : (
            <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-5">
              <ul className="space-y-2">
                {risks.map((r, i) => (
                  <li key={i} className="text-sm text-red-200/80 flex items-start gap-2 before:content-['•'] before:text-red-500">{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhasesAndRisks;
