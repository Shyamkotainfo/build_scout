import React from 'react';
import { Activity, CheckCircle, XCircle, Wrench, Globe, TerminalSquare } from 'lucide-react';

const TraceSummary = ({ traces, agentHistory, metrics }) => {
  const agentsExecuted = agentHistory?.length || 0;
  
  // Calculate statuses from actual trace data
  let successfulAgents = 0;
  let failedAgents = 0;
  let totalToolCalls = 0;
  let mcpCalls = 0;
  let localCalls = 0;
  let fallbackCalls = 0;

  (traces || []).forEach(trace => {
    if (trace.status === 'COMPLETED') successfulAgents++;
    else if (trace.status === 'FAILED') failedAgents++;

    if (trace.tool_calls) {
      totalToolCalls += trace.tool_calls.length;
      trace.tool_calls.forEach(tool => {
        const p = tool.provider?.toUpperCase();
        if (p === 'MCP') mcpCalls++;
        else if (p === 'LOCAL') localCalls++;
        else if (p === 'FALLBACK') fallbackCalls++;
      });
    }
  });

  // If no detailed trace status but agents exist, we might not have success/fail counts
  // We just show what we calculated directly.

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        
        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Agents Executed</span>
          <span className="text-2xl font-bold text-white">{agentsExecuted}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Successful</span>
          <span className="text-2xl font-bold text-green-400">{successfulAgents}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Failed</span>
          <span className="text-2xl font-bold text-red-400">{failedAgents}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Wrench className="h-3 w-3" /> Total Tool Calls</span>
          <span className="text-2xl font-bold text-blue-400">{totalToolCalls}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Globe className="h-3 w-3" /> MCP Calls</span>
          <span className="text-2xl font-bold text-purple-400">{mcpCalls}</span>
        </div>

        <div className="flex flex-col pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TerminalSquare className="h-3 w-3" /> Fallback Calls</span>
          <span className="text-2xl font-bold text-yellow-400">{fallbackCalls}</span>
        </div>

      </div>

      {metrics && Object.keys(metrics).length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">LLM Model</span>
            <span className="text-sm font-mono text-slate-300">{metrics.model || 'Unknown'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tokens</span>
            <span className="text-sm font-mono text-slate-300">{metrics.total_tokens?.toLocaleString() || 'Unknown'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Average Latency</span>
            <span className="text-sm font-mono text-slate-300">{metrics.average_latency_ms ? `${metrics.average_latency_ms}ms` : 'Unknown'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">API Retries</span>
            <span className="text-sm font-mono text-slate-300">{metrics.total_retries || '0'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraceSummary;
