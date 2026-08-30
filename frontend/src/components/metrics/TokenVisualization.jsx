import React from 'react';
import { AlignLeft, AlignRight, BarChart2 } from 'lucide-react';

const TokenVisualization = ({ metrics }) => {
  if (!metrics || metrics.total_tokens === undefined) {
    return (
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-6 mb-8 text-center">
        <span className="text-sm text-[var(--bs-text-secondary)]">Token usage unavailable for this analysis.</span>
      </div>
    );
  }

  const inputTokens = metrics.total_input_tokens || 0;
  const outputTokens = metrics.total_output_tokens || 0;
  const totalTokens = metrics.total_tokens || 1; // avoid / 0

  const inputPct = (inputTokens / totalTokens) * 100;
  const outputPct = (outputTokens / totalTokens) * 100;

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-lg p-8 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)] flex items-center gap-2"><BarChart2 className="h-4 w-4 text-[var(--bs-status-running)]" /> Token Distribution</h3>
        <div className="text-xs font-mono text-[var(--bs-text-tertiary)] bg-[var(--bs-bg-secondary)] px-3 py-1 rounded-full border border-[var(--bs-border-light)]">
          Total: <span className="text-[var(--bs-text-primary)] font-bold">{metrics.total_tokens?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div className="w-full h-8 flex rounded-lg overflow-hidden border border-[var(--bs-border-light)] shadow-inner mb-6">
        <div className="bg-[var(--bs-status-running-light)]0/80 transition-all duration-1000" style={{ width: `${inputPct}%` }} title={`Input: ${inputTokens}`}></div>
        <div className="bg-[var(--bs-status-success)]/80 transition-all duration-1000" style={{ width: `${outputPct}%` }} title={`Output: ${outputTokens}`}></div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <span className="text-[10px] font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlignLeft className="h-3 w-3" /> Input Tokens
          </span>
          <span className="text-2xl font-bold text-[var(--bs-status-running)]">{inputTokens.toLocaleString()}</span>
          <span className="text-xs text-[var(--bs-text-secondary)] ml-2">({Math.round(inputPct)}%)</span>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <span className="text-[10px] font-semibold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-1 flex items-center gap-1 justify-end w-full">
            Output Tokens <AlignRight className="h-3 w-3" />
          </span>
          <div>
            <span className="text-xs text-[var(--bs-text-secondary)] mr-2">({Math.round(outputPct)}%)</span>
            <span className="text-2xl font-bold text-[var(--bs-status-success)]">{outputTokens.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenVisualization;
