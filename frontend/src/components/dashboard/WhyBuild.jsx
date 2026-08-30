import React from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import { Hammer } from 'lucide-react';

const WhyBuild = ({ analysis }) => {
  if (!analysis || !analysis.decisions) return null;

  const buildDecisions = analysis.decisions.filter(d => (d.decision_type || '').toUpperCase() === 'BUILD');
  
  if (buildDecisions.length === 0) return null;

  // Aggregate and deduplicate reasons
  const rawReasons = buildDecisions
    .map(d => d.reason || d.reasoning)
    .filter(Boolean);
    
  // Simple deduplication based on exact string matches
  const uniqueReasons = [...new Set(rawReasons)];

  return (
    <div className="mb-6 h-full flex flex-col">
      <SectionHeader title="Why Build?" subtitle="Insights on custom implementation" />
      <Card className="flex-1 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-[var(--bs-orange-500)] bg-opacity-10 rounded-md">
            <Hammer className="w-5 h-5 text-[var(--bs-orange-500)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--bs-text-primary)]">
            {buildDecisions.length} component{buildDecisions.length !== 1 ? 's' : ''} require new implementation.
          </span>
        </div>
        
        {uniqueReasons.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-[var(--bs-text-tertiary)] uppercase tracking-widest font-bold">
              Primary Reasons
            </p>
            <ul className="list-disc pl-4 space-y-2 text-sm text-[var(--bs-text-secondary)]">
              {uniqueReasons.slice(0, 4).map((reason, idx) => (
                <li key={idx} className="pl-1 leading-relaxed">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WhyBuild;
