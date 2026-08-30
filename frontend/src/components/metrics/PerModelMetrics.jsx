import React from 'react';

const PerModelMetrics = ({ modelMetrics }) => {
  if (!modelMetrics || modelMetrics.length === 0) {
    return (
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-6 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)] mb-2">LLM Usage by Model</h3>
        <p className="text-sm text-[var(--bs-text-secondary)]">Per-model metrics are not available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)]">LLM Usage by Model</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--bs-text-secondary)]">
          <thead className="bg-[var(--bs-bg-secondary)] text-xs uppercase font-semibold text-[var(--bs-text-tertiary)]">
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
          <tbody className="divide-y divide-[var(--bs-border-light)]">
            {modelMetrics.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bs-bg-secondary)] transition-colors">
                <td className="px-6 py-4 font-mono text-[var(--bs-orange-600)]">{row.model}</td>
                <td className="px-6 py-4 text-right font-mono">{row.calls}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-status-running)]">{row.inputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-status-success)]">{row.outputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-[var(--bs-text-primary)]">{row.totalTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-amber-400">{row.latencyMs ? `${row.latencyMs}ms` : '—'}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-status-success)]">{row.cost !== undefined ? `$${row.cost.toFixed(4)}` : 'Unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerModelMetrics;
