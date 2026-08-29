import React from 'react';
import { Search, Settings, Server, Globe } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Link } from 'react-router-dom';

const SearchTracePanel = ({ traces, analysisId }) => {
  if (!traces || traces.length === 0) {
    return (
      <Card className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-6 h-full flex flex-col justify-center items-center text-center">
        <p className="text-sm text-[var(--bs-text-secondary)]">No search traces available.</p>
      </Card>
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
    if (p === 'FALLBACK') return <Badge variant="error">FALLBACK</Badge>;
    if (p === 'MCP') return <span className="bg-[var(--bs-orange-100)] text-[var(--bs-orange-600)] border border-[var(--bs-orange-200)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    if (p === 'LOCAL') return <Badge variant="success">LOCAL</Badge>;
    return <Badge variant="default">{p}</Badge>;
  };

  return (
    <Card className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-6 flex flex-col h-[600px]">
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-4 w-4 text-[var(--bs-text-tertiary)]" />
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">How BuildScout Searched</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
        {toolsUsed.length === 0 ? (
          <p className="text-sm text-[var(--bs-text-secondary)] italic text-center py-4">No tool calls recorded.</p>
        ) : (
          toolsUsed.map((tool, idx) => (
            <div key={idx} className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[var(--bs-text-tertiary)]" />
                  <span className="font-bold text-sm text-[var(--bs-text-primary)]">{tool.name || tool.tool}</span>
                </div>
                {getProviderBadge(tool.provider)}
              </div>
              <div className="text-[10px] font-mono text-[var(--bs-text-secondary)] bg-[var(--bs-bg-secondary)] p-2 rounded truncate border border-[var(--bs-border-light)]">
                Server: {tool.server || 'Unknown'}
              </div>
              {tool.provider?.toUpperCase() === 'FALLBACK' && (
                <div className="mt-2 text-[10px] font-bold text-[var(--bs-red-400)] bg-[var(--bs-red-900)]/20 px-2 py-1 rounded border border-[var(--bs-red-900)]/50 flex items-center gap-1 uppercase tracking-widest">
                  External MCP unavailable — local fallback used
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--bs-border-light)] pt-4">
        <h3 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-3">MCP Visibility</h3>
        <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed mb-4">
          BuildScout orchestrates research through a Unified Tool Gateway. External information is retrieved via MCP (e.g., GitHub MCP, Web Search MCP), while local validation uses dedicated capability modules.
        </p>
        <Link
          to={`/mcp/${analysisId}`}
          className="inline-flex items-center justify-center w-full rounded-md bg-[var(--bs-bg-tertiary)] border border-[var(--bs-border-medium)] px-4 py-2 text-xs font-bold text-[var(--bs-text-primary)] hover:border-[var(--bs-orange-500)] transition-colors uppercase tracking-widest"
        >
          View MCP & Tools
        </Link>
      </div>
    </Card>
  );
};

export default SearchTracePanel;
