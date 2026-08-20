import React from 'react';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

const STEPS = [
  'Supervisor',
  'Decomposition',
  'Research',
  'Evaluation',
  'Decision',
  'Blueprint',
  'Validation'
];

const AgentWorkflowVisualizer = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Agent Workflow</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No agent trace available.</p>
        </div>
      </div>
    );
  }

  // Derive active steps from agent_history if available
  const history = analysis.agent_history || [];
  const status = analysis.status;

  // For visualization, we'll map the history to steps.
  // In a real LangGraph, we'd look for specific node names.
  const completedNodes = new Set(history.map((h) => h.node));
  const hasFailed = status === 'FAILED';
  
  // Basic heuristic for the visualizer state based on history
  const getStepState = (stepName) => {
    // Exact match or lowercase match
    const isCompleted = Array.from(completedNodes).some(n => n.toLowerCase().includes(stepName.toLowerCase()));
    if (isCompleted) return 'completed';
    if (hasFailed) return 'pending'; // or failed if it was the last one, but we keep it simple
    // If status is running and this is the first uncompleted, it's running
    if (status !== 'COMPLETED' && status !== 'FAILED') {
      // Find index of this step
      const stepIndex = STEPS.indexOf(stepName);
      // Check if previous step is completed
      const prevStepCompleted = stepIndex === 0 || Array.from(completedNodes).some(n => n.toLowerCase().includes(STEPS[stepIndex - 1].toLowerCase()));
      if (prevStepCompleted && !isCompleted) return 'running';
    }
    return 'pending';
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Agent Workflow</h2>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <nav aria-label="Progress">
          <ol role="list" className="overflow-hidden flex flex-wrap gap-4 items-center justify-between">
            {STEPS.map((step, stepIdx) => {
              const state = getStepState(step);
              return (
                <li key={step} className="relative flex-1 flex flex-col items-center">
                  <div className="group flex flex-col items-center">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700">
                      {state === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : state === 'running' ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600" />
                      )}
                    </span>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        state === 'completed'
                          ? 'text-slate-300'
                          : state === 'running'
                          ? 'text-blue-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {stepIdx !== STEPS.length - 1 && (
                    <div className="absolute top-5 left-1/2 w-full h-0.5 bg-slate-700 -z-10 mt-[1px]" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default AgentWorkflowVisualizer;
