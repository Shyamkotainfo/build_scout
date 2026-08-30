import React from 'react';

const PerAgentMetrics = ({ agentMetrics }) => {
  if (!agentMetrics || agentMetrics.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-secondary)]">
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)]">LLM Usage by Agent</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--bs-text-secondary)]">
          <thead className="bg-[var(--bs-bg-secondary)] text-xs uppercase font-semibold text-[var(--bs-text-tertiary)]">
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
          <tbody className="divide-y divide-[var(--bs-border-light)]">
            {agentMetrics.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bs-bg-secondary)] transition-colors">
                <td className="px-6 py-4 font-semibold text-[var(--bs-text-primary)]">{row.agent}</td>
                <td className="px-6 py-4 text-right font-mono">{row.calls}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-status-running)]">{row.inputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-status-success)]">{row.outputTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-[var(--bs-text-primary)]">{row.totalTokens?.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-amber-400">{row.retries}</td>
                <td className="px-6 py-4 text-right font-mono text-[var(--bs-text-tertiary)]">{row.latencyMs ? `${row.latencyMs}ms` : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                    row.status === 'SUCCESS' ? 'bg-green-900/30 text-[var(--bs-status-success)] border border-green-800/50' : 
                    row.status === 'FAILED' ? 'bg-red-900/30 text-[var(--bs-status-critical)] border border-red-800/50' : 
                    'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-tertiary)] border border-[var(--bs-border-light)]'
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
