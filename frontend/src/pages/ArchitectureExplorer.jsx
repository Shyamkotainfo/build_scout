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
        <p className="text-sm font-medium">Loading architecture...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2 text-[var(--bs-text-primary)]">Architecture temporarily unavailable</h2>
        <p className="text-sm text-[var(--bs-text-secondary)]">Please select a completed analysis to view the architecture.</p>
      </div>
    );
  }

  if (!analysis.blueprint || Object.keys(analysis.blueprint).length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <p className="text-[var(--bs-text-secondary)]">No architecture blueprint is available for this analysis.</p>
      </div>
    );
  }

  const reuseSummary = analysis.blueprint.reuse_summary;
  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      
      {/* 1. Header & Workflow */}
      <div className="mb-10">
        {displayId && (
          <Link to={`/analyses/${displayId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-2 mb-4 w-fit uppercase tracking-widest transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis
          </Link>
        )}
        <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">
          Architecture Blueprint
        </h1>
        <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
          BuildScout's recommended architecture based on discovered solutions, evaluations, and REUSE / ADAPT / BUILD decisions.
        </p>

        {/* Workflow Indicator */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-[var(--bs-text-tertiary)]">RESEARCH</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-text-tertiary)]">EVALUATE</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-text-tertiary)]">DECIDE</span>
          <ArrowRight className="h-3 w-3 text-[var(--bs-text-tertiary)]" />
          <span className="text-[var(--bs-blue-500)] bg-[var(--bs-blue-500)]/10 px-2 py-1 rounded">ARCHITECTURE</span>
        </div>
      </div>

      {/* 2. Architecture at a Glance */}
      <ArchitectureHeader analysis={analysis} />

      {/* 3. Recommended Architecture Diagram */}
      <ArchitectureDiagram blueprint={analysis.blueprint} decisions={analysis.decisions} />

      {/* 4. Architecture Components */}
      <ComponentArchitectureList blueprint={analysis.blueprint} decisions={analysis.decisions} analysisId={displayId} />

      {/* 5. Decision Summary */}
      {reuseSummary && (
        <div className="mb-12">
          <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Decision Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bs-status-success)]/10 border border-[var(--bs-status-success)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--bs-status-success)] uppercase tracking-wider">REUSE</span>
              <span className="text-2xl font-bold text-[var(--bs-status-success)]">{reuseSummary.reuse || 0}</span>
            </div>
            <div className="bg-[var(--bs-status-warning)]/10 border border-[var(--bs-status-warning)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--bs-status-warning)] uppercase tracking-wider">ADAPT</span>
              <span className="text-2xl font-bold text-[var(--bs-status-warning)]">{reuseSummary.adapt || 0}</span>
            </div>
            <div className="bg-[var(--bs-orange-500)]/10 border border-[var(--bs-orange-500)]/30 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-[var(--bs-orange-500)] uppercase tracking-wider">BUILD</span>
              <span className="text-2xl font-bold text-[var(--bs-orange-500)]">{reuseSummary.build || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Why this architecture? & 7. Trust & Traceability */}
      <ArchitectureReasoning analysis={analysis} />

      {/* Internal Tooling / Technical Details */}
      <div className="mt-12 border-t border-[var(--bs-border-light)] pt-8">
        <details className="group">
          <summary className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest cursor-pointer hover:text-[var(--bs-text-primary)] list-none flex items-center gap-2 mb-4">
            <span className="group-open:rotate-90 transition-transform">▶</span>
            View technical details
          </summary>
          <div className="p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg">
            <div className="text-xs text-[var(--bs-text-tertiary)] mb-4 font-mono">
              Analysis UUID: {displayId}
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Observability Links:</span>
              {displayId && (
                <>
                  <Link to={`/traces/${displayId}`} className="flex items-center gap-1 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                    <Activity className="h-3 w-3" /> Trace
                  </Link>
                  <span className="text-[var(--bs-border-light)]">|</span>
                  <Link to={`/metrics/${displayId}`} className="flex items-center gap-1 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                    <ShieldAlert className="h-3 w-3" /> Metrics
                  </Link>
                  <span className="text-[var(--bs-border-light)]">|</span>
                  <Link to={`/mcp/${displayId}`} className="flex items-center gap-1 text-xs font-bold text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] transition-colors">
                    <Terminal className="h-3 w-3" /> MCP
                  </Link>
                </>
              )}
            </div>
            
            {/* Hidden technical tables (keep the elements but hide them below fold) */}
            <div className="mt-8 space-y-8">
              <ArchitectureDataFlow dataFlow={analysis.blueprint.data_flow} />
              <IntegrationPoints integrationPoints={analysis.blueprint.integration_points} />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ImplementationPlan phases={analysis.blueprint.implementation_phases} />
                <RisksPanel risks={analysis.blueprint.risks} />
              </div>
            </div>
          </div>
        </details>
      </div>
      
    </div>
  );
};

export default ArchitectureExplorer;
