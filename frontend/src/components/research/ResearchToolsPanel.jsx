import React from 'react';
import { Settings, Server, Globe } from 'lucide-react';

const ResearchToolsPanel = ({ traces }) => {
  if (!traces || traces.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
        <p className="text-sm text-slate-500">No traces available.</p>
      </div>
    );
  }

  // Extract all tools safely
  const toolsUsed = [];
  traces.forEach(trace => {
    if (trace.tool_calls) {
      trace.tool_calls.forEach(call => {
        toolsUsed.push(call);
      });
    }
  });

  const getProviderBadge = (provider) => {
    const p = provider?.toUpperCase() || 'SYSTEM';
    if (p === 'FALLBACK') return <span className="bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">FALLBACK</span>;
    if (p === 'MCP') return <span className="bg-purple-900/30 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    if (p === 'LOCAL') return <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOCAL</span>;
    return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{p}</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 flex flex-col h-[600px]">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">MCP Architecture Visual</h2>
      
      {/* Architecture Visual */}
      <div className="mb-8 border border-slate-700 rounded-lg bg-slate-800/50 p-4 font-mono text-xs text-slate-300 flex flex-col items-center">
        <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded text-blue-400 font-bold shadow-sm">ResearchAgent</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="text-slate-500">↓</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="bg-slate-800 border border-slate-600 px-4 py-2 rounded text-yellow-400 font-bold shadow-sm">UnifiedToolGateway</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="text-slate-500">↓</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        
        <div className="w-full max-w-sm grid grid-cols-2 gap-4">
          <div className="border border-purple-900/50 bg-purple-900/10 rounded p-3">
            <div className="text-purple-400 font-bold mb-2 border-b border-purple-900/50 pb-1 flex items-center gap-1.5"><Globe className="h-3 w-3" /> External MCP</div>
            <ul className="space-y-1 text-slate-400">
              <li>GitHub</li>
              <li>Tavily</li>
            </ul>
          </div>
          <div className="border border-emerald-900/50 bg-emerald-900/10 rounded p-3">
            <div className="text-emerald-400 font-bold mb-2 border-b border-emerald-900/50 pb-1 flex items-center gap-1.5"><Server className="h-3 w-3" /> Local Tools</div>
            <ul className="space-y-1 text-slate-400">
              <li>Security</li>
              <li>License</li>
              <li>Architecture</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Actual Tools Used</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {toolsUsed.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">No tool calls recorded.</p>
        ) : (
          toolsUsed.map((tool, idx) => (
            <div key={idx} className="bg-slate-800 border border-slate-700 rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-sm text-slate-200">{tool.name || tool.tool}</span>
                </div>
                {getProviderBadge(tool.provider)}
              </div>
              <div className="text-xs font-mono text-slate-500 bg-slate-950/50 p-2 rounded truncate">
                Server: {tool.server || 'Unknown'}
              </div>
              {tool.provider?.toUpperCase() === 'FALLBACK' && (
                <div className="mt-2 text-[11px] font-semibold text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-900/50 flex items-center gap-1">
                  External MCP unavailable — local fallback used
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResearchToolsPanel;
