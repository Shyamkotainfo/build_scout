import React from 'react';
import Card from '../ui/Card';
import { ArrowRight } from 'lucide-react';

const StageNode = ({ label }) => (
  <div className="relative group shrink-0">
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--bs-orange-400)] to-[var(--bs-orange-600)] rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
    <div className="relative bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] shadow-sm shadow-[var(--bs-bg-tertiary)] group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-[var(--bs-orange-400)] transition-all duration-300 rounded-lg px-4 py-2.5 flex items-center justify-center">
      <span className="text-[10px] md:text-xs font-bold text-[var(--bs-text-secondary)] group-hover:text-[var(--bs-orange-500)] uppercase tracking-widest transition-colors">{label}</span>
    </div>
  </div>
);

const Connector = () => (
  <>
    <div className="flex-1 min-w-[12px] h-0.5 bg-gradient-to-r from-[var(--bs-border-light)] to-[var(--bs-border-medium)] mx-1 hidden md:block rounded-full"></div>
    <ArrowRight className="md:hidden w-3 h-3 text-[var(--bs-border-medium)] mx-1 shrink-0" />
  </>
);

const AgentWorkflowVisualizer = () => {
  return (
    <Card className="mb-6 overflow-hidden bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] shadow-inner">
      <div className="p-6 md:p-8 flex flex-col items-center justify-center relative">
        <span className="text-[10px] md:text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-6">
          How BuildScout Works
        </span>
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <StageNode label="Prompt" />
          <Connector />
          <StageNode label="Discover" />
          <Connector />
          <StageNode label="Evaluate" />
          <Connector />
          <StageNode label="Decide" />
          <Connector />
          <StageNode label="Blueprint" />
          <Connector />
          <StageNode label="Validate" />
        </div>
      </div>
    </Card>
  );
};

export default AgentWorkflowVisualizer;
