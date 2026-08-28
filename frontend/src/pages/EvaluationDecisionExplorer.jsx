import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, ArrowLeft, GitBranch, ArrowRight, AlertCircle } from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';

import DecisionOverview from '../components/decision/DecisionOverview';
import EvaluationMatrix from '../components/decision/EvaluationMatrix';
import EvaluationDetailPanel from '../components/decision/EvaluationDetailPanel';
import ComponentDecisionPanel from '../components/decision/ComponentDecisionPanel';
import ComponentSidebar from '../components/research/ComponentSidebar';

const EvaluationDecisionExplorer = () => {
  const { analysisId } = useParams();
  const { currentAnalysis, loadSpecificAnalysis, isRefreshing, lastRefreshed } = useData();
  const [analysis, setAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const initAnalysis = async () => {
      if (currentAnalysis && (currentAnalysis.analysis_id === analysisId || currentAnalysis.id === analysisId || !analysisId)) {
        setAnalysis(currentAnalysis);
        if (currentAnalysis?.components?.length > 0 && !selectedComponentId) {
          setSelectedComponentId(currentAnalysis.components[0].id);
        }
        return;
      }
      
      if (analysisId) {
        setLocalLoading(true);
        const data = await loadSpecificAnalysis(analysisId);
        setAnalysis(data);
        if (data?.components?.length > 0) {
          setSelectedComponentId(data.components[0].id);
        }
        setLocalLoading(false);
      } else {
        setAnalysis(null);
      }
    };

    initAnalysis();
  }, [analysisId, currentAnalysis, loadSpecificAnalysis]);

  const handleComponentSelect = (compId) => {
    setSelectedComponentId(compId);
    setSelectedCandidate(null);
  };

  const isLoading = isRefreshing || localLoading;
  const isInitialLoad = !analysis && lastRefreshed === null && !isLoading;

  if (isLoading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-[var(--bs-text-secondary)]">
        <Loader2 className="h-10 w-10 text-[var(--bs-orange-500)] animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest">Loading evaluation data...</p>
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
              : "Please select an analysis from the Dashboard or History to view Evaluation details."}
          </p>
        </div>
      </div>
    );
  }

  const componentCandidates = analysis.candidates?.filter(c => c.component_id === selectedComponentId) || [];
  const selectedComponent = analysis.components?.find(c => c.id === selectedComponentId);
  const selectedComponentDecision = analysis.decisions?.find(d => d.component_id === selectedComponentId);

  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-[var(--bs-border-light)] pb-6">
        <div>
          {displayId && (
            <Link to={`/analyses/${displayId}`} className="text-xs font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] flex items-center gap-2 mb-4 w-fit uppercase tracking-widest transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis
            </Link>
          )}
          <div className="flex items-center gap-4">
            <div className="mt-1 h-12 w-12 rounded-lg bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] flex items-center justify-center shadow-sm">
              <GitBranch className="h-6 w-6 text-[var(--bs-text-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">EVALUATION & DECISION</h1>
              <p className="text-sm font-bold text-[var(--bs-text-secondary)] uppercase tracking-widest flex items-center gap-2">
                <span className="text-[var(--bs-orange-500)]">{analysis.domain || 'Analysis'}</span>
                {displayId && (
                  <>
                    <span className="text-[var(--bs-text-tertiary)]">|</span>
                    <span className="text-[var(--bs-text-tertiary)]">{displayId}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <p className="text-sm text-[var(--bs-text-secondary)] mt-4 max-w-2xl">
            Evidence-based assessment of discovered solutions and the resulting engineering recommendation.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {displayId && (
            <>
              <Link
                to={`/research/${displayId}`}
                className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-3 bg-[var(--bs-bg-secondary)] hover:border-[var(--bs-border-medium)] transition-colors min-w-[150px]"
              >
                <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Previous</span>
                <span className="text-sm font-bold text-[var(--bs-text-primary)] flex items-center gap-2">
                  <ArrowLeft className="h-3 w-3" /> Research
                </span>
              </Link>
              <Link
                to={`/architecture/${displayId}`}
                className="flex flex-col border border-[var(--bs-border-light)] rounded-lg p-3 bg-[var(--bs-bg-secondary)] hover:border-[var(--bs-border-medium)] transition-colors min-w-[150px]"
              >
                <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">Next</span>
                <span className="text-sm font-bold text-[var(--bs-text-primary)] flex items-center gap-2">
                  Architecture <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      <DecisionOverview decisions={analysis.decisions} />

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Sidebar Component Navigation */}
        <ComponentSidebar 
          components={analysis.components} 
          selectedComponentId={selectedComponentId}
          onSelect={handleComponentSelect}
          candidates={analysis.candidates}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <ComponentDecisionPanel 
              component={selectedComponent}
              decision={selectedComponentDecision}
              allCandidates={componentCandidates}
              analysisId={displayId}
            />

            <EvaluationMatrix 
              candidates={componentCandidates}
              evaluations={analysis.evaluations?.filter(e => e.component_id === selectedComponentId)}
              decisions={analysis.decisions}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
            />
          </div>
          
          {/* Right Column: Evidence Panel */}
          {selectedCandidate && (
            <div className="w-full xl:w-[450px] shrink-0">
              <EvaluationDetailPanel
                candidate={selectedCandidate}
                evaluation={analysis.evaluations?.find(e => e.candidate_name === selectedCandidate.name && e.component_id === selectedCandidate.component_id)}
                analysisId={displayId}
                onClose={() => setSelectedCandidate(null)}
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default EvaluationDecisionExplorer;
