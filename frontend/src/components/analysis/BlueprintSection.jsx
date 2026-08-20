import React from 'react';
import { Layers, Database, ArrowRightLeft, Target, AlertTriangle } from 'lucide-react';

const BlueprintSection = ({ blueprint }) => {
  if (!blueprint || Object.keys(blueprint).length === 0 || !blueprint.architecture_style) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Architecture Blueprint</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold leading-6 text-white mb-6">Architecture Blueprint</h2>
      
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Solution Summary</h3>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              {blueprint.solution_summary || 'Not provided.'}
            </p>
          </div>
          <div className="md:w-64 shrink-0 flex flex-col gap-2">
            <div className="bg-slate-900/50 rounded-md p-4 border border-slate-700/50 h-full flex flex-col justify-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Architecture Style</span>
              <span className="text-lg font-bold text-blue-400 capitalize">{blueprint.architecture_style || 'Unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-500" /> Blueprint Components
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700 bg-slate-800/50">
            <thead className="bg-slate-900/50">
              <tr>
                <th scope="col" className="py-3 pl-4 text-left text-xs font-semibold text-slate-400">Component</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-400">Technology</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-400">Responsibility</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-slate-400">Integration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {blueprint.components && blueprint.components.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800 transition-colors">
                  <td className="py-3 pl-4 align-top">
                    <div className="text-sm font-medium text-slate-200">{c.component_name}</div>
                    <div className="text-xs font-mono text-slate-500">{c.component_id}</div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span className="inline-flex items-center rounded bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-800/50">
                      {c.technology}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-300 align-top">{c.responsibility}</td>
                  <td className="px-3 py-3 text-sm text-slate-400 align-top">{c.integration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Flow & Integrations */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-500" /> Data Flow
            </h3>
            {blueprint.data_flow && blueprint.data_flow.length > 0 ? (
              <ul className="space-y-3">
                {blueprint.data_flow.map((flow, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span> {flow}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No data flow documented.</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-slate-500" /> Integration Points
            </h3>
            {blueprint.integration_points && blueprint.integration_points.length > 0 ? (
              <ul className="space-y-3">
                {blueprint.integration_points.map((pt, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-slate-200">{pt.name || 'Integration'}: </span>
                      {pt.description || JSON.stringify(pt)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No integration points documented.</p>
            )}
          </div>
        </div>

        {/* Phases, Assumptions, Risks */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-slate-500" /> Implementation Phases
            </h3>
            {blueprint.implementation_phases && blueprint.implementation_phases.length > 0 ? (
              <div className="space-y-4">
                {blueprint.implementation_phases.map((phase, i) => (
                  <div key={i} className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-px before:bg-slate-700 last:before:hidden">
                    <span className="absolute left-[3px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-slate-800" />
                    <h4 className="text-sm font-bold text-slate-200 mb-1">{phase.phase || `Phase ${i+1}`}</h4>
                    <p className="text-sm text-slate-400">{phase.description || JSON.stringify(phase)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No phases documented.</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-500" /> Assumptions & Risks
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Assumptions</h4>
                {blueprint.assumptions && blueprint.assumptions.length > 0 ? (
                  <ul className="space-y-1">
                    {blueprint.assumptions.map((a, i) => (
                      <li key={i} className="text-sm text-slate-300 before:content-['•'] before:mr-2 before:text-slate-600">{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">None documented.</p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Risks</h4>
                {blueprint.risks && blueprint.risks.length > 0 ? (
                  <ul className="space-y-1">
                    {blueprint.risks.map((r, i) => (
                      <li key={i} className="text-sm text-red-300/80 before:content-['•'] before:mr-2 before:text-red-900">{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">None documented.</p>
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
