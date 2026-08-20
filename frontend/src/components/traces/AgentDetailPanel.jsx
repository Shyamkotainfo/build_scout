import React from 'react';
import { Terminal, Wrench } from 'lucide-react';
import ToolCallItem from './ToolCallItem';

const AgentDetailPanel = ({ agentTrace }) => {
  if (!agentTrace) {
    return (
      <div className="flex-1 bg-slate-800/30 border border-slate-700 border-dashed rounded-lg flex items-center justify-center h-[700px]">
        <p className="text-slate-500">Select an agent from the timeline to view execution details.</p>
      </div>
    );
  }

  const toolCalls = agentTrace.tool_calls || [];

  return (
    <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg flex flex-col h-[700px]">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-800/50">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Terminal className="h-5 w-5 text-emerald-500" /> {agentTrace.agent_name || agentTrace.agent}
          </h2>
          <div className="text-sm font-mono text-slate-500">
            Status: <span className={agentTrace.status === 'COMPLETED' ? 'text-green-400' : agentTrace.status === 'FAILED' ? 'text-red-400' : 'text-slate-400'}>{agentTrace.status || 'UNKNOWN'}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 rounded p-2 border border-slate-700 text-center min-w-[80px]">
            <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Execution</span>
            <span className="text-sm font-mono text-slate-300">#{agentTrace.execution_order}</span>
          </div>
          {agentTrace.latency_ms && (
            <div className="bg-slate-900 rounded p-2 border border-slate-700 text-center min-w-[80px]">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Latency</span>
              <span className="text-sm font-mono text-slate-300">{agentTrace.latency_ms}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Tool Calls List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Wrench className="h-4 w-4" /> Tool Calls ({toolCalls.length})
        </h3>
        
        {toolCalls.length === 0 ? (
          <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center text-sm text-slate-500">
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
