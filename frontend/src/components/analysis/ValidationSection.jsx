import React from 'react';
import { ShieldCheck, AlertCircle, Info, FileWarning } from 'lucide-react';

const ValidationSection = ({ validation }) => {
  if (!validation || Object.keys(validation).length === 0 || validation.overall_status === 'UNKNOWN') {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Engineering Validation</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASS': return 'text-green-400 bg-green-900/20 border-green-800/50';
      case 'FAIL': return 'text-red-400 bg-red-900/20 border-red-800/50';
      case 'WARN': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PASS': return 'text-green-400';
      case 'FAIL': return 'text-red-400';
      case 'WARN': return 'text-yellow-400';
      default: return 'text-slate-400';
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
    <div className="mb-10">
      <h2 className="text-xl font-semibold leading-6 text-white mb-6 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-blue-500" />
        Engineering Validation Report
      </h2>

      {/* Overall Score */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className={`md:w-64 shrink-0 rounded-lg border p-6 flex flex-col items-center justify-center text-center ${getStatusColor(validation.overall_status)}`}>
          <span className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">Overall Status</span>
          <span className="text-3xl font-bold tracking-tight mb-2">{validation.overall_status}</span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium opacity-80">Score:</span>
            <span className="font-mono font-bold text-lg">{validation.overall_score}/100</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              <AlertCircle className="h-4 w-4" /> Critical Issues
            </div>
            <div className="text-2xl font-bold text-white mb-1">{validation.critical_issues?.length || 0}</div>
          </div>
          <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              <FileWarning className="h-4 w-4" /> Warnings
            </div>
            <div className="text-2xl font-bold text-white mb-1">{validation.warnings?.length || 0}</div>
          </div>
          <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-2 text-sm uppercase tracking-wide">
              <Info className="h-4 w-4" /> Recommendations
            </div>
            <div className="text-2xl font-bold text-white mb-1">{validation.recommendations?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((c, i) => {
            const data = validation[c.key];
            return (
              <div key={i} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-200">{c.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">Score: {data.score}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                </div>
                {data.findings && data.findings.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 flex-1">
                    {data.findings.map((f, idx) => (
                      <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-600 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-xs text-slate-500 italic mt-2">No findings.</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(validation.critical_issues?.length > 0 || validation.warnings?.length > 0) && (
          <div className="space-y-6">
            {validation.critical_issues?.length > 0 && (
              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Critical Issues
                </h3>
                <ul className="space-y-2">
                  {validation.critical_issues.map((issue, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {validation.warnings?.length > 0 && (
              <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileWarning className="h-4 w-4" /> Warnings
                </h3>
                <ul className="space-y-2">
                  {validation.warnings.map((warn, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span> {warn}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {validation.recommendations?.length > 0 && (
          <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-5 h-fit">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="h-4 w-4" /> Recommendations
            </h3>
            <ul className="space-y-2">
              {validation.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSection;
