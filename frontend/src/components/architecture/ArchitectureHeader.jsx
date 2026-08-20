import React from 'react';
import { Layers } from 'lucide-react';

const ArchitectureHeader = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-blue-500" /> Architecture Blueprint
            </h1>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                analysis.status === 'COMPLETED'
                  ? 'bg-green-900/50 text-green-400 border border-green-800/60'
                  : analysis.status === 'FAILED'
                  ? 'bg-red-900/50 text-red-400 border border-red-800/60'
                  : 'bg-yellow-900/50 text-yellow-400 border border-yellow-800/60'
              }`}
            >
              {analysis.status}
            </span>
          </div>
          <div className="text-sm font-mono text-slate-500 mb-6">ID: {analysis.analysis_id}</div>
          
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Solution Summary</h3>
          <p className="text-slate-200 text-sm leading-relaxed max-w-3xl">
            {analysis.blueprint?.solution_summary || 'No solution summary provided.'}
          </p>
        </div>
        
        <div className="md:w-64 shrink-0 bg-slate-900/50 rounded-lg p-5 border border-slate-700/50 h-full flex flex-col justify-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Architecture Style</span>
          <span className="text-xl font-bold text-blue-400 capitalize">{analysis.blueprint?.architecture_style || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureHeader;
