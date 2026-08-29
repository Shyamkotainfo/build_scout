import React from 'react';
import { ArrowDown, BrainCircuit } from 'lucide-react';

const ExecutionArchitecture = () => {
  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-6 mb-8 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-6">
        <BrainCircuit className="h-5 w-5 text-[var(--bs-status-running)]" />
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)]">BuildSmart Execution Architecture</h3>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">User Request</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">Multi-Agent Workflow</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48 border-[var(--bs-status-running-border)] shadow-sm">Research</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-status-running-border)]" />
        <div className="bg-[var(--bs-status-running-light)] border border-[var(--bs-status-running-border)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-status-running)] w-48">Unified Tool Gateway</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-status-running-border)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">MCP / Local Tools</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">Candidate Results</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">LLM Evaluation</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48">Decision</div>
        <ArrowDown className="h-4 w-4 text-[var(--bs-text-secondary)]" />
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] rounded px-4 py-2 text-xs font-medium text-[var(--bs-text-secondary)] w-48 border-[var(--bs-status-success-border)] shadow-sm">Blueprint</div>
      </div>
    </div>
  );
};

export default ExecutionArchitecture;
