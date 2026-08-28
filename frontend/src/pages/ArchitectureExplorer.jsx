import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, ArrowRight, Activity, Terminal, ShieldAlert } from 'lucide-react';

import ArchitectureHeader from '../components/architecture/ArchitectureHeader';
import ArchitectureDiagram from '../components/architecture/ArchitectureDiagram';
import ComponentArchitectureList from '../components/architecture/ComponentArchitectureList';
import ArchitectureDataFlow from '../components/architecture/ArchitectureDataFlow';
import IntegrationPoints from '../components/architecture/IntegrationPoints';
import ImplementationPlan from '../components/architecture/ImplementationPlan';
import RisksPanel from '../components/architecture/RisksPanel';
import ArchitectureReasoning from '../components/architecture/ArchitectureReasoning';

const ArchitectureExplorer = () => {
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
        <Loader2 className="h-10 w-10 text-[var(--bs-blue-500)] animate-spin mb-4" />
        <p className="text-sm font-medium">Loading architecture blueprint...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        {analysisId && (
          <div className="mb-6">
            <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] flex items-center gap-1 w-fit">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
            </Link>
          </div>
        )}
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-[var(--bs-text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-[var(--bs-text-primary)]">No Analysis Selected</h2>
          <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
            {isInitialLoad
              ? "Click 'Refresh Data' to load your workspace."
              : "Please select an analysis from the Dashboard or History to view the Architecture Explorer."}
          </p>
        </div>
      </div>
    );
  }

  if (!analysis.blueprint || Object.keys(analysis.blueprint).length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        {analysisId && (
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] flex items-center justify-center gap-1 mb-8 w-fit mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
        )}
        <p className="text-[var(--bs-text-secondary)]">No architecture blueprint is available for this analysis.</p>
      </div>
    );
  }

  const reuseSummary = analysis.blueprint.reuse_summary;
  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      
      {/* Top Navigation & Observability */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-[var(--bs-bg-primary)] p-4 rounded-lg border border-[var(--bs-border-medium)]">
        <div className="flex gap-4">
          {displayId && (
            <Link
              to={`/decisions/${displayId}`}
              className="flex items-center gap-2 px-3 py-2 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-md hover:border-[var(--bs-blue-500)] transition-colors text-sm font-bold text-[var(--bs-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" /> Evaluation
            </Link>
          )}
        </div>
        
        <div className="flex gap-4 items-center">
          <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest hidden md:inline-block mr-2">Observability:</span>
          {displayId && (
            <>
              <Link to={`/traces/${displayId}`} className="flex items-center gap-1.5 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                <Activity className="h-3.5 w-3.5" /> Trace
              </Link>
              <span className="text-[var(--bs-border-light)]">|</span>
              <Link to={`/metrics/${displayId}`} className="flex items-center gap-1.5 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                <ShieldAlert className="h-3.5 w-3.5" /> Metrics
              </Link>
              <span className="text-[var(--bs-border-light)]">|</span>
              <Link to={`/mcp/${displayId}`} className="flex items-center gap-1.5 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                <Terminal className="h-3.5 w-3.5" /> MCP
              </Link>
            </>
          )}
        </div>
      </div>

      <ArchitectureHeader analysis={analysis} />

      {/* Reuse Summary Row */}
      {reuseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[var(--bs-status-success)]/10 border border-[var(--bs-status-success)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-1">REUSE Components</span>
              <span className="text-2xl font-bold text-[var(--bs-status-success)]">{reuseSummary.reuse || 0}</span>
            </div>
          </div>
          <div className="bg-[var(--bs-status-warning)]/10 border border-[var(--bs-status-warning)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-1">ADAPT Components</span>
              <span className="text-2xl font-bold text-[var(--bs-status-warning)]">{reuseSummary.adapt || 0}</span>
            </div>
          </div>
          <div className="bg-[var(--bs-orange-500)]/10 border border-[var(--bs-orange-500)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[var(--bs-text-secondary)] uppercase tracking-wider mb-1">BUILD Components</span>
              <span className="text-2xl font-bold text-[var(--bs-orange-500)]">{reuseSummary.build || 0}</span>
            </div>
          </div>
        </div>
      )}

      <ArchitectureDiagram blueprint={analysis.blueprint} decisions={analysis.decisions} />
      
      <ArchitectureReasoning analysis={analysis} />

      <ComponentArchitectureList blueprint={analysis.blueprint} decisions={analysis.decisions} analysisId={displayId} />

      <ArchitectureDataFlow dataFlow={analysis.blueprint.data_flow} />

      <IntegrationPoints integrationPoints={analysis.blueprint.integration_points} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ImplementationPlan phases={analysis.blueprint.implementation_phases} />
        <RisksPanel risks={analysis.blueprint.risks} />
      </div>
      
    </div>
  );
};

export default ArchitectureExplorer;
