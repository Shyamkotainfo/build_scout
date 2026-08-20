import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, ArrowLeft, Search } from 'lucide-react';

import AnalysisHeader from '../components/analysis/AnalysisHeader';
import RequirementsSection from '../components/analysis/RequirementsSection';
import ComponentsSection from '../components/analysis/ComponentsSection';
import CandidatesSection from '../components/analysis/CandidatesSection';
import EvaluationsSection from '../components/analysis/EvaluationsSection';
import DecisionsSection from '../components/analysis/DecisionsSection';
import BlueprintSection from '../components/analysis/BlueprintSection';
import ValidationSection from '../components/analysis/ValidationSection';
import AgentTraceSection from '../components/analysis/AgentTraceSection';
import MetricsSection from '../components/analysis/MetricsSection';

const AnalysisResult = () => {
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
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading analysis details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        <div className="mb-6">
          <Link to="/" className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
        <div className="bg-slate-800 border border-red-900/50 p-8 rounded-lg text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Analysis</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Link 
            to="/new-analysis"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Start New Analysis
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
        <AnalysisHeader analysis={analysis} />
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link 
            to={`/research/${analysis.analysis_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            <Search className="h-4 w-4 text-blue-400" />
            Research
          </Link>
          <Link 
            to={`/architecture/${analysis.analysis_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            Architecture
          </Link>
          <Link 
            to={`/traces/${analysis.analysis_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            Agent Trace
          </Link>
          <Link 
            to={`/mcp/${analysis.analysis_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            MCP & Tools
          </Link>
          <Link 
            to={`/metrics/${analysis.analysis_id}`}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            LLM Metrics
          </Link>
        </div>
      </div>
      
      <DecisionsSection decisions={analysis.decisions} />
      
      <BlueprintSection blueprint={analysis.blueprint} />
      
      <ValidationSection validation={analysis.validation_result} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
        <div>
          <RequirementsSection requirements={analysis.requirements} />
          <ComponentsSection components={analysis.components} />
        </div>
        <div>
          <CandidatesSection candidates={analysis.candidates} />
          <EvaluationsSection evaluations={analysis.evaluations} />
        </div>
      </div>
      
      <AgentTraceSection agentHistory={analysis.agent_history} traces={analysis.traces} />
      
      <MetricsSection metrics={analysis.llm_metrics} />
    </div>
  );
};

export default AnalysisResult;
