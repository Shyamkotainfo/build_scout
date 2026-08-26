import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalysisHeader = ({ analysis }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Link to="/" className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">BuildSmart Analysis</h1>
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
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <span className="font-mono text-slate-500">ID:</span>
              <span className="text-slate-300">{analysis.analysis_id}</span>
            </div>
            {analysis.domain && (
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-500">Domain:</span>
                <span className="text-slate-300">{analysis.domain}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-500" />
              <span className="text-slate-300">Just now</span>
            </div>
          </div>
        </div>

        <div className="md:max-w-md w-full bg-slate-900/50 rounded p-4 border border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original Request</h3>
          <p className="text-sm text-slate-300 italic line-clamp-3">"{analysis.user_request}"</p>
          {analysis.normalized_request && analysis.normalized_request !== analysis.user_request && (
            <>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-2">Normalized Request</h3>
              <p className="text-sm text-blue-400 line-clamp-2">{analysis.normalized_request}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisHeader;
