import React from 'react';
import { Activity, Code, Server } from 'lucide-react';

const AgentTraceSection = ({ agentHistory, traces }) => {
  if (!agentHistory || agentHistory.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Agent Trace</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  // Fallback if traces aren't provided but history is
  const displayTraces = traces && traces.length > 0 
    ? traces 
    : agentHistory.map((node, i) => ({
        agent_name: node,
        status: 'COMPLETED',
        execution_order: i + 1,
        tool_calls: []
      }));

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-slate-400" /> Agent Execution Trace
      </h2>
      
      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-400 w-16">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Agent</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-400 w-32">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Tool Calls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {displayTraces.map((trace, i) => (
                <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500">
                    {trace.execution_order || i + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-300">{trace.agent_name}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                      trace.status === 'COMPLETED' ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                      trace.status === 'FAILED' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {trace.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {trace.tool_calls && trace.tool_calls.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {trace.tool_calls.map((tool, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300">
                            <Code className="h-3 w-3 text-slate-500" />
                            <span className="font-mono text-[10px]">{tool.server || tool.provider || 'system'}</span>
                            <span className="text-slate-500">/</span>
                            <span>{tool.name || tool.tool || 'unknown'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">No tools used</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentTraceSection;
