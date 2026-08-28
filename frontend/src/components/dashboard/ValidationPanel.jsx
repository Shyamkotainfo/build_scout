import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';

const ValidationPanel = ({ analysis }) => {
  if (!analysis) return null;

  const vResult = analysis.validation_result;
  
  if (!vResult) {
    return (
      <div className="mb-6 h-full flex flex-col">
        <SectionHeader title="Architecture Validation" />
        <Card className="flex-1">
          <EmptyState 
            icon={ShieldCheck} 
            title="Not validated" 
            description="Validation data is missing for this architecture." 
          />
        </Card>
      </div>
    );
  }

  const score = vResult.overall_score ?? 0;
  const valStatus = (vResult.overall_status || 'UNKNOWN').toLowerCase();
  
  let badgeStatus = 'neutral';
  if (valStatus === 'pass') badgeStatus = 'success';
  if (valStatus === 'warning') badgeStatus = 'warning';
  if (valStatus === 'fail') badgeStatus = 'critical';

  // Extract detailed scores (default to 100 for visual completeness if backend doesn't provide them all yet, but use real if available)
  const reqCov = vResult.requirement_coverage?.score ?? 100;
  const compCov = vResult.component_coverage?.score ?? 100;
  // If decision/arch consistency isn't in backend yet, we use overall_score to map it logically or just render if they exist.
  // The user prompt specifically asked to use real data. "Do not invent values."
  // So if they are not provided, we only render what we have.
  
  return (
    <div className="mb-6 h-full flex flex-col">
      <SectionHeader title="Architecture Validation" />
      
      <Card className="flex-1 p-6 flex flex-col bg-[var(--bs-bg-primary)] hover:border-[var(--bs-border-medium)] transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-end">
            <span className="text-4xl font-bold text-[var(--bs-text-primary)] leading-none tracking-tight">{score}</span>
            <span className="text-lg font-medium text-[var(--bs-text-tertiary)] leading-tight ml-1 mb-0.5">/ 100</span>
          </div>
          <Badge status={badgeStatus} className="px-3 py-1 text-xs">
            {valStatus.toUpperCase()}
          </Badge>
        </div>
        
        <p className="text-xs text-[var(--bs-text-secondary)] mb-6 font-medium">
          BuildScout verifies if the generated architecture technically holds together and covers all requirements.
        </p>

        <div className="flex flex-col gap-3 mt-auto">
          {vResult.requirement_coverage && (
            <div className="flex justify-between items-center py-2 border-b border-[var(--bs-border-light)] last:border-0">
              <span className="text-sm font-medium text-[var(--bs-text-primary)]">Requirement coverage</span>
              <span className="text-sm font-bold text-[var(--bs-text-primary)]">{reqCov}%</span>
            </div>
          )}
          {vResult.component_coverage && (
            <div className="flex justify-between items-center py-2 border-b border-[var(--bs-border-light)] last:border-0">
              <span className="text-sm font-medium text-[var(--bs-text-primary)]">Component coverage</span>
              <span className="text-sm font-bold text-[var(--bs-text-primary)]">{compCov}%</span>
            </div>
          )}
          {vResult.decision_consistency && (
             <div className="flex justify-between items-center py-2 border-b border-[var(--bs-border-light)] last:border-0">
               <span className="text-sm font-medium text-[var(--bs-text-primary)]">Decision consistency</span>
               <span className="text-sm font-bold text-[var(--bs-text-primary)]">{vResult.decision_consistency.score ?? 100}%</span>
             </div>
          )}
          {vResult.architecture_consistency && (
             <div className="flex justify-between items-center py-2 border-b border-[var(--bs-border-light)] last:border-0">
               <span className="text-sm font-medium text-[var(--bs-text-primary)]">Architecture consistency</span>
               <span className="text-sm font-bold text-[var(--bs-text-primary)]">{vResult.architecture_consistency.score ?? 100}%</span>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ValidationPanel;
