import React from 'react';
import { ShieldCheck, BookOpen, Scale, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArchitectureReasoning = ({ analysis }) => {
  if (!analysis) return null;

  const analysisId = analysis.analysis_id;
  const decisionsCount = analysis.decisions?.length || 0;
  const requirementsCount = analysis.requirements?.length || 0;
  const componentsCount = analysis.blueprint?.components?.length || 0;

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" /> Architecture Trust & Traceability
      </h2>
      
      <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 border-b border-[var(--bs-border-light)] pb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Based On</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{requirementsCount}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Requirements</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Evaluated From</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{analysis.candidates?.length || 'Multiple'}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Technology Candidates</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Resulting In</span>
            <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{decisionsCount}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Engineering Decisions</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-2">Mapped To</span>
            <span className="text-2xl font-bold text-[var(--bs-blue-500)]">{componentsCount}</span>
            <span className="text-xs text-[var(--bs-text-secondary)]">Architecture Components</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={`/research/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-[var(--bs-text-tertiary)] group-hover:text-[var(--bs-blue-500)] transition-colors" />
              <h3 className="text-sm font-bold text-[var(--bs-text-primary)]">Research Evidence</h3>
            </div>
            <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed">
              Review the initial landscape mapping and primary source documentation that grounded this architecture.
            </p>
          </Link>
          
          <Link to={`/decisions/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-[var(--bs-text-tertiary)] group-hover:text-[var(--bs-blue-500)] transition-colors" />
              <h3 className="text-sm font-bold text-[var(--bs-text-primary)]">Evaluation & Decisions</h3>
            </div>
            <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed">
              See how specific components were chosen through evidence-based evaluation and risk assessment.
            </p>
          </Link>
          
          <Link to={`/validation/${analysisId}`} className="flex flex-col p-4 bg-[var(--bs-blue-500)]/10 border border-[var(--bs-blue-500)]/30 rounded-lg hover:border-[var(--bs-blue-500)] transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--bs-blue-500)]" />
              <h3 className="text-sm font-bold text-[var(--bs-blue-500)]">Validate Architecture</h3>
            </div>
            <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed">
              Proceed to validation to ensure this architecture blueprint meets all critical enterprise standards.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureReasoning;
