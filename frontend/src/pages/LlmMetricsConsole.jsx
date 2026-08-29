import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, BarChart3, Activity } from 'lucide-react';

import PrimaryMetrics from '../components/metrics/PrimaryMetrics';
import TokenVisualization from '../components/metrics/TokenVisualization';
import CostLatencyCard from '../components/metrics/CostLatencyCard';
import ReliabilitySection from '../components/metrics/ReliabilitySection';
import PerAgentMetrics from '../components/metrics/PerAgentMetrics';
import PerModelMetrics from '../components/metrics/PerModelMetrics';
import ExecutionArchitecture from '../components/metrics/ExecutionArchitecture';

const LlmMetricsConsole = () => {
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
      <div className="flex flex-col items-center justify-center h-full text-[var(--bs-text-secondary)] py-24">
        <Loader2 className="h-10 w-10 text-[var(--bs-orange-500)] animate-spin mb-4" />
        <p className="text-sm font-medium">Loading LLM telemetry...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        {analysisId && (
          <div className="mb-6">
            <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] flex items-center gap-1 w-fit">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        )}
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-[var(--bs-text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-[var(--bs-text-primary)]">No Analysis Selected</h2>
          <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
            {isInitialLoad
              ? "Click 'Refresh Data' to load your workspace."
              : "Please select an analysis from the Dashboard or History to view LLM Metrics."}
          </p>
        </div>
      </div>
    );
  }

  const m = analysis.llm_metrics || {};

  // Compute status from metrics
  let status = 'UNKNOWN';
  if (m.total_calls > 0) {
    if (m.failed_calls === 0) status = 'SUCCESS';
    else if (m.successful_calls > 0) status = 'PARTIAL';
    else status = 'FAILED';
  }

  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          {displayId && (
            <Link to={`/analyses/${displayId}`} className="text-sm font-medium text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] flex items-center gap-1 mb-2 w-fit">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
            </Link>
          )}
          <h1 className="text-2xl font-bold text-[var(--bs-text-primary)] tracking-wide flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-[var(--bs-orange-500)]" />
            LLM Observability Console
          </h1>
          <p className="text-sm text-[var(--bs-text-secondary)] mt-1">How much LLM usage did this analysis consume?</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] px-3 py-1.5 rounded-lg mr-2">
            <span className="text-[10px] font-semibold text-[var(--bs-text-tertiary)] uppercase tracking-wider">LLM Execution:</span>
            <span className={`text-xs font-bold ${
              status === 'SUCCESS' ? 'text-[var(--bs-status-success)]' :
              status === 'PARTIAL' ? 'text-[var(--bs-status-warning)]' :
              status === 'FAILED' ? 'text-[var(--bs-status-critical)]' : 'text-[var(--bs-text-secondary)]'
            }`}>
              {status}
            </span>
          </div>

          {displayId && (
            <Link
              to={`/traces/${displayId}`}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] px-4 py-2 text-sm font-medium text-[var(--bs-text-primary)] hover:bg-[var(--bs-bg-hover)] transition-colors shadow-sm whitespace-nowrap h-fit"
            >
              <Activity className="h-4 w-4 text-[var(--bs-orange-500)]" />
              View Agent Trace
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <PrimaryMetrics metrics={analysis.llm_metrics} />
          
          <CostLatencyCard metrics={analysis.llm_metrics} />
          
          <TokenVisualization metrics={analysis.llm_metrics} />
          
          <ReliabilitySection metrics={analysis.llm_metrics} />
          
          {/* We do not invent fake per-agent or per-model stats. 
              The backend schemas.py did not show these lists directly inside llm_metrics, 
              but we pass them if they happen to be embedded, else the components handle empty state. */}
          <PerAgentMetrics agentMetrics={m.per_agent} />
          <PerModelMetrics modelMetrics={m.per_model} />
        </div>
        
        <div className="lg:col-span-1">
          <ExecutionArchitecture />
        </div>
      </div>
    </div>
  );
};

export default LlmMetricsConsole;
