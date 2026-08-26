import React from 'react';
import { Cpu, Clock, Zap, Coins, Hash } from 'lucide-react';

const MetricsSection = ({ metrics }) => {
  if (!metrics || Object.keys(metrics).length === 0) {
    return null; // Silent skip if no metrics, less critical
  }

  const cards = [
    { label: 'Total Calls', value: metrics.total_calls, icon: Zap, color: 'text-blue-400' },
    { label: 'Tokens (Out)', value: metrics.total_output_tokens?.toLocaleString(), icon: Hash, color: 'text-purple-400' },
    { label: 'Tokens (In)', value: metrics.total_input_tokens?.toLocaleString(), icon: Hash, color: 'text-indigo-400' },
    { label: 'Total Tokens', value: metrics.total_tokens?.toLocaleString(), icon: Cpu, color: 'text-green-400' },
    { label: 'Avg Latency', value: metrics.average_latency_ms ? `${metrics.average_latency_ms}ms` : '0ms', icon: Clock, color: 'text-yellow-400' },
    { label: 'Total Latency', value: metrics.total_latency_ms ? `${(metrics.total_latency_ms / 1000).toFixed(2)}s` : '0s', icon: Clock, color: 'text-orange-400' },
  ];

  // Optional cost if provided
  if (metrics.total_cost != null) {
    cards.push({ label: 'Est. Cost', value: `$${metrics.total_cost.toFixed(4)}`, icon: Coins, color: 'text-emerald-400' });
  }

  return (
    <div className="mb-12 border-t border-slate-700/50 pt-8 mt-12">
      <h2 className="text-sm font-semibold leading-6 text-slate-400 uppercase tracking-wider mb-4">LLM Observability Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 flex flex-col justify-between hover:bg-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
              <card.icon className={`h-4 w-4 ${card.color} opacity-80`} />
            </div>
            <div className="text-lg font-bold text-slate-200 truncate" title={String(card.value)}>
              {card.value || '0'}
            </div>
          </div>
        ))}
      </div>
      {(metrics.failed_calls > 0 || metrics.total_retries > 0) && (
        <div className="mt-4 flex gap-4 text-xs font-medium">
          {metrics.failed_calls > 0 && <span className="text-red-400 bg-red-900/20 px-2 py-1 rounded">Failures: {metrics.failed_calls}</span>}
          {metrics.total_retries > 0 && <span className="text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">Retries: {metrics.total_retries}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricsSection;
