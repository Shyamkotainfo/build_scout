import React from 'react';
import { ShieldAlert, RotateCcw, DatabaseZap } from 'lucide-react';

const ReliabilitySection = ({ metrics }) => {
  if (!metrics) return null;

  const retries = metrics.total_retries || 0;
  const failed = metrics.failed_calls || 0;
  const compactions = metrics.context_compactions;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="h-5 w-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white tracking-wide">Reliability</h2>
      </div>

      <p className="text-sm text-slate-400 mb-6 max-w-2xl">
        BuildSmart automatically retries transient LLM failures and compacts oversized contexts when required.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Retries</h3>
          </div>
          <span className="text-2xl font-bold text-amber-400">{retries}</span>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
            {retries === 0 ? 'No retries occurred.' : `${retries} automatic retry attempts.`}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Failed Calls</h3>
          </div>
          <span className="text-2xl font-bold text-red-400">{failed}</span>
          <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
            {failed === 0 ? '0 permanent failures.' : `${failed} permanent failures.`}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DatabaseZap className="h-4 w-4 text-blue-500" />
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Context Compactions</h3>
          </div>
          {compactions !== undefined ? (
            <>
              <span className="text-2xl font-bold text-blue-400">{compactions}</span>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
                {compactions > 0 
                  ? `${compactions} oversized LLM request(s) were compacted before retry.` 
                  : 'No context compaction recorded.'}
              </p>
            </>
          ) : (
            <div className="pt-2">
              <span className="text-sm text-slate-500">Context compaction data unavailable.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReliabilitySection;
