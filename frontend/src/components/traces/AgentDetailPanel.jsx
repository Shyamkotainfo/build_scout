import React from 'react';
import { Terminal, Wrench } from 'lucide-react';
import ToolCallItem from './ToolCallItem';

const AgentDetailPanel = ({ agentTrace }) => {
  if (!agentTrace) {
    return (
      <div className="flex-1 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] border-dashed rounded-lg flex items-center justify-center h-[700px]">
        <p className="text-[var(--bs-text-secondary)]">Select an agent from the timeline to view execution details.</p>
      </div>
    );
  }

  const toolCalls = agentTrace.tool_calls || [];

  return (
    <div className="flex-1 bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg flex flex-col h-[700px]">
      
      {/* Header */}
      <div className="p-6 border-b border-[var(--bs-border-light)] flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--bs-bg-tertiary)] rounded-t-lg">
        <div>
          <h2 className="text-xl font-bold text-[var(--bs-text-primary)] flex items-center gap-2 mb-1">
            <Terminal className="h-5 w-5 text-[var(--bs-orange-500)]" /> {agentTrace.agent_name || agentTrace.agent}
          </h2>
          <div className="text-sm font-mono text-[var(--bs-text-secondary)]">
            Status: <span className={agentTrace.status === 'COMPLETED' ? 'text-[var(--bs-status-success)]' : agentTrace.status === 'FAILED' ? 'text-[var(--bs-status-critical)]' : 'text-[var(--bs-text-tertiary)]'}>{agentTrace.status || 'UNKNOWN'}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-[var(--bs-bg-primary)] rounded p-2 border border-[var(--bs-border-light)] text-center min-w-[80px]">
            <span className="block text-[10px] font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-0.5">Execution</span>
            <span className="text-sm font-mono text-[var(--bs-text-primary)]">#{agentTrace.execution_order}</span>
          </div>
          {agentTrace.latency_ms && (
            <div className="bg-[var(--bs-bg-primary)] rounded p-2 border border-[var(--bs-border-light)] text-center min-w-[80px]">
              <span className="block text-[10px] font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-0.5">Latency</span>
              <span className="text-sm font-mono text-[var(--bs-text-primary)]">{agentTrace.latency_ms}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Tool Calls List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-6 flex items-center gap-2">
          <Wrench className="h-4 w-4" /> Tool Calls ({toolCalls.length})
        </h3>
        
        {toolCalls.length === 0 ? (
          <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center text-sm text-[var(--bs-text-secondary)]">
            No tool calls were recorded for this agent.
          </div>
        ) : (
          <div className="space-y-4">
            {toolCalls.map((call, idx) => (
              <ToolCallItem key={idx} call={call} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AgentDetailPanel;
