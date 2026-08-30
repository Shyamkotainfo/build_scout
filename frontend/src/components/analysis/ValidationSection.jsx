import React from 'react';
import { ShieldCheck, AlertCircle, Info, FileWarning, CheckCircle2 } from 'lucide-react';

const ValidationSection = ({ analysis }) => {
  const validation = analysis?.validation_result;
  
  if (!validation) {
    return (
      <div className="flex flex-col mb-12">
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-12 text-center shadow-sm">
          <span className="text-sm font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)] block mb-4">Overall Score</span>
          <span className="text-5xl font-bold tracking-tight text-[var(--bs-text-tertiary)] block mb-2">N/A</span>
          <span className="inline-block mt-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--bs-border-light)] text-[var(--bs-text-tertiary)] bg-[var(--bs-bg-primary)]">
            NOT AVAILABLE
          </span>
          <p className="mt-8 text-sm text-[var(--bs-text-secondary)] italic">
            Validation results are not available for this analysis.
          </p>
        </div>
      </div>
    );
  }

  // 1. Overall Status Parsing
  const rawStatus = validation.overall_status?.toUpperCase() || 'UNKNOWN';
  let displayStatus = 'NOT AVAILABLE';
  let styleClass = 'text-[var(--bs-text-tertiary)] border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]';
  let message = 'Validation results are not available for this analysis.';

  if (rawStatus === 'PASS') {
    displayStatus = 'PASS';
    styleClass = 'text-[var(--bs-status-success)] border-[var(--bs-status-success)] bg-[var(--bs-status-success)]/10';
    message = 'BuildScout found the proposed architecture consistent with the analyzed requirements.';
  } else if (rawStatus === 'WARN' || rawStatus === 'WARNING') {
    displayStatus = 'WARNING';
    styleClass = 'text-[var(--bs-status-warning)] border-[var(--bs-status-warning)] bg-[var(--bs-status-warning)]/10';
    message = 'BuildScout identified areas that should be reviewed before implementation.';
  } else if (rawStatus === 'FAIL') {
    displayStatus = 'FAIL';
    styleClass = 'text-[var(--bs-status-critical)] border-[var(--bs-status-critical)] bg-[var(--bs-status-critical)]/10';
    message = 'BuildScout identified significant issues that should be resolved before implementation.';
  }

  const scoreDisplay = validation.overall_score != null ? `${validation.overall_score} / 100` : 'N/A';
  const reasoning = validation.validation_reasoning || validation.reasoning || validation.explanation;

  // Validation Checks Data
  const categories = [
    { key: 'requirement_coverage', label: 'Requirements Coverage' },
    { key: 'component_coverage', label: 'Component Coverage' },
    { key: 'decision_consistency', label: 'Decision Alignment' },
    { key: 'architecture_consistency', label: 'Architecture Consistency' },
    { key: 'data_flow_consistency', label: 'Data Flow' },
    { key: 'integration_consistency', label: 'Integration Points' },
    { key: 'implementation_completeness', label: 'Implementation Plan' },
    { key: 'risk_completeness', label: 'Risk Assessment' },
  ].filter(c => validation[c.key]);

  return (
    <div className="flex flex-col mb-12">
      
      {/* 3. OVERALL VALIDATION RESULT */}
      <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-lg p-12 text-center shadow-sm mb-12 relative overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--bs-text-tertiary)] block mb-4">Overall Validation Score</span>
        <span className="text-6xl font-bold tracking-tight text-[var(--bs-text-primary)] block mb-6">{scoreDisplay}</span>
        
        <span className={`inline-flex items-center gap-2 mt-2 text-sm font-bold uppercase tracking-widest px-6 py-2 rounded-full border-2 ${styleClass}`}>
          {displayStatus === 'PASS' && <CheckCircle2 className="h-5 w-5" />}
          {displayStatus === 'WARNING' && <FileWarning className="h-5 w-5" />}
          {displayStatus === 'FAIL' && <AlertCircle className="h-5 w-5" />}
          {displayStatus}
        </span>
        
        {/* 8. WHAT THE RESULT MEANS */}
        <p className="mt-8 text-base text-[var(--bs-text-secondary)] max-w-2xl mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* 4. SCORE EXPLANATION */}
        <div>
          <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
            Why this score?
          </h2>
          <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm min-h-[160px]">
            {reasoning ? (
              <p className="text-sm text-[var(--bs-text-primary)] leading-relaxed whitespace-pre-wrap">
                {reasoning}
              </p>
            ) : (
              <p className="text-sm text-[var(--bs-text-secondary)] italic">
                Validation reasoning is not available for this analysis.
              </p>
            )}
          </div>
        </div>

        {/* 5. VALIDATION CHECKS */}
        <div>
          <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
            Validation Checks
          </h2>
          <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm min-h-[160px]">
            {categories.length > 0 ? (
              <ul className="space-y-4">
                {categories.map((c, i) => {
                  const status = validation[c.key]?.status?.toUpperCase();
                  const isPass = status === 'PASS';
                  const isWarn = status === 'WARN' || status === 'WARNING';
                  const isFail = status === 'FAIL';
                  
                  return (
                    <li key={i} className="flex justify-between items-center border-b border-[var(--bs-border-light)] pb-4 last:border-0 last:pb-0">
                      <span className="text-sm font-bold text-[var(--bs-text-primary)]">{c.label}</span>
                      <div className="flex items-center gap-2">
                        {isPass && <><CheckCircle2 className="h-4 w-4 text-[var(--bs-status-success)]" /><span className="text-xs font-bold text-[var(--bs-status-success)] uppercase tracking-wider">Passed</span></>}
                        {isWarn && <><FileWarning className="h-4 w-4 text-[var(--bs-status-warning)]" /><span className="text-xs font-bold text-[var(--bs-status-warning)] uppercase tracking-wider">Review</span></>}
                        {isFail && <><AlertCircle className="h-4 w-4 text-[var(--bs-status-critical)]" /><span className="text-xs font-bold text-[var(--bs-status-critical)] uppercase tracking-wider">Failed</span></>}
                        {!isPass && !isWarn && !isFail && <span className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-wider">{status || 'N/A'}</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-[var(--bs-text-secondary)] italic">
                Individual validation checks are not available.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* 6. REQUIREMENTS COVERAGE */}
        <div>
          <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
            Requirements Coverage
          </h2>
          <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm h-full">
            {analysis.requirements && analysis.requirements.length > 0 ? (
              <>
                <p className="text-sm font-bold text-[var(--bs-text-primary)] mb-4 pb-4 border-b border-[var(--bs-border-light)]">
                  {analysis.requirements.length} / {analysis.requirements.length} requirements addressed
                </p>
                <ul className="space-y-3">
                  {analysis.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-[var(--bs-status-success)] mt-0.5 shrink-0" />
                      <span className="text-sm text-[var(--bs-text-secondary)] leading-relaxed">{req.description || req.name || 'Requirement'}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[var(--bs-text-secondary)] italic">
                Requirement-level validation details are not available.
              </p>
            )}
          </div>
        </div>

        {/* 7. WARNINGS / RISKS */}
        <div>
          <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4">
            Review Before Implementation
          </h2>
          <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm h-full">
            {(validation.warnings?.length > 0 || validation.critical_issues?.length > 0) ? (
              <div className="space-y-4">
                {validation.critical_issues?.map((issue, i) => (
                  <div key={`c-${i}`} className="p-4 bg-[var(--bs-status-critical)]/10 border border-[var(--bs-status-critical)]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-[var(--bs-status-critical)]">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Critical Issue</span>
                    </div>
                    <p className="text-sm text-[var(--bs-text-primary)]">{issue}</p>
                  </div>
                ))}
                {validation.warnings?.map((warning, i) => (
                  <div key={`w-${i}`} className="p-4 bg-[var(--bs-status-warning)]/10 border border-[var(--bs-status-warning)]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-[var(--bs-status-warning)]">
                      <FileWarning className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Warning</span>
                    </div>
                    <p className="text-sm text-[var(--bs-text-primary)]">{warning}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle2 className="h-5 w-5 text-[var(--bs-status-success)]" />
                <span className="text-sm text-[var(--bs-text-secondary)] font-medium">No validation warnings identified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 9. TRUST & TRACEABILITY */}
      <div>
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" /> Validation Evidence
        </h2>
        <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[var(--bs-border-light)]">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--bs-text-primary)] mb-1">{analysis.requirements?.length || 'N/A'}</span>
              <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Requirements Evaluated</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--bs-text-primary)] mb-1">{analysis.candidates?.length || 'N/A'}</span>
              <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Candidates Considered</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--bs-text-primary)] mb-1">{analysis.blueprint?.components?.length || 'N/A'}</span>
              <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Architecture Components</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[var(--bs-blue-500)] mb-1">{analysis.decisions?.length || 'N/A'}</span>
              <span className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest">Decisions Validated</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ValidationSection;
