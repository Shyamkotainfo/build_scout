import React from 'react';
import { CheckCircle2, Circle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

const AgentTimeline = ({ agentHistory, traces, selectedTrace, onSelectTrace }) => {
  if (!agentHistory || agentHistory.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center w-full md:w-80 shrink-0">
        <p className="text-sm text-slate-500">No agent history available.</p>
      </div>
    );
  }

  // Map history to traces if available
  const timelineNodes = agentHistory.map((agentName, idx) => {
    const matchingTrace = traces?.find(t => t.agent_name === agentName || t.agent === agentName);
    return {
      agent_name: agentName,
      status: matchingTrace?.status || 'UNKNOWN',
      execution_order: matchingTrace?.execution_order || idx + 1,
      latency: matchingTrace?.latency_ms,
      originalTrace: matchingTrace
    };
  });

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle2 className="h-5 w-5 text-green-500 z-10 bg-slate-900" />;
      case 'FAILED': return <AlertCircle className="h-5 w-5 text-red-500 z-10 bg-slate-900" />;
      case 'RUNNING': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin z-10 bg-slate-900" />;
      default: return <HelpCircle className="h-5 w-5 text-slate-500 z-10 bg-slate-900" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full lg:w-80 shrink-0 flex flex-col h-[700px]">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Agent Sequence</h2>
      
      <div className="flex-1 overflow-y-auto pr-2 relative">
        <div className="absolute top-2 bottom-2 left-2.5 w-px bg-slate-700/50"></div>
        <ul className="space-y-6">
          {timelineNodes.map((node, i) => {
            const isSelected = selectedTrace?.agent_name === node.agent_name;
            
            return (
              <li key={i} className="relative flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(node.status)}
                </div>
                <div className="flex-1">
                  <button
                    onClick={() => onSelectTrace(node.originalTrace || node)}
                    className={`text-left w-full p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-slate-800 border-blue-500/50 ring-1 ring-blue-500/30' 
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                        {node.agent_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">
                        {String(node.execution_order).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={
                        node.status === 'COMPLETED' ? 'text-green-400/80' :
                        node.status === 'FAILED' ? 'text-red-400/80' : 'text-slate-500'
                      }>
                        {node.status}
                      </span>
                      {node.latency && <span className="text-slate-500 font-mono">{node.latency}ms</span>}
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AgentTimeline;
