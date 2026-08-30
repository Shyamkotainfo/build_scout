import React from 'react';
import Badge from '../ui/Badge';
import { Target } from 'lucide-react';

const RequirementsSection = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col mb-12">
      <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-6 flex items-center gap-2 uppercase">
        <Target className="w-5 h-5 text-[var(--bs-orange-500)]" />
        Requirements Coverage
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requirements.map((req) => (
          <div key={req.id} className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-5 flex flex-col group hover:border-[var(--bs-border-hover)] transition-colors">
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest bg-[var(--bs-bg-primary)] px-2 py-1 rounded border border-[var(--bs-border-light)]">
                {req.id}
              </span>
              <Badge 
                variant={
                  req.priority?.toUpperCase() === 'HIGH' ? 'critical' :
                  req.priority?.toUpperCase() === 'MEDIUM' ? 'warning' :
                  'default'
                }
              >
                {req.priority?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            <p className="text-sm text-[var(--bs-text-secondary)] mt-2 flex-1">
              {req.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequirementsSection;
