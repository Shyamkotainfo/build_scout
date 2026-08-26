import React from 'react';

const PerModelMetrics = ({ modelMetrics }) => {
  if (!modelMetrics || modelMetrics.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">LLM Usage by Model</h3>
        <p className="text-sm text-slate-500">Per-model metrics are not available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-200">LLM Usage by Model</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/30 text-xs uppercase font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4 text-right">Calls</th>
              <th className="px-6 py-4 text-right">Input Tokens</th>
              <th className="px-6 py-4 text-right">Output Tokens</th>
              <th className="px-6 py-4 text-right">Total Tokens</th>
              <th className="px-6 py-4 text-right">Latency</th>
              <th className="px-6 py-4 text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {modelMetrics.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-purple-400">{row.model}</td>
                <td className="px-6 py-4 text-right font-mono">{row.calls}</td>
                <td className="px-6 py-4 text-right font-mono text-blue-400">{row.inputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-emerald-400">{row.outputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-white">{row.totalTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-amber-400">{row.latencyMs ? `${row.latencyMs}ms` : '—'}</td>
                <td className="px-6 py-4 text-right font-mono text-green-400">{row.cost !== undefined ? `$${row.cost.toFixed(4)}` : 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerModelMetrics;
