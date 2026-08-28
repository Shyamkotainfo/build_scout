import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const DecisionHighlights = ({ analysis }) => {
  if (!analysis || !analysis.decisions || analysis.decisions.length === 0) return null;

  // Let's grab components to resolve component names from component_id
  const componentsMap = {};
  if (analysis.components) {
    analysis.components.forEach(c => {
      componentsMap[c.id] = c.name;
    });
  }

  // Sort decisions by confidence or prioritize BUILD/ADAPT
  const sortedDecisions = [...analysis.decisions].sort((a, b) => {
    // Arbitrary sorting logic for highlights: lower confidence first or BUILD first
    if (a.decision === 'BUILD' && b.decision !== 'BUILD') return -1;
    if (a.decision !== 'BUILD' && b.decision === 'BUILD') return 1;
    return a.confidence - b.confidence;
  });

  const highlights = sortedDecisions.slice(0, 3);

  return (
    <div className="mb-6">
      <SectionHeader 
        title="Decision Highlights" 
        subtitle="Key architectural choices" 
        actions={
          <Link to={`/decisions`}>
            <Button variant="outline" size="sm">View All Decisions</Button>
          </Link>
        }
      />
      <div className="flex flex-col gap-3">
        {highlights.map((d, idx) => {
          const compName = componentsMap[d.component_id] || d.component || d.component_id || 'Unknown Component';
          const decisionStatus = (d.decision || d.type || '').toLowerCase();
          const badgeValue = d.decision || d.type || 'UNKNOWN';
          const confPercent = Math.round((d.confidence || 0) * 100);

          return (
            <Card key={idx} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-[var(--bs-text-primary)] text-sm">{compName}</h4>
                  <Badge status={decisionStatus} className="text-[10px]">{badgeValue}</Badge>
                </div>
                <p className="text-xs text-[var(--bs-text-secondary)] line-clamp-2 mt-1">
                  {d.reason || d.reasoning || 'No specific reasoning provided.'}
                </p>
                {d.selected_candidate_name && (
                  <p className="text-[11px] text-[var(--bs-text-tertiary)] mt-2">
                    Selected: <span className="font-medium text-[var(--bs-text-secondary)]">{d.selected_candidate_name}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col md:items-end text-left md:text-right shrink-0 min-w-[120px]">
                <span className="text-[10px] font-semibold tracking-wider text-[var(--bs-text-tertiary)] uppercase">
                  Confidence
                </span>
                <span className={`text-xl font-bold mt-0.5 ${
                  confPercent >= 90 ? 'text-[var(--bs-status-success)]' :
                  confPercent >= 70 ? 'text-[var(--bs-status-warning)]' :
                  'text-[var(--bs-status-critical)]'
                }`}>
                  {confPercent}%
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionHighlights;
