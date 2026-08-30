import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      
      {/* 1. Page Header & 2. Workflow Indicator */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          {displayId && (
            <Link to={`/architecture/${displayId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-2 w-fit uppercase tracking-widest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Architecture
            </Link>
          )}
          {displayId && (
            <>
              <span className="text-[var(--bs-border-light)]">|</span>
              <Link to={`/analyses/${displayId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors uppercase tracking-widest">
                View Analysis
              </Link>
            </>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">
          Architecture Validation
        </h1>
        
        <p className="text-sm font-bold text-[var(--bs-text-secondary)] uppercase tracking-widest flex items-center gap-2 mb-4">
          <span className="text-[var(--bs-orange-500)]">{analysis.domain || 'Analysis'}</span>
        </p>

        <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
          BuildScout checks the recommended architecture against the original requirements, decisions, and identified risks.
        </p>

        {/* Workflow Indicator */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-[var(--bs-text-tertiary)]">RESEARCH</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-text-tertiary)]">EVALUATE</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-text-tertiary)]">DECIDE</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-text-tertiary)]">ARCHITECTURE</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-blue-500)] bg-[var(--bs-blue-500)]/10 px-2 py-1 rounded">VALIDATE</span>
        </div>
      </div>

      {/* Validation Content */}
      <ValidationSection analysis={analysis} />

      {/* 10. Final Demo Message */}
      <div className="mt-16 text-center">
        <p className="text-sm text-[var(--bs-text-secondary)] italic mb-4">
          BuildScout has completed its discovery, evaluation, decision, architecture, and validation workflow.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">
          <span className="text-[var(--bs-status-success)] flex items-center gap-1">Research ✓</span>
          <span className="text-[var(--bs-status-success)] flex items-center gap-1">Evaluation ✓</span>
          <span className="text-[var(--bs-status-success)] flex items-center gap-1">Decision ✓</span>
          <span className="text-[var(--bs-status-success)] flex items-center gap-1">Architecture ✓</span>
          <span className={`${analysis.validation_result ? 'text-[var(--bs-status-success)]' : 'text-[var(--bs-text-tertiary)]'} flex items-center gap-1`}>
            Validation {analysis.validation_result ? '✓' : ''}
          </span>
        </div>
      </div>

      {/* Technical Details (Hidden by default) */}
      <div className="mt-12 border-t border-[var(--bs-border-light)] pt-8">
        <details className="group">
          <summary className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--bs-text-primary)] list-none flex items-center gap-2 mb-4">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            View technical details
          </summary>
          <div className="p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg">
            <div className="text-xs text-[var(--bs-text-tertiary)] font-mono mb-2">
              Analysis UUID: {displayId}
            </div>
            {analysis.validation_result?.trace_id && (
              <div className="text-xs text-[var(--bs-text-tertiary)] font-mono">
                Trace ID: {analysis.validation_result.trace_id}
              </div>
            )}
          </div>
        </details>
      </div>

    </div>
  );
};

export default ValidationExplorer;
