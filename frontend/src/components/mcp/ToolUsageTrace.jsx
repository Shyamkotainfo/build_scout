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
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center shadow-sm">
        <Wrench className="h-8 w-8 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Tools Executed</h3>
        <p className="text-sm text-slate-500">There are no recorded tool calls for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">Tools Used in This Analysis</h2>
        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full text-xs font-bold">
          {allToolCalls.length} calls
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allToolCalls.map((call, idx) => (
          <div key={idx} className="flex flex-col relative">
            <span className="absolute -top-3 left-4 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 shadow-sm shadow-slate-950">
              Agent: <span className="text-emerald-400">{call.agentName}</span>
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
