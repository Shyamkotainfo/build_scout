import React from 'react';
import { DollarSign, Clock, Zap } from 'lucide-react';

const CostLatencyCard = ({ metrics }) => {
  if (!metrics) {
    return null;
  }

  const cost = metrics.total_cost !== undefined && metrics.total_cost !== null 
    ? `$${metrics.total_cost.toFixed(4)}` 
    : 'Unknown';

  const totalLat = metrics.total_latency_ms !== undefined && metrics.total_latency_ms !== null 
    ? `${(metrics.total_latency_ms / 1000).toFixed(2)}s` 
    : 'Unknown';

  const avgLat = metrics.average_latency_ms !== undefined && metrics.average_latency_ms !== null 
    ? `${metrics.average_latency_ms}ms` 
    : 'Unknown';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      {/* Cost */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-500" /> Total Cost</h3>
          <span className="text-4xl font-bold text-emerald-400">{cost}</span>
        </div>
        <div className="w-16 h-16 rounded-full bg-emerald-900/20 border border-emerald-900/50 flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-emerald-500/50" />
        </div>
      </div>

      {/* Latency */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-500" /> Latency</h3>
          <div className="flex gap-4 items-end">
            <div>
              <span className="text-xs text-slate-500 block mb-1">Total</span>
              <span className="text-2xl font-bold text-amber-400">{totalLat}</span>
            </div>
            <div className="w-px h-8 bg-slate-700/50 mb-1"></div>
            <div>
              <span className="text-xs text-slate-500 block mb-1">Average</span>
              <span className="text-xl font-bold text-slate-300">{avgLat}</span>
            </div>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-900/50 flex items-center justify-center">
          <Clock className="h-8 w-8 text-amber-500/50" />
        </div>
      </div>

    </div>
  );
};

export default CostLatencyCard;
