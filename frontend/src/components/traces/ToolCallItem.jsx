import React from 'react';
import { Settings, Server, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';

const ToolCallItem = ({ call }) => {
  const provider = call.provider?.toUpperCase();
  
  const getProviderBadge = () => {
    if (provider === 'FALLBACK') return <span className="bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">FALLBACK</span>;
    if (provider === 'MCP') return <span className="bg-purple-900/30 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    if (provider === 'LOCAL') return <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOCAL</span>;
    return <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">{provider || 'UNKNOWN'}</span>;
  };

  const isFailed = call.status?.toUpperCase() === 'FAILED' || call.status?.toUpperCase() === 'ERROR';

  return (
    <div className={`bg-slate-800/80 border rounded-lg overflow-hidden ${isFailed ? 'border-red-900/50' : 'border-slate-700'}`}>
      
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${isFailed ? 'bg-red-900/10 border-red-900/30' : 'bg-slate-900/50 border-slate-700/50'}`}>
        <div className="flex items-center gap-3">
          <Settings className={`h-4 w-4 ${isFailed ? 'text-red-400' : 'text-slate-400'}`} />
          <h4 className="text-sm font-bold text-slate-200">{call.name || call.tool}</h4>
        </div>
        <div className="flex items-center gap-3">
          {call.latency_ms && <span className="text-xs font-mono text-slate-500">{call.latency_ms}ms</span>}
          {getProviderBadge()}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        
        {provider === 'FALLBACK' && (
          <div className="flex items-center gap-2 text-xs font-medium text-yellow-500 bg-yellow-900/20 border border-yellow-900/50 px-3 py-2 rounded">
            <AlertTriangle className="h-4 w-4" /> External MCP unavailable — local fallback used
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Server</span>
            <div className="flex items-center gap-1.5 text-sm font-mono text-slate-300">
              <Server className="h-3 w-3 text-slate-500" /> {call.server || 'Unknown'}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Status</span>
            <span className={`text-sm font-mono font-semibold ${isFailed ? 'text-red-400' : 'text-green-400'}`}>
              {call.status || 'COMPLETED'}
            </span>
          </div>
        </div>

        {/* Arguments Box (Always masked/sanitized by backend) */}
        <div>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-500/70" /> Sanitized Arguments
          </span>
          <pre className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono text-slate-400 overflow-x-auto">
            {call.arguments 
              ? (typeof call.arguments === 'object' ? JSON.stringify(call.arguments, null, 2) : call.arguments) 
              : '{}'}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default ToolCallItem;
