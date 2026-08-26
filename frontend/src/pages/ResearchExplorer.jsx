import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, ArrowLeft, GitCompare } from 'lucide-react';

import ResearchSummary from '../components/research/ResearchSummary';
import ComponentSidebar from '../components/research/ComponentSidebar';
import CandidateList from '../components/research/CandidateList';
import CandidateDetailsModal from '../components/research/CandidateDetailsModal';
import CandidateComparison from '../components/research/CandidateComparison';
import ResearchToolsPanel from '../components/research/ResearchToolsPanel';

const ResearchExplorer = () => {
  const { analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [comparisonSelection, setComparisonSelection] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAnalysis(analysisId);
        setAnalysis(data);
        if (data?.components?.length > 0) {
          setSelectedComponentId(data.components[0].id);
        }
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

  const toggleComparisonSelection = (candidateName) => {
    setComparisonSelection(prev => {
      if (prev.includes(candidateName)) {
        return prev.filter(name => name !== candidateName);
      }
      if (prev.length >= 3) {
        alert("You can only compare up to 3 candidates at once.");
        return prev;
      }
      return [...prev, candidateName];
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 py-24">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading research data...</p>
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
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Research</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link to={`/analyses/${analysisId}`} className="text-sm font-medium text-slate-400 hover:text-slate-300 flex items-center gap-1 mb-2 w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-wide">Research Explorer</h1>
          <p className="text-sm text-slate-400 mt-1">Investigate discovered components, candidate evaluations, and architectural decisions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {comparisonSelection.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-sm"
            >
              <GitCompare className="h-4 w-4" /> Compare Candidates ({comparisonSelection.length})
            </button>
          )}
          
          <Link
            to={`/architecture/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            View Architecture
          </Link>
          <Link
            to={`/mcp/${analysisId}`}
            className="inline-flex items-center gap-2 rounded-md bg-slate-800 border border-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap h-fit"
          >
            View Tool Usage
          </Link>
        </div>
      </div>

      <ResearchSummary analysis={analysis} />

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <ComponentSidebar 
          components={analysis.components} 
          selectedComponentId={selectedComponentId}
          onSelect={setSelectedComponentId}
          candidates={analysis.candidates}
        />
        
        <CandidateList 
          componentId={selectedComponentId}
          candidates={analysis.candidates}
          onSelectCandidate={setSelectedCandidate}
          comparisonSelection={comparisonSelection}
          toggleComparisonSelection={toggleComparisonSelection}
        />
        
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <ResearchToolsPanel traces={analysis.traces} />
        </div>
      </div>

      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          evaluation={analysis.evaluations?.find(e => e.candidate_name === selectedCandidate.name && e.component_id === selectedCandidate.component_id)}
          decision={analysis.decisions?.find(d => d.component_id === selectedCandidate.component_id)}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {showComparison && (
        <CandidateComparison
          selectedCandidatesNames={comparisonSelection}
          candidates={analysis.candidates}
          evaluations={analysis.evaluations}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

export default ResearchExplorer;
