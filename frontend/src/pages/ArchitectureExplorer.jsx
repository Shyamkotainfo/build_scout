import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, ArrowLeft, Activity } from 'lucide-react';

import ArchitectureHeader from '../components/architecture/ArchitectureHeader';
import ArchitectureDiagram from '../components/architecture/ArchitectureDiagram';
import ComponentArchitectureList from '../components/architecture/ComponentArchitectureList';
import IntegrationPoints from '../components/architecture/IntegrationPoints';
import PhasesAndRisks from '../components/architecture/PhasesAndRisks';

const ArchitectureExplorer = () => {
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
        <p className="text-sm font-medium">Loading architecture blueprint...</p>
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
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Architecture</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;
  if (!analysis.blueprint || Object.keys(analysis.blueprint).length === 0) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center justify-center gap-1 mb-8 w-fit mx-auto">
          <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
        </Link>
        <p className="text-slate-400">No architecture blueprint is available for this analysis.</p>
      </div>
    );
  }

  const reuseSummary = analysis.blueprint.reuse_summary;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
        </div>
        
        <Link
          to={`/traces/${analysisId}`}
          className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
        >
          <Activity className="h-4 w-4 text-emerald-400" />
          View Agent Trace
        </Link>
      </div>

      <ArchitectureHeader analysis={analysis} />

      {/* Reuse Summary Row */}
      {reuseSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-800 border border-green-900/50 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">REUSE Components</span>
              <span className="text-2xl font-bold text-green-400">{reuseSummary.reuse || 0}</span>
            </div>
          </div>
          <div className="bg-slate-800 border border-yellow-900/50 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ADAPT Components</span>
              <span className="text-2xl font-bold text-yellow-400">{reuseSummary.adapt || 0}</span>
            </div>
          </div>
          <div className="bg-slate-800 border border-blue-900/50 rounded-lg p-5 flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">BUILD Components</span>
              <span className="text-2xl font-bold text-blue-400">{reuseSummary.build || 0}</span>
            </div>
          </div>
        </div>
      )}

      <ArchitectureDiagram blueprint={analysis.blueprint} decisions={analysis.decisions} />

      <ComponentArchitectureList blueprint={analysis.blueprint} decisions={analysis.decisions} />

      <IntegrationPoints integrationPoints={analysis.blueprint.integration_points} />

      <PhasesAndRisks blueprint={analysis.blueprint} />
    </div>
  );
};

export default ArchitectureExplorer;
