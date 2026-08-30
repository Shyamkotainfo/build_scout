import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

const IntegrationPoints = ({ integrationPoints }) => {
  if (!integrationPoints || integrationPoints.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4" /> Integration Map
        </h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--bs-text-secondary)]">No integration points available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4" /> Integration Map
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrationPoints.map((point, idx) => {
          const name = point.name || `Integration ${idx + 1}`;
          const desc = point.description || null;
          
          const isInternal = point.type === 'Internal';
          const isExternal = point.type === 'External' || point.type === 'MCP' || point.type === 'Cloud service';
          
          const typeBadgeStyle = isInternal 
            ? 'bg-[var(--bs-status-running-light)] text-[var(--bs-status-running)] border-[var(--bs-status-running-border)]' 
            : isExternal 
            ? 'bg-[var(--bs-orange-100)] text-[var(--bs-orange-600)] border-[var(--bs-orange-200)]' 
            : 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border-[var(--bs-border-light)]';

          const extraKeys = Object.keys(point).filter(k => !['name', 'description', 'type'].includes(k));

          return (
            <div key={idx} className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-5 shadow-sm hover:border-[var(--bs-border-light)] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-[var(--bs-text-primary)]">{name}</h3>
                {point.type && (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-widest ${typeBadgeStyle}`}>
                    {point.type}
                  </span>
                )}
              </div>
              
              {desc && <p className="text-sm text-[var(--bs-text-secondary)] mb-4">{desc}</p>}
              
              {extraKeys.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--bs-border-light)]">
                  {extraKeys.map(k => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-1">
                        {k.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-[var(--bs-text-primary)] font-medium">
                        {typeof point[k] === 'object' ? JSON.stringify(point[k]) : String(point[k])}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntegrationPoints;
