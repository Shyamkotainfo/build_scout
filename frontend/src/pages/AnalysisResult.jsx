import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

import AnalysisHeader from '../components/analysis/AnalysisHeader';
import DecisionSummary from '../components/analysis/DecisionSummary';
import CandidatesSection from '../components/analysis/CandidatesSection';
import DecisionsSection from '../components/analysis/DecisionsSection';
import ValidationSection from '../components/analysis/ValidationSection';
import RequirementsSection from '../components/analysis/RequirementsSection';
import BlueprintSection from '../components/analysis/BlueprintSection';
import AgentTraceSection from '../components/analysis/AgentTraceSection';

const AnalysisResult = () => {
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
        <p className="text-sm font-bold">Loading analysis details...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-6">
          <Link to="/" className="text-sm font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-orange-500)] flex items-center gap-1 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-8 rounded-lg text-center">
          <AlertCircle className="w-12 h-12 text-[var(--bs-text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-[var(--bs-text-primary)]">
            {isInitialLoad ? "No Analysis Selected" : "Analysis Details Unavailable"}
          </h2>
          <p className="text-sm text-[var(--bs-text-secondary)] mb-6">
            {isInitialLoad
              ? "Click 'Refresh Data' to load your workspace."
              : "Analysis details are temporarily unavailable. Reconnect to the backend to load the latest details."}
          </p>
          <Link to="/new-analysis">
            <Button variant="primary">Start New Analysis</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-12">
      <AnalysisHeader analysis={analysis} />
      <DecisionSummary decisions={analysis.decisions} />
      <CandidatesSection candidates={analysis.candidates} evaluations={analysis.evaluations} />
      <DecisionsSection decisions={analysis.decisions} />
      <ValidationSection validation={analysis.validation_result} />
      <RequirementsSection requirements={analysis.requirements} />
      <BlueprintSection blueprint={analysis.blueprint} />
      <AgentTraceSection agentHistory={analysis.agent_history} traces={analysis.traces} analysisId={analysis.analysis_id || analysis.id} />
    </div>
  );
};

export default AnalysisResult;
