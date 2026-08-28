import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import ValidationSection from '../components/analysis/ValidationSection';

const ValidationExplorer = () => {
  const { analysisId } = useParams();
  const { currentAnalysis, loadSpecificAnalysis, isRefreshing, lastRefreshed } = useData();
  const [analysis, setAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const initAnalysis = async () => {
      if (currentAnalysis && (currentAnalysis.analysis_id === analysisId || currentAnalysis.id === analysisId || !analysisId)) {
        setAnalysis(currentAnalysis);
        return;
      }
      
      if (analysisId) {
        setLocalLoading(true);
        const data = await loadSpecificAnalysis(analysisId);
        setAnalysis(data);
        setLocalLoading(false);
      } else {
        setAnalysis(null);
      }
    };

    initAnalysis();
  }, [analysisId, currentAnalysis, loadSpecificAnalysis]);

  const isLoading = isRefreshing || localLoading;
  const isInitialLoad = !analysis && lastRefreshed === null && !isLoading;

  if (isLoading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-[var(--bs-text-secondary)]">
        <Loader2 className="h-10 w-10 text-[var(--bs-orange-500)] animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading validation data...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-[1200px] mx-auto w-full px-8 py-12">
        {analysisId && (
          <div className="mb-6">
            <Link to={`/analyses/${analysisId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-2 w-fit uppercase tracking-widest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis
            </Link>
          </div>
        )}
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-[var(--bs-text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-[var(--bs-text-primary)]">No Analysis Selected</h2>
          <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
            {isInitialLoad
              ? "Click 'Refresh Data' to load your workspace."
              : "Please select an analysis from the Dashboard or History to view Validation details."}
          </p>
        </div>
      </div>
    );
  }

  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-[var(--bs-border-light)] pb-6">
        <div>
          {displayId && (
            <Link to={`/analyses/${displayId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-2 mb-4 w-fit uppercase tracking-widest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis
            </Link>
          )}
          <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">VALIDATION EXPLORER</h1>
          <p className="text-sm font-bold text-[var(--bs-text-secondary)] uppercase tracking-widest flex items-center gap-2">
            <span className="text-[var(--bs-orange-500)]">{analysis.domain || 'Analysis'}</span>
            {displayId && (
              <>
                <span className="text-[var(--bs-text-tertiary)]">|</span>
                <span className="text-[var(--bs-text-tertiary)]">{displayId}</span>
              </>
            )}
          </p>
          <p className="text-sm text-[var(--bs-text-secondary)] mt-4 max-w-2xl">
            Detailed validation metrics and trust signals for the generated architecture blueprint.
          </p>
        </div>
      </div>

      {analysis.validation_result ? (
        <ValidationSection validation={analysis.validation_result} />
      ) : (
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-12 rounded-lg text-center">
          <p className="text-[var(--bs-text-secondary)]">No validation data available for this analysis.</p>
        </div>
      )}
    </div>
  );
};

export default ValidationExplorer;
