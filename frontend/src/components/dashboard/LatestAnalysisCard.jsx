import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from '../ui/Badge';

const LatestAnalysisCard = ({ analysis }) => {
  if (!analysis) return null;

  const {
    analysis_id,
    domain = 'Unknown Domain',
    requirements = [],
    components = [],
    candidates = [],
    validation_result = {},
    decisions = [],
    created_at,
    updated_at
  } = analysis;

  const dateStr = created_at || updated_at;
  let formattedDate = 'N/A';
  let formattedTime = 'N/A';
  if (dateStr) {
    const d = new Date(dateStr);
    formattedDate = d.toLocaleDateString();
    formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const score = validation_result?.overall_score;
  const valStatus = (validation_result?.overall_status || '');
  
  let badgeStatus = 'neutral';
  let statusText = 'NOT AVAILABLE';
  
  if (valStatus) {
    statusText = valStatus.toUpperCase();
    if (valStatus.toLowerCase() === 'pass') badgeStatus = 'success';
    if (valStatus.toLowerCase() === 'warning') badgeStatus = 'warning';
    if (valStatus.toLowerCase() === 'fail') badgeStatus = 'critical';
  }

  // Calculate decisions
  let reuseCount = 0;
  let adaptCount = 0;
  let buildCount = 0;
  
  decisions.forEach(d => {
    const type = (d.decision || '').toUpperCase();
    if (type === 'REUSE') reuseCount++;
    if (type === 'ADAPT') adaptCount++;
    if (type === 'BUILD') buildCount++;
  });

  return (
    <div className="relative group rounded-xl border bg-[var(--bs-bg-primary)] border-[var(--bs-border-light)] p-8 shadow-sm hover:shadow-2xl hover:shadow-[var(--bs-orange-400)]/10 hover:border-[var(--bs-orange-400)] hover:-translate-y-1 transition-all duration-500 ease-out overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bs-orange-400)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="absolute -inset-24 bg-gradient-to-r from-transparent via-[var(--bs-bg-primary)] to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-spin-slow blur-2xl pointer-events-none transition-all duration-1000"></div>
      <div className="relative flex flex-col md:flex-row gap-8 items-start justify-between z-10">
        
        {/* Left side: Main Content */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold tracking-widest text-[var(--bs-text-tertiary)] uppercase">
              Latest Analysis
            </span>
            <span className="text-[10px] bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] px-2 py-0.5 rounded-full font-mono">
              {formattedDate} at {formattedTime}
            </span>
          </div>
          
          <h2 className="text-3xl font-bold text-[var(--bs-text-primary)] mb-6">
            {domain}
          </h2>
          
          <div className="w-full border-t border-[var(--bs-border-light)] mb-6"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-xs text-[var(--bs-text-tertiary)] uppercase tracking-widest font-semibold mb-1">
                Requirements
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{requirements.length}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-[var(--bs-text-tertiary)] uppercase tracking-widest font-semibold mb-1">
                Components
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{components.length}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-[var(--bs-text-tertiary)] uppercase tracking-widest font-semibold mb-1">
                Candidates
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--bs-text-primary)]">{candidates.length}</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-[var(--bs-text-tertiary)] uppercase tracking-widest font-semibold mb-1">
                Decisions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-[var(--bs-text-primary)] mt-1">
                  {adaptCount} ADAPT &middot; {buildCount} BUILD &middot; {reuseCount} REUSE
                </span>
              </div>
            </div>
          </div>
          
          <Link to={`/analyses/${analysis_id}`} className="inline-flex items-center text-sm font-bold text-[var(--bs-orange-500)] hover:text-[var(--bs-orange-600)] transition-colors">
            View Full Analysis <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        
        {/* Right side: Validation Score */}
        <div className="w-full md:w-64 flex-shrink-0 bg-[var(--bs-bg-secondary)] rounded-lg border border-[var(--bs-border-light)] p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
            Validation
          </span>
          <div className="flex items-end justify-center mb-3">
            {score != null ? (
              <>
                <span className="text-5xl font-bold text-[var(--bs-text-primary)] leading-none tracking-tight">{score}</span>
                <span className="text-xl font-medium text-[var(--bs-text-tertiary)] leading-tight ml-1">/ 100</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-[var(--bs-text-primary)] leading-none tracking-tight">N/A</span>
            )}
          </div>
          <Badge status={badgeStatus} className="w-full justify-center py-1 mt-2">
            {statusText}
          </Badge>
        </div>
        
      </div>
    </div>
  );
};

export default LatestAnalysisCard;

