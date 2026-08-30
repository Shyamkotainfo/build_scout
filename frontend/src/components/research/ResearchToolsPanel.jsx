import React from 'react';
import { Settings, Server, Globe } from 'lucide-react';

const ResearchToolsPanel = ({ traces }) => {
  if (!traces || traces.length === 0) {
    return (
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
        <p className="text-sm text-[var(--bs-text-secondary)]">No traces available.</p>
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
    if (p === 'FALLBACK') return <span className="bg-red-900/30 text-[var(--bs-status-critical)] border border-red-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">FALLBACK</span>;
    if (p === 'MCP') return <span className="bg-[var(--bs-orange-100)] text-[var(--bs-orange-600)] border border-[var(--bs-orange-200)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    if (p === 'LOCAL') return <span className="bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border border-[var(--bs-status-success-border)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOCAL</span>;
    return <span className="bg-[var(--bs-bg-secondary)] text-[var(--bs-text-tertiary)] border border-[var(--bs-border-light)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{p}</span>;
  };

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-6 flex flex-col h-[600px]">
      <h2 className="text-sm font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-6">MCP Architecture Visual</h2>
      
      {/* Architecture Visual */}
      <div className="mb-8 border border-[var(--bs-border-light)] rounded-lg bg-[var(--bs-bg-secondary)] p-4 font-mono text-xs text-[var(--bs-text-secondary)] flex flex-col items-center">
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] px-4 py-2 rounded text-[var(--bs-status-running)] font-bold shadow-sm">ResearchAgent</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="text-[var(--bs-text-secondary)]">↓</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] px-4 py-2 rounded text-yellow-400 font-bold shadow-sm">UnifiedToolGateway</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        <div className="text-[var(--bs-text-secondary)]">↓</div>
        <div className="h-4 w-px bg-slate-600 my-1"></div>
        
        <div className="w-full max-w-sm grid grid-cols-2 gap-4">
          <div className="border border-purple-900/50 bg-purple-900/10 rounded p-3">
            <div className="text-[var(--bs-orange-600)] font-bold mb-2 border-b border-purple-900/50 pb-1 flex items-center gap-1.5"><Globe className="h-3 w-3" /> External MCP</div>
            <ul className="space-y-1 text-[var(--bs-text-tertiary)]">
              <li>GitHub</li>
              <li>Tavily</li>
            </ul>
          </div>
          <div className="border border-emerald-900/50 bg-emerald-900/10 rounded p-3">
            <div className="text-[var(--bs-status-success)] font-bold mb-2 border-b border-emerald-900/50 pb-1 flex items-center gap-1.5"><Server className="h-3 w-3" /> Local Tools</div>
            <ul className="space-y-1 text-[var(--bs-text-tertiary)]">
              <li>Security</li>
              <li>License</li>
              <li>Architecture</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-4">Actual Tools Used</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {toolsUsed.length === 0 ? (
          <p className="text-sm text-[var(--bs-text-secondary)] italic text-center py-4">No tool calls recorded.</p>
        ) : (
          toolsUsed.map((tool, idx) => (
            <div key={idx} className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[var(--bs-text-secondary)]" />
                  <span className="font-semibold text-sm text-[var(--bs-text-primary)]">{tool.name || tool.tool}</span>
                </div>
                {getProviderBadge(tool.provider)}
              </div>
              <div className="text-xs font-mono text-[var(--bs-text-secondary)] bg-[var(--bs-bg-primary)]/50 p-2 rounded truncate">
                Server: {tool.server || 'Unknown'}
              </div>
              {tool.provider?.toUpperCase() === 'FALLBACK' && (
                <div className="mt-2 text-[11px] font-semibold text-[var(--bs-status-critical)] bg-red-900/20 px-2 py-1 rounded border border-red-900/50 flex items-center gap-1">
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
