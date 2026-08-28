import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, Network, Activity } from 'lucide-react';

import McpSummaryCards from '../components/mcp/McpSummaryCards';
import ToolArchitecture from '../components/mcp/ToolArchitecture';
import CapabilityRegistry from '../components/mcp/CapabilityRegistry';
import ToolUsageTrace from '../components/mcp/ToolUsageTrace';

const McpConsole = () => {
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
      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-24">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading MCP registry data...</p>
      </div>
    );
  }

  if (isInitialLoad || (!analysis && !isLoading)) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        {analysisId && (
          <div className="mb-6">
            <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 w-fit">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </div>
        )}
        <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">No Analysis Selected</h2>
          <p className="text-sm text-slate-400 mb-6">
            {isInitialLoad
              ? "Click 'Refresh Data' to load your workspace."
              : "Please select an analysis from the Dashboard or History to view MCP tool usage."}
          </p>
        </div>
      </div>
    );
  }

  const hasSuccessfulMcp = (analysis.traces || []).some(t => 
    t.tool_calls && t.tool_calls.some(tc => 
      tc.provider?.toUpperCase() === 'MCP' && (tc.status === 'SUCCESS' || tc.status === 'COMPLETED')
    )
  );

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
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Network className="h-6 w-6 text-purple-400" />
            MCP & Tool Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">Inspect how BuildSmart discovers and evaluates existing solutions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg mr-2">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">MCP Runtime Status:</span>
            {hasSuccessfulMcp ? (
              <span className="text-xs font-bold text-green-400">Verified during this analysis</span>
            ) : (
              <span className="text-xs font-bold text-slate-400">Unknown</span>
            )}
          </div>
          
          {displayId && (
            <Link
              to={`/traces/${displayId}`}
              className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              View Agent Trace
            </Link>
          )}
        </div>
      </div>

      <McpSummaryCards traces={analysis.traces} />
      <ToolArchitecture />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <CapabilityRegistry traces={analysis.traces} />
        </div>
        <div className="xl:col-span-2">
          <ToolUsageTrace traces={analysis.traces} />
        </div>
      </div>
    </div>
  );
};

export default McpConsole;
