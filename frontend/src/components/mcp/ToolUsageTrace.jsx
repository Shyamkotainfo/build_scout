import React from 'react';
import ToolCallItem from '../traces/ToolCallItem';
import { Wrench } from 'lucide-react';

const ToolUsageTrace = ({ traces }) => {
  const allToolCalls = [];
  (traces || []).forEach(trace => {
    if (trace.tool_calls) {
      trace.tool_calls.forEach(tc => {
        allToolCalls.push({
          ...tc,
          agentName: trace.agent_name || trace.agent || 'Unknown'
        });
      });
    }
  });

  if (allToolCalls.length === 0) {
    return (
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-8 text-center shadow-sm">
        <Wrench className="h-8 w-8 text-[var(--bs-text-muted)] mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[var(--bs-text-primary)] mb-2">No Tools Executed</h3>
        <p className="text-sm text-[var(--bs-text-secondary)]">There are no recorded tool calls for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-[var(--bs-text-primary)] tracking-wide">Tools Used in This Analysis</h2>
        <span className="bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border border-[var(--bs-border-light)] px-2 py-0.5 rounded-full text-xs font-bold">
          {allToolCalls.length} calls
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allToolCalls.map((call, idx) => (
          <div key={idx} className="flex flex-col relative">
            <span className="absolute -top-3 left-4 bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] px-2 py-0.5 rounded text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-wider z-10 shadow-sm">
              Agent: <span className="text-[var(--bs-orange-500)]">{call.agentName}</span>
            </span>
            <div className="pt-2">
              <ToolCallItem call={call} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolUsageTrace;
