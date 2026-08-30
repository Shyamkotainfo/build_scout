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
  const { currentAnalysis, loadSpecificAnalysis, isRefreshing, lastRefreshed, addAnalysis } = useData();
  const [analysis, setAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [pollError, setPollError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const initAnalysis = async () => {
      if (currentAnalysis && (currentAnalysis.analysis_id === analysisId || currentAnalysis.id === analysisId || !analysisId)) {
        setAnalysis(currentAnalysis);
        return;
      }
      
      if (analysisId) {
        setLocalLoading(true);
        const data = await loadSpecificAnalysis(analysisId);
        if (mounted) {
          setAnalysis(data);
          setLocalLoading(false);
        }
      } else {
        if (mounted) setAnalysis(null);
      }
    };

    initAnalysis();
    return () => { mounted = false; };
  }, [analysisId, currentAnalysis, loadSpecificAnalysis]);

  useEffect(() => {
    let pollInterval;
    
    const pollStatus = async () => {
      try {
        const { getAnalysisStatus, getAnalysis } = await import('../services/analysis_service');
        const statusData = await getAnalysisStatus(analysisId);
        
        setJobStatus(statusData);
        setPollError(null);
        
        if (statusData.status === 'COMPLETED') {
          clearInterval(pollInterval);
          // Fetch final result
          const finalData = await getAnalysis(analysisId);
          addAnalysis(finalData); // updates context and stops the polling loop
        } else if (statusData.status === 'FAILED') {
          clearInterval(pollInterval);
        }
      } catch (err) {
        setPollError(err.message || 'Failed to fetch status');
        // If 404 or persistent error, might want to stop polling eventually
        if (err.status === 404) {
          clearInterval(pollInterval);
        }
      }
    };

    if (analysis && (analysis.status === 'QUEUED' || analysis.status === 'RUNNING')) {
      pollStatus(); // initial check
      pollInterval = setInterval(pollStatus, 2000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [analysis, analysisId, addAnalysis]);

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

  if (analysis.status === 'QUEUED' || analysis.status === 'RUNNING') {
    const safeStages = jobStatus?.stages || [];
    
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto w-full pt-16 pb-8">
        <div className="flex flex-col mb-12">
          <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight">
            ANALYSIS {jobStatus?.status === 'FAILED' ? 'FAILED' : 'RUNNING'}
          </h1>
          <p className="text-sm text-[var(--bs-text-secondary)] mt-2">
            BuildScout is investigating your request. This process performs a comprehensive search and evaluation across available candidates.
          </p>
          
          {jobStatus?.status === 'FAILED' && (
            <div className="mt-6 bg-[var(--bs-status-critical-light)] border border-[var(--bs-status-critical-border)] p-4 rounded-md">
              <p className="text-sm text-[var(--bs-status-critical)] font-medium">Analysis Failed</p>
              <p className="text-xs text-[var(--bs-status-critical)] mt-1">{jobStatus.error || "An unknown error occurred"}</p>
            </div>
          )}
          
          {pollError && jobStatus?.status !== 'FAILED' && (
            <div className="mt-6 bg-[var(--bs-status-warning-light)] border border-[var(--bs-status-warning-border)] p-4 rounded-md">
              <p className="text-xs text-[var(--bs-status-warning)]">Warning: Unable to fetch real-time updates. The analysis may still be running. ({pollError})</p>
            </div>
          )}
        </div>

        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            {jobStatus?.status === 'FAILED' ? (
              <AlertCircle className="w-5 h-5 text-[var(--bs-status-critical)]" />
            ) : (
              <Loader2 className="w-5 h-5 text-[var(--bs-orange-500)] animate-spin" />
            )}
            <h2 className="text-lg font-semibold text-[var(--bs-text-primary)]">
              {jobStatus?.status === 'FAILED' ? 'Pipeline halted' : 'Running multi-agent analysis...'}
            </h2>
          </div>
          
          <div className="flex flex-col gap-4 font-mono text-sm ml-2">
            {['prompt_optimizer', 'supervisor', 'decomposition', 'research', 'evaluation', 'decision', 'blueprint', 'validation', 'persistence'].map(stageName => {
              const stageData = safeStages.find(s => s.name === stageName);
              const status = stageData ? stageData.status : 'PENDING';
              
              let Icon = null;
              let textClass = '';
              let spinClass = '';
              
              if (status === 'COMPLETED') {
                Icon = () => <svg className="w-4 h-4 text-[var(--bs-status-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
                textClass = 'text-[var(--bs-text-tertiary)]';
              } else if (status === 'RUNNING') {
                Icon = () => <div className="w-4 h-4 rounded-full border-2 border-[var(--bs-orange-500)] border-t-transparent animate-spin" />;
                textClass = 'text-[var(--bs-text-primary)] font-medium';
              } else if (status === 'FAILED') {
                Icon = () => <AlertCircle className="w-4 h-4 text-[var(--bs-status-critical)]" />;
                textClass = 'text-[var(--bs-status-critical)] font-medium';
              } else {
                Icon = () => <div className="w-4 h-4 rounded-full border-2 border-[var(--bs-border-medium)]" />;
                textClass = 'text-[var(--bs-text-tertiary)] opacity-60';
              }
              
              const displayName = stageName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              
              return (
                <div key={stageName} className={`flex items-center gap-3 ${textClass}`}>
                  <Icon />
                  <span>{displayName}</span>
                  {stageData?.duration_ms && (
                    <span className="text-xs opacity-50 ml-auto">{(stageData.duration_ms / 1000).toFixed(1)}s</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-12">
      <div className="mb-6">
        <Link to="/" className="text-sm font-bold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-orange-500)] flex items-center gap-1 w-fit transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <AnalysisHeader analysis={analysis} />
      <DecisionSummary decisions={analysis.decisions} />
      <CandidatesSection candidates={analysis.candidates} evaluations={analysis.evaluations} />
      <DecisionsSection decisions={analysis.decisions} />
      <ValidationSection analysis={analysis} />
      <RequirementsSection requirements={analysis.requirements} />
      <BlueprintSection blueprint={analysis.blueprint} />
      <AgentTraceSection agentHistory={analysis.agent_history} traces={analysis.traces} analysisId={analysis.analysis_id || analysis.id} />
    </div>
  );
};

export default AnalysisResult;
