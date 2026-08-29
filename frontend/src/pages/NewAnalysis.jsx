import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAnalysis } from '../services/analysis_service';
import { AlertCircle, CheckCircle2, Circle, Loader2, Play, RefreshCw, Terminal } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Button from '../components/ui/Button';

const EXAMPLES = [
  "Build an AI document intelligence platform using AWS. Users should upload PDF documents, extract text using OCR, store documents securely, provide semantic search and RAG question answering, support authentication, and expose enterprise APIs.",
  "Build an enterprise event-driven data platform for processing real-time analytics with Kafka.",
  "Build an internal developer portal with service catalog, deployment tracking, and automated provisioning."
];

const NewAnalysis = () => {
  const [request, setRequest] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addAnalysis } = useData();

  const handleAnalyze = async () => {
    if (!request.trim()) {
      setError('Please describe what you want to build.');
      return;
    }
    
    setError(null);
    setIsExecuting(true);

    try {
      const result = await createAnalysis(request.trim());
      localStorage.setItem('latest_analysis_id', result.analysis_id);
      
      // Add the initial queued analysis to the context so it appears in history
      addAnalysis({
        analysis_id: result.analysis_id,
        user_request: request.trim(),
        status: result.status || 'QUEUED',
      });
      
      navigate(`/analyses/${result.analysis_id}`);
    } catch (err) {
      setIsExecuting(false);
      
      const customError = {
        message: err.message || 'An unknown error occurred.',
        code: err.code || 'UNKNOWN_ERROR',
        status: err.status || 500,
        details: err.details || null
      };

      setError(customError);
    }
  };

  if (isExecuting) {
    return (
      <div className="flex flex-col h-full items-center justify-center pt-32 pb-8">
        <Loader2 className="w-12 h-12 text-[var(--bs-orange-500)] animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-[var(--bs-text-primary)] tracking-tight">Starting analysis...</h2>
      </div>
    );
  }

  if (error) {
    let errorTitle = 'ANALYSIS COULD NOT BE COMPLETED';
    let errorMessage = error.message;
    
    if (error.code === 'NETWORK_FAILURE') {
      errorTitle = 'BACKEND UNAVAILABLE';
      errorMessage = 'Unable to connect to the BuildScout backend. Please check your network connection or ensure the server is running.';
    } else if (error.code === 'ANALYSIS_EXECUTION_FAILED') {
      errorTitle = 'ANALYSIS PIPELINE FAILED';
    } else if (error.code === 'VALIDATION_ERROR') {
      errorTitle = 'INVALID REQUEST';
      errorMessage = 'Please provide a valid description of what you want to build.';
    } else if (error.code === 'SERVICE_UNAVAILABLE') {
      errorTitle = 'SERVICE UNAVAILABLE';
    } else if (error.code === 'MCP_TIMEOUT') {
      errorTitle = 'ANALYSIS TIMEOUT';
    }

    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto w-full pt-16 pb-8">
        <div className="flex flex-col mb-12">
          <h1 className="text-3xl font-bold text-red-500 tracking-tight flex items-center gap-3">
            <AlertCircle className="w-8 h-8" />
            {errorTitle}
          </h1>
        </div>
        <div className="bg-[var(--bs-bg-secondary)] border border-red-900/30 rounded-lg p-8 shadow-sm text-[var(--bs-text-primary)]">
          
          <div className="mb-8">
            <p className="font-semibold text-lg mb-2">Error Details:</p>
            <p className="text-[var(--bs-text-secondary)]">{errorMessage}</p>
            
            {error.details && (
              <pre className="mt-4 p-4 bg-black/20 rounded text-xs text-[var(--bs-text-tertiary)] overflow-x-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="primary" onClick={handleAnalyze}>
              Retry Analysis
            </Button>
            <Button variant="outline" onClick={() => setError(null)}>
              Back to New Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pb-12">
      <div className="flex flex-col pb-8 mb-8 border-b border-[var(--bs-border-light)] pt-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-[var(--bs-orange-500)]" />
          <h1 className="text-2xl font-bold text-[var(--bs-text-primary)] tracking-tight">
            NEW ANALYSIS
          </h1>
        </div>
        <h2 className="text-lg font-medium text-[var(--bs-text-primary)] mt-4">
          Tell BuildScout what you're planning to build.
        </h2>
        <p className="text-sm text-[var(--bs-text-tertiary)] mt-2 font-medium max-w-2xl leading-relaxed">
          BuildScout will discover existing solutions, evaluate the evidence, recommend what to reuse, adapt, or build, and validate the resulting architecture.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col">
            <textarea
              id="request"
              name="request"
              rows={8}
              className={`w-full rounded-md border ${error ? 'border-red-500 focus:border-red-500' : 'border-[var(--bs-border-light)] focus:border-[var(--bs-orange-500)] focus:ring-1 focus:ring-[var(--bs-orange-500)]'} bg-[var(--bs-bg-primary)] text-[var(--bs-text-primary)] p-4 shadow-sm text-base resize-y transition-colors font-mono`}
              placeholder="E.g., Build an AI document intelligence platform using AWS..."
              value={request}
              onChange={(e) => {
                setRequest(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAnalyze();
                }
              }}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-[var(--bs-text-tertiary)] font-mono">
                {request.length} characters
              </span>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setRequest('')} disabled={!request}>
                  Clear
                </Button>
                <Button variant="primary" onClick={handleAnalyze} disabled={!request.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze Solution
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)] mb-4">Example Requests</h3>
            <div className="flex flex-col gap-3">
              {EXAMPLES.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRequest(example)}
                  className="text-left text-sm text-[var(--bs-text-secondary)] hover:text-[var(--bs-orange-500)] bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] hover:border-[var(--bs-orange-500)] p-3 rounded-md transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-[var(--bs-bg-secondary)] rounded-lg p-6 border border-[var(--bs-border-light)] h-fit sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)] mb-6">Analysis Expectations</h3>
            
            <div className="flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">1</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">UNDERSTAND</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">Normalize requirements</span>
                </div>
              </div>
              
              <div className="w-0.5 h-4 bg-[var(--bs-border-light)] ml-3 -my-3" />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">2</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">DISCOVER</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">Search existing solutions</span>
                </div>
              </div>
              
              <div className="w-0.5 h-4 bg-[var(--bs-border-light)] ml-3 -my-3" />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">3</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">EVALUATE</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">Assess evidence</span>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-[var(--bs-border-light)] ml-3 -my-3" />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">4</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">DECIDE</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">REUSE / ADAPT / BUILD</span>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-[var(--bs-border-light)] ml-3 -my-3" />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">5</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">BLUEPRINT</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">Generate architecture</span>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-[var(--bs-border-light)] ml-3 -my-3" />
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] flex items-center justify-center text-xs font-bold shrink-0 border border-[var(--bs-border-light)]">6</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">VALIDATE</span>
                  <span className="text-xs text-[var(--bs-text-tertiary)]">Check consistency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAnalysis;
