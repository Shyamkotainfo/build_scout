import React from 'react';
import { Layers, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const PrimaryMetrics = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 text-center">
        <span className="text-sm text-slate-500">No primary LLM metrics available.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers className="h-3 w-3" /> Total Calls</span>
          <span className="text-3xl font-bold text-white">{metrics.total_calls ?? 0}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Successful</span>
          <span className="text-3xl font-bold text-green-400">{metrics.successful_calls ?? 0}</span>
        </div>

        <div className="flex flex-col border-r border-slate-700/50 last:border-0 pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><XCircle className="h-3 w-3" /> Failed</span>
          <span className="text-3xl font-bold text-red-400">{metrics.failed_calls ?? 0}</span>
        </div>

        <div className="flex flex-col pr-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><RotateCcw className="h-3 w-3" /> Total Retries</span>
          <span className="text-3xl font-bold text-amber-400">{metrics.total_retries ?? 0}</span>
        </div>

      </div>
    </div>
  );
};

export default PrimaryMetrics;
