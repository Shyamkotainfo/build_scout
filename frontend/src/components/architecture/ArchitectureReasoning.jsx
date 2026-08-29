import React from 'react';
import { ShieldCheck, BookOpen, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArchitectureReasoning = ({ analysis }) => {
  if (!analysis) return null;

  const analysisId = analysis.analysis_id;
  const decisionsCount = analysis.decisions?.length || 0;
  const componentsCount = analysis.blueprint?.components?.length || 0;
  
  // Use rationale/reasoning from blueprint if available
  const rationale = analysis.blueprint?.rationale || analysis.blueprint?.reasoning || analysis.blueprint?.architecture_reasoning;

  return (
    <div className="mb-12">
      {/* Why this architecture? */}
      <div className="mb-10">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
          Why this architecture?
        </h2>
        <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm">
          {rationale ? (
            <p className="text-sm text-[var(--bs-text-primary)] leading-relaxed whitespace-pre-wrap">
              {rationale}
            </p>
          ) : (
            <p className="text-sm text-[var(--bs-text-secondary)] italic">
              Architecture rationale is not available for this analysis.
            </p>
          )}
        </div>
      </div>

      {/* Trust & Traceability */}
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" /> Trust & Traceability
      </h2>
      
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 border-b border-[var(--bs-border-light)] pb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Based On</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{componentsCount}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Components</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Evaluated From</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{analysis.candidates?.length || 0}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Candidates</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Decisions</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{decisionsCount}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Made</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Validated</span>
            <span className="text-2xl font-bold text-[var(--bs-blue-500)]">{analysis.validation_result?.status === 'PASS' ? 'YES' : (analysis.validation_result?.status === 'FAIL' ? 'NO' : 'N/A')}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Enterprise Standards</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/research/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-[var(--bs-text-tertiary)] group-hover:text-[var(--bs-blue-500)] transition-colors" />
              <h3 className="text-sm font-bold text-[var(--bs-text-primary)]">Research</h3>
            </div>
          </Link>
          
          <Link to={`/decisions/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-[var(--bs-text-tertiary)] group-hover:text-[var(--bs-blue-500)] transition-colors" />
              <h3 className="text-sm font-bold text-[var(--bs-text-primary)]">Evaluations</h3>
            </div>
          </Link>
          
          <Link to={`/validation/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--bs-text-tertiary)] group-hover:text-[var(--bs-blue-500)] transition-colors" />
              <h3 className="text-sm font-bold text-[var(--bs-text-primary)]">Validation</h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureReasoning;
