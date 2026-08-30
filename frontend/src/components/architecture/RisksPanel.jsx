import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const getSeverityStyles = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return {
        wrapper: 'bg-[var(--bs-status-error)]/10 border-[var(--bs-status-error)]',
        icon: <ShieldAlert className="h-5 w-5 text-[var(--bs-status-error)]" />,
        badge: 'bg-[var(--bs-status-error)]/20 text-[var(--bs-status-error)]',
        text: 'text-[var(--bs-status-error)]'
      };
    case 'WARNING':
      return {
        wrapper: 'bg-[var(--bs-status-warning)]/10 border-[var(--bs-status-warning)]',
        icon: <AlertTriangle className="h-5 w-5 text-[var(--bs-status-warning)]" />,
        badge: 'bg-[var(--bs-status-warning)]/20 text-[var(--bs-status-warning)]',
        text: 'text-[var(--bs-status-warning)]'
      };
    default:
      return {
        wrapper: 'bg-[var(--bs-blue-500)]/10 border-[var(--bs-blue-500)]',
        icon: <Info className="h-5 w-5 text-[var(--bs-blue-500)]" />,
        badge: 'bg-[var(--bs-blue-500)]/20 text-[var(--bs-blue-500)]',
        text: 'text-[var(--bs-text-primary)]'
      };
  }
};

const RisksPanel = ({ risks }) => {
  if (!risks || risks.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" /> Architectural Risks
        </h2>
        <div className="rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-8 text-center shadow-sm">
          <p className="text-sm text-[var(--bs-text-secondary)]">No architectural risks recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" /> Architectural Risks
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {risks.map((riskItem, i) => {
          // Flexible rendering: might be a string or an object
          const isObj = typeof riskItem === 'object' && riskItem !== null;
          const riskText = isObj ? (riskItem.risk || riskItem.description) : String(riskItem);
          const severity = isObj ? riskItem.severity : null;
          const mitigation = isObj ? riskItem.mitigation : null;
          const affectedComponent = isObj ? riskItem.affected_component : null;
          const status = isObj ? riskItem.status : null;
          
          const styles = getSeverityStyles(severity);

          return (
            <div key={i} className={`border rounded-lg p-5 flex gap-4 ${styles.wrapper}`}>
              <div className="shrink-0 mt-0.5">
                {styles.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${styles.badge}`}>
                    {severity || 'Severity not specified'}
                  </span>
                  {status && (
                    <span className="text-[10px] font-mono text-[var(--bs-text-secondary)]">
                      {status}
                    </span>
                  )}
                </div>
                <p className={`text-sm font-semibold mb-2 ${styles.text}`}>
                  {riskText}
                </p>
                {affectedComponent && (
                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mr-2">Component:</span>
                    <span className="text-xs text-[var(--bs-text-secondary)]">{affectedComponent}</span>
                  </div>
                )}
                {mitigation && (
                  <div>
                    <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest block mb-1">Mitigation:</span>
                    <p className="text-xs text-[var(--bs-text-secondary)] leading-relaxed">{mitigation}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RisksPanel;
