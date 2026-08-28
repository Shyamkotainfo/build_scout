import React from 'react';
import { ShieldCheck, AlertCircle, Info, FileWarning } from 'lucide-react';

const ValidationSection = ({ validation }) => {
  if (!validation || Object.keys(validation).length === 0 || validation.overall_status === 'UNKNOWN') {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASS': return 'text-[var(--bs-status-success)] bg-green-900/10 border-[var(--bs-status-success)]/30';
      case 'FAIL': return 'text-[var(--bs-status-critical)] bg-red-900/10 border-[var(--bs-status-critical)]/30';
      case 'WARN': return 'text-[var(--bs-status-warning)] bg-yellow-900/10 border-[var(--bs-status-warning)]/30';
      default: return 'text-[var(--bs-text-secondary)] bg-[var(--bs-bg-secondary)] border-[var(--bs-border-light)]';
    }
  };

  const categories = [
    { key: 'requirement_coverage', label: 'Requirement Coverage' },
    { key: 'component_coverage', label: 'Component Coverage' },
    { key: 'decision_consistency', label: 'Decision Consistency' },
    { key: 'architecture_consistency', label: 'Architecture Consistency' },
    { key: 'data_flow_consistency', label: 'Data Flow Consistency' },
    { key: 'integration_consistency', label: 'Integration Consistency' },
    { key: 'implementation_completeness', label: 'Implementation Completeness' },
    { key: 'risk_completeness', label: 'Risk Completeness' },
  ].filter(c => validation[c.key]); // Only show present categories

  return (
    <div className="flex flex-col mb-12">
      <h2 className="text-xl font-bold tracking-tight text-[var(--bs-text-primary)] mb-6 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[var(--bs-status-success)]" />
        VALIDATION TRUST SIGNAL
      </h2>

      {/* Overall Score */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className={`md:w-64 shrink-0 rounded-lg border p-6 flex flex-col items-center justify-center text-center ${getStatusColor(validation.overall_status)}`}>
          <span className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Overall Status</span>
          <span className="text-3xl font-bold tracking-tight mb-2">{validation.overall_status}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-bold opacity-80">Score:</span>
            <span className="font-mono font-bold text-lg">{validation.overall_score}/100</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-5">
            <div className="flex items-center gap-2 text-[var(--bs-status-critical)] font-bold mb-2 text-xs uppercase tracking-widest">
              <AlertCircle className="w-4 h-4" /> Critical Issues
            </div>
            <div className="text-3xl font-bold text-[var(--bs-text-primary)]">{validation.critical_issues?.length || 0}</div>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-5">
            <div className="flex items-center gap-2 text-[var(--bs-status-warning)] font-bold mb-2 text-xs uppercase tracking-widest">
              <FileWarning className="w-4 h-4" /> Warnings
            </div>
            <div className="text-3xl font-bold text-[var(--bs-text-primary)]">{validation.warnings?.length || 0}</div>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-5">
            <div className="flex items-center gap-2 text-[var(--bs-status-success)] font-bold mb-2 text-xs uppercase tracking-widest">
              <Info className="w-4 h-4" /> Recommendations
            </div>
            <div className="text-3xl font-bold text-[var(--bs-text-primary)]">{validation.recommendations?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c, i) => {
            const data = validation[c.key];
            return (
              <div key={i} className="bg-[var(--bs-bg-secondary)] rounded-lg p-4 border border-[var(--bs-border-light)] flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-[var(--bs-text-primary)]">{c.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[var(--bs-text-tertiary)]">Score: {data.score}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                </div>
                {data.findings && data.findings.length > 0 ? (
                  <ul className="mt-2 space-y-2 flex-1">
                    {data.findings.map((f, idx) => (
                      <li key={idx} className="text-xs text-[var(--bs-text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--bs-text-tertiary)] mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-[var(--bs-text-tertiary)] italic mt-2">No findings.</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ValidationSection;
