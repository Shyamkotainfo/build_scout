import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const AnalysisHeader = ({ analysis }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between pb-6 mb-8 border-b border-[var(--bs-border-light)] w-full">
      <div className="flex flex-col">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="text-sm font-bold tracking-widest text-[var(--bs-text-tertiary)] hover:text-[var(--bs-orange-500)] transition-colors uppercase">
            Analysis Result
          </Link>
          <span
            className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              analysis.status === 'COMPLETED'
                ? 'bg-green-900/30 text-green-500 border border-green-800/50'
                : analysis.status === 'FAILED'
                ? 'bg-red-900/30 text-red-500 border border-red-800/50'
                : 'bg-yellow-900/30 text-yellow-500 border border-yellow-800/50'
            }`}
          >
            {analysis.status}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">
          {analysis.domain || 'Analysis Result'}
        </h1>
        
        {analysis.normalized_request && (
          <p className="text-sm text-[var(--bs-text-secondary)] max-w-3xl line-clamp-2">
            {analysis.normalized_request}
          </p>
        )}
      </div>

      <div className="mt-6 md:mt-0 flex shrink-0">
        <Link to="/new-analysis">
          <Button variant="outline" className="h-10">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AnalysisHeader;
