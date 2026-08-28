import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, Layers } from 'lucide-react';

import TraceSummary from '../components/traces/TraceSummary';
import AgentTimeline from '../components/traces/AgentTimeline';
import AgentDetailPanel from '../components/traces/AgentDetailPanel';

const AgentTraceExplorer = () => {
  const { analysisId } = useParams();
  const { currentAnalysis, loadSpecificAnalysis, isRefreshing, lastRefreshed } = useData();
  const [analysis, setAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState(null);

  useEffect(() => {
    const initAnalysis = async () => {
      // If we are looking at the globally active analysis, just use it
      if (currentAnalysis && (currentAnalysis.analysis_id === analysisId || currentAnalysis.id === analysisId || !analysisId)) {
        setAnalysis(currentAnalysis);
        if (currentAnalysis.traces && currentAnalysis.traces.length > 0) {
          setSelectedTrace(currentAnalysis.traces[0]);
        } else if (currentAnalysis.agent_history && currentAnalysis.agent_history.length > 0) {
          setSelectedTrace({ agent_name: currentAnalysis.agent_history[0], status: 'UNKNOWN' });
        }
        return;
      }

      // Otherwise we need to load this specific ID
      if (analysisId) {
        setLocalLoading(true);
        const data = await loadSpecificAnalysis(analysisId);
        setAnalysis(data);
        if (data && data.traces && data.traces.length > 0) {
          setSelectedTrace(data.traces[0]);
        } else if (data && data.agent_history && data.agent_history.length > 0) {
          setSelectedTrace({ agent_name: data.agent_history[0], status: 'UNKNOWN' });
        }
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
      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-24">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading agent traces...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        {analysisId && (
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 mb-8 w-fit mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
        )}
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">No Analysis Selected</h2>
          <p className="text-sm text-slate-400 mb-6">
            {isInitialLoad 
              ? "Click 'Refresh Data' to load your workspace."
              : "Please select an analysis from the Dashboard or History to view its agent trace."}
          </p>
        </div>
      </div>
    );
  }

  const hasTraces = analysis?.traces?.length > 0;
  const hasHistory = analysis?.agent_history?.length > 0;

  if (!hasTraces && !hasHistory) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        {analysisId && (
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 mb-8 w-fit mx-auto">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
        )}
        <p className="text-slate-400">No agent trace data is available for this analysis.</p>
      </div>
    );
  }

  const displayId = analysisId || analysis?.analysis_id || analysis?.id;

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          {displayId && (
            <Link to={`/analyses/${displayId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2 w-fit">
              <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
            </Link>
          )}
          <h1 className="text-2xl font-bold text-white tracking-wide">Agent Execution Trace</h1>
          <p className="text-sm text-slate-400 mt-1">Review the exact sequence of agents and sanitized tool executions that generated this architecture.</p>
        </div>
        
        <div className="flex gap-2">
          {displayId && (
            <>
              <Link
                to={`/architecture/${displayId}`}
                className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
              >
                <Layers className="h-4 w-4 text-blue-400" />
                View Architecture
              </Link>
              <Link
                to={`/metrics/${displayId}`}
                className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
              >
                View LLM Metrics
              </Link>
            </>
          )}
        </div>
      </div>

      <TraceSummary 
        traces={analysis.traces} 
        agentHistory={analysis.agent_history} 
        metrics={analysis.metrics}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <AgentTimeline 
          agentHistory={analysis.agent_history}
          traces={analysis.traces}
          selectedTrace={selectedTrace}
          onSelectTrace={setSelectedTrace}
        />
        
        <AgentDetailPanel agentTrace={selectedTrace} />
      </div>
    </div>
  );
};

export default AgentTraceExplorer;
