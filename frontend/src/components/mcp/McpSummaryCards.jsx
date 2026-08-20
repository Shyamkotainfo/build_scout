import React from 'react';
import { Activity, Globe, TerminalSquare, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const McpSummaryCards = ({ traces }) => {
  let mcpCalls = 0;
  let localCalls = 0;
  let fallbackCalls = 0;
  let successfulCalls = 0;
  let failedCalls = 0;

  let hasData = false;

  (traces || []).forEach(trace => {
    if (trace.tool_calls && trace.tool_calls.length > 0) {
      hasData = true;
      trace.tool_calls.forEach(tool => {
        const p = tool.provider?.toUpperCase();
        if (p === 'MCP') mcpCalls++;
        else if (p === 'LOCAL') localCalls++;
        else if (p === 'FALLBACK') fallbackCalls++;

        const s = tool.status?.toUpperCase();
        if (s === 'SUCCESS' || s === 'COMPLETED') successfulCalls++;
        else if (s === 'FAILED' || s === 'ERROR') failedCalls++;
      });
    }
  });

  if (!hasData) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm flex items-center justify-center">
        <span className="text-sm text-slate-500">Tool execution data is unknown or unavailable for this analysis.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        
        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Globe className="h-3 w-3" /> MCP Calls</span>
          <span className="text-2xl font-bold text-purple-400">{mcpCalls}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Local Tool Calls</span>
          <span className="text-2xl font-bold text-emerald-400">{localCalls}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-yellow-500" /> Fallback Calls</span>
          <span className="text-2xl font-bold text-yellow-400">{fallbackCalls}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> Successful Calls</span>
          <span className="text-2xl font-bold text-green-400">{successfulCalls}</span>
        </div>

        <div className="flex flex-col pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Failed Calls</span>
          <span className="text-2xl font-bold text-red-400">{failedCalls}</span>
        </div>

      </div>
    </div>
  );
};

export default McpSummaryCards;
