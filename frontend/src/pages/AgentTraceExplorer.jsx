import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, ArrowLeft, Layers } from 'lucide-react';

import TraceSummary from '../components/traces/TraceSummary';
import AgentTimeline from '../components/traces/AgentTimeline';
import AgentDetailPanel from '../components/traces/AgentDetailPanel';

const AgentTraceExplorer = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrace, setSelectedTrace] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAnalysis(analysisId);
        setAnalysis(data);
        
        // Auto-select first trace if available
        if (data.traces && data.traces.length > 0) {
          setSelectedTrace(data.traces[0]);
        } else if (data.agent_history && data.agent_history.length > 0) {
          setSelectedTrace({ agent_name: data.agent_history[0], status: 'UNKNOWN' });
        }
      } catch (err) {
        if (!err.response) {
          setError('Unable to connect to the BuildSmart backend.');
        } else if (err.response.status === 404) {
          setError('Analysis not found.');
        } else {
          setError('BuildSmart could not load this analysis trace.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (analysisId) {
      fetchAnalysis();
    }
  }, [analysisId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-24">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading agent traces...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-6">
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
        </div>
        <div className="bg-slate-800 border border-red-900/50 p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Traces</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const hasTraces = analysis.traces?.length > 0;
  const hasHistory = analysis.agent_history?.length > 0;

  if (!hasTraces && !hasHistory) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 mb-8 w-fit mx-auto">
          <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
        </Link>
        <p className="text-slate-400">No agent trace data is available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-wide">Agent Execution Trace</h1>
          <p className="text-sm text-slate-400 mt-1">Review the exact sequence of agents and sanitized tool executions that generated this architecture.</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/architecture/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            View Architecture
          </Link>
          <Link
            to={`/metrics/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            View LLM Metrics
          </Link>
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
