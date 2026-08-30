import React from 'react';

const MetricCard = ({ title, value }) => {
  const displayValue = value === undefined || value === null ? 'N/A' : value;
  
  return (
    <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-4 flex flex-col justify-center">
      <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1 block">{title}</span>
      <span className="text-lg font-bold text-[var(--bs-text-primary)] capitalize">{displayValue}</span>
    </div>
  );
};

const ArchitectureHeader = ({ analysis }) => {
  if (!analysis) return null;

  const blueprint = analysis.blueprint || {};
  
  const compCount = blueprint.components?.length;
  const integrationsCount = blueprint.integration_points?.length;
  const dataFlowsCount = blueprint.data_flow?.length;
  const phasesCount = blueprint.implementation_phases?.length;
  const risksCount = blueprint.risks?.length;

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] shadow-sm rounded-lg p-6 mb-10">
      <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Architecture at a Glance</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard 
          title="Style" 
          value={blueprint.architecture_style} 
        />
        <MetricCard 
          title="Components" 
          value={compCount} 
        />
        <MetricCard 
          title="Integrations" 
          value={integrationsCount} 
        />
        <MetricCard 
          title="Data Flows" 
          value={dataFlowsCount} 
        />
        <MetricCard 
          title="Phases" 
          value={phasesCount} 
        />
        <MetricCard 
          title="Risks" 
          value={risksCount} 
        />
      </div>
    </div>
  );
};

export default ArchitectureHeader;

