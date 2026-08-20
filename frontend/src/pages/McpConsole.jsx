import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, ArrowLeft, Network, Activity } from 'lucide-react';

import McpSummaryCards from '../components/mcp/McpSummaryCards';
import ToolArchitecture from '../components/mcp/ToolArchitecture';
import CapabilityRegistry from '../components/mcp/CapabilityRegistry';
import ToolUsageTrace from '../components/mcp/ToolUsageTrace';

const McpConsole = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAnalysis(analysisId);
        setAnalysis(data);
      } catch (err) {
        if (!err.response) {
          setError('Unable to connect to the BuildSmart backend.');
        } else if (err.response.status === 404) {
          setError('Analysis not found.');
        } else {
          setError('BuildSmart could not load this analysis.');
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
        <p className="text-sm font-medium">Loading MCP registry data...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-6">
          <Link to={analysisId ? `/analyses/${analysisId}` : '/new-analysis'} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
        <div className="bg-slate-800 border border-red-900/50 p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading MCP Data</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'Please select a valid analysis.'}</p>
        </div>
      </div>
    );
  }

  const hasSuccessfulMcp = (analysis.traces || []).some(t => 
    t.tool_calls && t.tool_calls.some(tc => 
      tc.provider?.toUpperCase() === 'MCP' && (tc.status === 'SUCCESS' || tc.status === 'COMPLETED')
    )
  );

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
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
          
          <Link
            to={`/traces/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            <Activity className="h-4 w-4 text-emerald-400" />
            View Agent Trace
          </Link>
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
