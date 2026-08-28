import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, History, Clock } from 'lucide-react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

const HistorySection = ({ history, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="mb-6 h-full flex flex-col">
        <SectionHeader title="Analysis History" />
        <Card className="flex-1 p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-[var(--bs-border-light)] rounded-full mb-3"></div>
            <div className="h-3 w-32 bg-[var(--bs-border-light)] rounded mb-2"></div>
            <div className="h-2 w-24 bg-[var(--bs-border-light)] rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 h-full flex flex-col">
        <SectionHeader title="Analysis History" />
        <Card className="flex-1 p-6 border-[var(--bs-status-critical-border)] min-h-[200px]">
          <EmptyState 
            icon={History} 
            title="History Unavailable" 
            description={error}
          />
        </Card>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="mb-6 h-full flex flex-col">
        <SectionHeader title="Analysis History" />
        <Card className="flex-1 p-6 min-h-[200px]">
          <EmptyState 
            icon={History} 
            title="No previous analyses" 
            description="Run your first analysis to see it here."
          />
        </Card>
      </div>
    );
  }

  // Limit to 4 most recent
  const topHistory = history.slice(0, 4);

  return (
    <div className="mb-6 h-full flex flex-col">
      <SectionHeader title="Analysis History" />
      <div className="flex flex-col gap-3 flex-1">
        {topHistory.map((h) => {
          const score = h.validation_result?.overall_score ?? 0;
          const status = (h.validation_result?.overall_status || 'UNKNOWN').toLowerCase();
          
          let badgeStatus = 'neutral';
          if (status === 'pass') badgeStatus = 'success';
          if (status === 'warning') badgeStatus = 'warning';
          if (status === 'fail') badgeStatus = 'critical';
          
          const timeLabel = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // mock date since API doesn't return created_at easily yet
          
          const reqs = h.requirements_count ?? h.requirements?.length ?? 0;
          
          let reuseCount = 0;
          let adaptCount = 0;
          let buildCount = 0;
          const decisions = h.decisions || [];
          decisions.forEach(d => {
            const type = (d.decision_type || d.type || '').toUpperCase();
            if (type === 'REUSE') reuseCount++;
            if (type === 'ADAPT') adaptCount++;
            if (type === 'BUILD') buildCount++;
          });
          
          // Fallback simple counts if missing full decisions array but has counts
          if (decisions.length === 0) {
             reuseCount = h.decision_summary?.reuse || 0;
             adaptCount = h.decision_summary?.adapt || 0;
             buildCount = h.decision_summary?.build || 0;
          }

          return (
            <Link 
              key={h.analysis_id} 
              to={`/analyses/${h.analysis_id}`}
              className="block group"
            >
              <Card className="p-4 hover:border-[var(--bs-orange-400)] transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-[var(--bs-text-primary)] line-clamp-1 mb-1 group-hover:text-[var(--bs-orange-500)] transition-colors">
                    {h.domain || 'Unnamed Analysis'}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--bs-text-tertiary)]">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {timeLabel}</span>
                    <span>{reqs} requirements</span>
                    {(reuseCount > 0 || adaptCount > 0 || buildCount > 0) && (
                      <span className="font-medium text-[var(--bs-text-secondary)]">
                        {adaptCount} ADAPT &middot; {buildCount} BUILD
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end ml-4 gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[var(--bs-text-primary)] leading-none">{score}</span>
                    <span className="text-[10px] font-medium text-[var(--bs-text-tertiary)]">/ 100</span>
                  </div>
                  <Badge status={badgeStatus} className="text-[9px] px-1.5 py-0.5">
                    {status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            </Link>
          );
        })}
        
        {history.length > 4 && (
          <div className="mt-2 text-center">
             <Link to="/analyses" className="text-xs font-semibold text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] transition-colors inline-flex items-center">
               View All Analyses <ArrowRight className="w-3 h-3 ml-1" />
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySection;
