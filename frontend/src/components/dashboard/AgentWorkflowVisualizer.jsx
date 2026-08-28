import React from 'react';
import Card from '../ui/Card';
import SectionHeader from '../ui/SectionHeader';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

const AgentWorkflowVisualizer = ({ analysis }) => {
  if (!analysis) return null;

  const PIPELINE_STAGES = [
    { id: 'prompt',      stageLabel: 'Prompt',     agentLabel: 'Prompt Optimizer', match: 'optimizer' },
    { id: 'understand',  stageLabel: 'Understand', agentLabel: 'Decomposition',    match: 'decomposition' },
    { id: 'discover',    stageLabel: 'Discover',   agentLabel: 'Research',         match: 'research' },
    { id: 'evaluate',    stageLabel: 'Evaluate',   agentLabel: 'Evaluation',       match: 'evaluation' },
    { id: 'decide',      stageLabel: 'Decide',     agentLabel: 'Decision',         match: 'decision' },
    { id: 'architect',   stageLabel: 'Architect',  agentLabel: 'Blueprint',        match: 'blueprint' },
    { id: 'validate',    stageLabel: 'Validate',   agentLabel: 'Validation',       match: 'validation' },
  ];

  const agentHistory = analysis.agent_history || [];
  const historyString = agentHistory.join(' ').toLowerCase();
  
  // Also check traces if available
  const traces = analysis.traces || [];
  const tracesString = traces.map(t => t.agent_name || t.node).join(' ').toLowerCase();

  const combinedString = historyString + ' ' + tracesString;

  const analysisStatus = (analysis.status || '').toLowerCase();
  const isFailed = analysisStatus === 'failed';
  const isRunning = analysisStatus === 'running' || analysisStatus === 'in_progress';

  return (
    <Card className="mb-6 overflow-hidden">
      <SectionHeader 
        title="Agent Workflow" 
        subtitle="Multi-stage execution pipeline" 
      />
      <div className="mt-4 px-2 overflow-x-auto pb-4">
        <div className="flex items-start min-w-[700px]">
          {PIPELINE_STAGES.map((stage, idx) => {
            // Determine state for each stage based on execution data
            let state = 'pending';
            
            // If the stage is in the history/traces, it executed.
            const executed = combinedString.includes(stage.match);
            
            if (executed) {
              state = 'completed';
            } else if (analysisStatus === 'completed') {
              // If the analysis is fully completed, implicitly we passed everything
              state = 'completed';
            } else if (isFailed) {
              // If we failed and haven't executed this, it's failed or skipped
              state = 'failed';
            } else if (isRunning && idx === 0) {
              // Rough guess: first pending stage is running
              state = 'running';
            }

            const isLast = idx === PIPELINE_STAGES.length - 1;

            return (
              <div key={stage.id} className="relative flex-1 group">
                {/* Connecting Line */}
                {!isLast && (
                  <div 
                    className={`absolute top-3 left-6 right-0 h-0.5 -z-10 transition-colors ${
                      state === 'completed' ? 'bg-[var(--bs-status-success)]' : 'bg-[var(--bs-border-light)]'
                    }`} 
                    aria-hidden="true" 
                  />
                )}
                
                {/* Node */}
                <div className="flex flex-col items-center text-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-[var(--bs-bg-primary)]
                    ${state === 'completed' ? 'text-[var(--bs-status-success)]' : 
                      state === 'running' ? 'text-[var(--bs-orange-500)]' : 
                      state === 'failed' ? 'text-[var(--bs-status-critical)]' : 
                      'text-[var(--bs-border-medium)]'}`}
                  >
                    {state === 'completed' ? <CheckCircle2 className="w-5 h-5 bg-[var(--bs-bg-primary)] rounded-full" /> :
                     state === 'running' ? <Loader2 className="w-5 h-5 animate-spin" /> :
                     state === 'failed' ? <XCircle className="w-5 h-5 bg-[var(--bs-bg-primary)] rounded-full" /> :
                     <Circle className="w-5 h-5" />}
                  </div>
                  
                  <span className={`mt-3 text-xs font-bold tracking-widest uppercase ${
                    state === 'completed' ? 'text-[var(--bs-text-primary)]' : 
                    state === 'running' ? 'text-[var(--bs-orange-600)]' : 
                    state === 'failed' ? 'text-[var(--bs-status-critical)]' :
                    'text-[var(--bs-text-muted)]'
                  }`}>
                    {stage.stageLabel}
                  </span>
                  
                  <span className="mt-1 text-[10px] text-[var(--bs-text-tertiary)] font-semibold">
                    {stage.agentLabel}
                  </span>
                  
                  <span className="mt-2 text-[10px] flex items-center justify-center gap-1">
                    {state === 'completed' && <><span className="w-1.5 h-1.5 rounded-full bg-[var(--bs-status-success)]"></span> Completed</>}
                    {state === 'running' && <><span className="w-1.5 h-1.5 rounded-full bg-[var(--bs-orange-500)]"></span> Running</>}
                    {state === 'failed' && <><span className="w-1.5 h-1.5 rounded-full bg-[var(--bs-status-critical)]"></span> Failed</>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default AgentWorkflowVisualizer;
