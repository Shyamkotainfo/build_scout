import React from 'react';

const PerAgentMetrics = ({ agentMetrics }) => {
  if (!agentMetrics || agentMetrics.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-200">LLM Usage by Agent</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/30 text-xs uppercase font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4 text-right">Calls</th>
              <th className="px-6 py-4 text-right">Input Tokens</th>
              <th className="px-6 py-4 text-right">Output Tokens</th>
              <th className="px-6 py-4 text-right">Total Tokens</th>
              <th className="px-6 py-4 text-right">Retries</th>
              <th className="px-6 py-4 text-right">Latency</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {agentMetrics.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-200">{row.agent}</td>
                <td className="px-6 py-4 text-right font-mono">{row.calls}</td>
                <td className="px-6 py-4 text-right font-mono text-blue-400">{row.inputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400">{row.outputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-white">{row.totalTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-amber-400">{row.retries}</td>
                <td className="px-6 py-4 text-right font-mono text-slate-400">{row.latencyMs ? `${row.latencyMs}ms` : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    row.status === 'SUCCESS' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 
                    row.status === 'FAILED' ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {row.status || 'UNKNOWN'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerAgentMetrics;
