import React from 'react';
import { Layers } from 'lucide-react';

const MetricCard = ({ title, value }) => (
  <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-4 flex flex-col justify-center">
    <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1 block">{title}</span>
    <span className="text-lg font-bold text-[var(--bs-text-primary)] capitalize">{value}</span>
  </div>
);

const ArchitectureHeader = ({ analysis }) => {
  if (!analysis) return null;

  const blueprint = analysis.blueprint || {};
  
  const compCount = blueprint.components?.length;
  const integrationsCount = blueprint.integration_points?.length;
  const dataFlowsCount = blueprint.data_flow?.length;
  const phasesCount = blueprint.implementation_phases?.length;
  const risksCount = blueprint.risks?.length;

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="h-6 w-6 text-[var(--bs-blue-500)]" />
          <h1 className="text-2xl font-bold text-[var(--bs-text-primary)] tracking-tight">
            ARCHITECTURE BLUEPRINT
          </h1>
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold border bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border-[var(--bs-border-light)] uppercase tracking-wider ml-2">
            {analysis.analysis_id}
          </span>
        </div>
        <p className="text-sm text-[var(--bs-text-secondary)] mt-2">
          Translate BuildScout's evidence-backed decisions into an implementation-ready architecture.
        </p>
      </div>

      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] shadow-sm rounded-lg p-6 mb-6">
        <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Architecture at a Glance</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard 
            title="Style" 
            value={blueprint.architecture_style || 'Not available'} 
          />
          <MetricCard 
            title="Components" 
            value={compCount !== undefined ? compCount : 'Not available'} 
          />
          <MetricCard 
            title="Integrations" 
            value={integrationsCount !== undefined ? integrationsCount : 'Not available'} 
          />
          <MetricCard 
            title="Data Flows" 
            value={dataFlowsCount !== undefined ? dataFlowsCount : 'Not available'} 
          />
          <MetricCard 
            title="Phases" 
            value={phasesCount !== undefined ? phasesCount : 'Not available'} 
          />
          <MetricCard 
            title="Risks" 
            value={risksCount !== undefined ? risksCount : 'Not available'} 
          />
        </div>
      </div>
    </div>
  );
};

export default ArchitectureHeader;

