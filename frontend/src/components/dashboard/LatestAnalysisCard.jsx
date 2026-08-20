import React from 'react';
import { Clock, Tag, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const LatestAnalysisCard = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="mb-8 rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
        <Clock className="mx-auto h-8 w-8 text-slate-500 mb-3" />
        <h3 className="text-sm font-medium text-slate-300">No analyses yet</h3>
        <p className="mt-1 text-sm text-slate-500">Create your first analysis to see data here.</p>
      </div>
    );
  }

  const isCompleted = analysis.status === 'COMPLETED';
  const isFailed = analysis.status === 'FAILED';

  return (
    <div className="mb-8 rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-100 flex items-center gap-2">
          Latest Analysis
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
            {analysis.analysis_id.split('-')[0]}...
          </span>
        </h2>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isCompleted
              ? 'bg-green-900/50 text-green-400'
              : isFailed
              ? 'bg-red-900/50 text-red-400'
              : 'bg-blue-900/50 text-blue-400'
          }`}
        >
          {isCompleted && <CheckCircle2 className="mr-1.5 h-3 w-3" />}
          {isFailed && <AlertCircle className="mr-1.5 h-3 w-3" />}
          {analysis.status || 'UNKNOWN'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <Tag className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Domain</p>
            <p className="text-sm text-slate-300 mt-1">{analysis.domain || 'Unspecified'}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Normalized Request</p>
            <p className="text-sm text-slate-300 mt-1 line-clamp-2">
              {analysis.normalized_request || analysis.user_request || 'No request provided.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestAnalysisCard;
