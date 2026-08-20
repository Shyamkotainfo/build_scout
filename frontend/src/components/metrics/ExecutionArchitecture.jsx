import React from 'react';
import { ArrowDown, BrainCircuit } from 'lucide-react';

const ExecutionArchitecture = () => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-8 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-6">
        <BrainCircuit className="h-5 w-5 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-200">BuildSmart Execution Architecture</h3>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">User Request</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">Multi-Agent Workflow</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">Research</div>
        <ArrowDown className="h-4 w-4 text-blue-500/50" />
        <div className="bg-blue-900/30 border border-blue-700/50 rounded px-4 py-2 text-xs font-medium text-blue-400 w-48">Unified Tool Gateway</div>
        <ArrowDown className="h-4 w-4 text-blue-500/50" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">MCP / Local Tools</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">Candidate Results</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">LLM Evaluation</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48">Decision</div>
        <ArrowDown className="h-4 w-4 text-slate-600" />
        <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 text-xs font-medium text-slate-300 w-48 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Blueprint</div>
      </div>
    </div>
  );
};

export default ExecutionArchitecture;
