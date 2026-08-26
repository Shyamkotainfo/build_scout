import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAnalysis } from '../services/analysis_service';
import { Loader2, AlertCircle, CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  'Supervisor',
  'Decomposition',
  'Research',
  'Evaluation',
  'Decision',
  'Blueprint',
  'Validation'
];

const NewAnalysis = () => {
  const [request, setRequest] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!request.trim()) {
      setError('Please describe what you want to build.');
      return;
    }
    
    setError(null);
    setIsExecuting(true);

    try {
      const result = await createAnalysis(request.trim());
      
      // Store locally
      localStorage.setItem('latest_analysis_id', result.analysis_id);
      
      // Navigate to results
      navigate(`/analyses/${result.analysis_id}`);
    } catch (err) {
      setIsExecuting(false);
      
      if (!err.response) {
        setError('Unable to connect to the BuildSmart backend.');
      } else if (err.response.status === 422 || err.response.status === 400) {
        setError('Please describe what you want to build.');
      } else if (err.response.status === 503) {
        setError('AI service is temporarily unavailable. Please try again.');
      } else {
        setError('BuildSmart could not complete this analysis.');
      }
    }
  };

  const handleClear = () => {
    setRequest('');
    setError(null);
  };

  if (isExecuting) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto w-full px-4 py-12">
        <div className="mb-12 flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <h2 className="text-xl font-medium text-slate-100 mb-2">Running BuildSmart analysis...</h2>
          <p className="text-sm text-slate-400">This process typically takes 1-3 minutes as agents evaluate requirements, candidates, and architectures.</p>
        </div>
        
        <div className="w-full">
          <nav aria-label="Progress">
            <ol role="list" className="overflow-hidden flex flex-wrap gap-4 items-center justify-between relative">
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-700 -z-10 mt-[1px]" />
              {STEPS.map((step) => (
                <li key={step} className="relative flex flex-col items-center flex-1">
                  <div className="group flex flex-col items-center bg-slate-900 px-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700">
                      <Circle className="h-4 w-4 text-slate-600" />
                    </span>
                    <span className="mt-2 text-xs font-medium text-slate-500">
                      {step}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-wide mb-2">New Analysis</h1>
        <p className="text-sm text-slate-400">
          Describe what you want to build. BuildSmart will discover existing solutions, evaluate them, and recommend what to reuse, adapt, or build.
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <label htmlFor="request" className="block text-sm font-medium text-slate-300 mb-2">
          What do you want to build?
        </label>
        
        <div className="relative flex-1 flex flex-col">
          <textarea
            id="request"
            name="request"
            rows={10}
            className={`flex-1 block w-full rounded-md border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500 focus:border-blue-500'} bg-slate-800 text-white placeholder-slate-500 p-4 shadow-sm sm:text-sm resize-none`}
            placeholder="I want to build an AI customer-support assistant with RAG, authentication, conversation history, and analytics."
            value={request}
            onChange={(e) => {
              setRequest(e.target.value);
              if (error) setError(null);
            }}
          />
          {error && (
            <div className="absolute bottom-4 left-4 flex items-center text-red-400 text-sm bg-slate-900/80 px-3 py-1.5 rounded border border-red-900/50">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center rounded-md border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
          >
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAnalysis;
