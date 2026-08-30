import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Loader2, AlertCircle, ArrowLeft, Layers, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Wrench, FileText } from 'lucide-react';

const STAGES = [
  { id: 'PROMPT', label: 'PROMPT', defaultAgent: 'PromptOptimizer' },
  { id: 'DISCOVER', label: 'DISCOVER', defaultAgent: 'ResearchAgent' },
  { id: 'EVALUATE', label: 'EVALUATE', defaultAgent: 'EvaluationAgent' },
  { id: 'DECIDE', label: 'DECIDE', defaultAgent: 'DecisionAgent' },
  { id: 'ARCHITECT', label: 'ARCHITECT', defaultAgent: 'BlueprintAgent' },
  { id: 'VALIDATE', label: 'VALIDATE', defaultAgent: 'ValidationAgent' }
];

const AGENT_DESCRIPTIONS = {
  'PromptOptimizer': 'Analyzed and optimized the raw request into a structured architecture problem.',
  'supervisor': 'Coordinated the execution of specialized agents across the workflow.',
  'decomposition': 'Decomposed the requirements into specific architectural components.',
  'ResearchAgent': 'Discovered existing solutions for the identified architecture components and collected supporting evidence.',
  'EvaluationAgent': 'Compared shortlisted candidates using relevance, maturity, security, and licensing evidence.',
  'DecisionAgent': 'Selected REUSE, ADAPT, or BUILD based on candidate evaluation results.',
  'BlueprintAgent': 'Combined the decisions into a coherent target architecture.',
  'ValidationAgent': 'Checked whether the proposed architecture satisfies the original requirements.'
};

const getAgentDescription = (agentName) => {
  if (AGENT_DESCRIPTIONS[agentName]) return AGENT_DESCRIPTIONS[agentName];
  if (agentName.toLowerCase().includes('research')) return AGENT_DESCRIPTIONS['ResearchAgent'];
  if (agentName.toLowerCase().includes('eval')) return AGENT_DESCRIPTIONS['EvaluationAgent'];
  if (agentName.toLowerCase().includes('decis')) return AGENT_DESCRIPTIONS['DecisionAgent'];
  if (agentName.toLowerCase().includes('bluep') || agentName.toLowerCase().includes('arch')) return AGENT_DESCRIPTIONS['BlueprintAgent'];
  if (agentName.toLowerCase().includes('valid')) return AGENT_DESCRIPTIONS['ValidationAgent'];
  return 'Executed specialized tasks for this workflow stage.';
};

const mapAgentsToStages = (traces, agentHistory) => {
  const result = STAGES.map(stage => ({
    ...stage,
    agent: null,
    status: 'PENDING',
    trace: null
  }));

  const allAgents = [...new Set([...(agentHistory || []), ...(traces || []).map(t => t.agent_name)])];
  
  // Mapping logic
  allAgents.forEach(agentName => {
    let stageId = null;
    if (agentName === 'PromptOptimizer') stageId = 'PROMPT';
    else if (agentName.includes('Research') || agentName.includes('decomposition')) stageId = 'DISCOVER';
    else if (agentName.includes('Evaluation')) stageId = 'EVALUATE';
    else if (agentName.includes('Decision')) stageId = 'DECIDE';
    else if (agentName.includes('Blueprint')) stageId = 'ARCHITECT';
    else if (agentName.includes('Validation')) stageId = 'VALIDATE';
    
    if (stageId) {
      const stage = result.find(s => s.id === stageId);
      const trace = traces?.find(t => t.agent_name === agentName);
      if (stage && (!stage.agent || (trace && !stage.trace))) {
        stage.agent = agentName;
        stage.status = trace?.status || 'COMPLETED';
        stage.trace = trace;
      }
    }
  });

  // Fallback for visual continuity if missing from trace
  result.forEach(stage => {
    if (!stage.agent) {
      stage.agent = stage.defaultAgent;
      stage.status = 'PENDING';
    }
  });

  return result;
};

const StatusIcon = ({ status, className = "h-5 w-5" }) => {
  if (status === 'COMPLETED' || status === 'SUCCESS') return <CheckCircle2 className={`${className} text-green-500`} />;
  if (status === 'FAILED') return <AlertTriangle className={`${className} text-red-500`} />;
  if (status === 'RUNNING') return <Loader2 className={`${className} text-blue-500 animate-spin`} />;
  return <Clock className={`${className} text-gray-400`} />;
};

const ToolUsageTable = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) {
    return <p className="text-sm text-[var(--bs-text-secondary)] italic">No tools used by this agent.</p>;
  }

  return (
    <div className="overflow-x-auto border border-[var(--bs-border-light)] rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-[var(--bs-bg-tertiary)] border-b border-[var(--bs-border-light)] text-[var(--bs-text-secondary)] text-xs uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Tool</th>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--bs-border-light)]">
          {toolCalls.map((tc, idx) => {
            const isMcp = tc.provider === 'MCP' || (tc.tool_name && (tc.tool_name.includes('github') || tc.tool_name.includes('tavily')));
            const provider = tc.provider || (isMcp ? 'MCP' : 'LOCAL');
            return (
              <tr key={idx} className="bg-[var(--bs-bg-primary)] hover:bg-[var(--bs-bg-hover)]">
                <td className="px-4 py-3 font-medium text-[var(--bs-text-primary)]">{tc.tool_name || 'Unknown Tool'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide ${isMcp ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                    {provider}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 ${tc.status === 'ERROR' ? 'text-red-400' : 'text-green-400'}`}>
                    {tc.status === 'ERROR' ? 'Failed' : 'Success'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--bs-text-secondary)] font-mono text-xs">
                  {tc.latency_ms ? `${(tc.latency_ms / 1000).toFixed(1)}s` : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const AgentCard = ({ stage }) => {
  const [expanded, setExpanded] = useState(false);
  const { agent, status, trace } = stage;
  const description = getAgentDescription(agent);
  
  // Derived stats from trace
  const toolCalls = trace?.tool_calls || [];
  const llmCallsCount = trace?.llm_calls_count !== undefined ? trace.llm_calls_count : "N/A";
  const tokens = trace?.total_tokens !== undefined ? trace.total_tokens.toLocaleString() : "N/A";
  
  const hasError = status === 'FAILED';
  const duration = trace?.duration_ms ? `${(trace.duration_ms / 1000).toFixed(1)}s` : "N/A";

  return (
    <div className={`mb-4 border rounded-xl overflow-hidden transition-colors ${hasError ? 'border-red-500/50 bg-red-500/5' : 'border-[var(--bs-border-medium)] bg-[var(--bs-bg-secondary)]'}`}>
      {/* Card Header (Collapsed) */}
      <div 
        data-testid={`expand-${agent}`}
        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[var(--bs-bg-hover)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <StatusIcon status={status} className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--bs-text-primary)]">{agent}</h3>
            <p className="text-sm text-[var(--bs-text-secondary)] mt-1">{description}</p>
            {hasError && <p className="text-sm text-red-400 font-medium mt-2">Agent failed to complete.</p>}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 md:gap-8 min-w-max">
          <div className="text-center">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Duration</p>
            <p className="text-sm font-mono text-[var(--bs-text-primary)]">{duration}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">LLM Calls</p>
            <p className="text-sm font-mono text-[var(--bs-text-primary)]">{llmCallsCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Tool Calls</p>
            <p className="text-sm font-mono text-[var(--bs-text-primary)]">{toolCalls.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Tokens</p>
            <p className="text-sm font-mono text-[var(--bs-text-primary)]">{tokens}</p>
          </div>
          
          <div className="pl-4 border-l border-[var(--bs-border-light)] flex items-center text-[var(--bs-orange-500)]">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 border-t border-[var(--bs-border-light)] bg-[var(--bs-bg-primary)]">
          <div className="grid grid-cols-1 gap-8">
            {hasError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Error Reason
                </h4>
                <p className="text-sm text-red-300 font-mono">
                  {trace?.error_message || "The agent encountered a critical error during execution. Refer to technical details below."}
                </p>
              </div>
            )}
            
            <div>
              <h4 className="text-sm font-bold text-[var(--bs-text-primary)] mb-4 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-[var(--bs-orange-500)]" /> Execution Metrics & Tools
              </h4>
              <div className="grid grid-cols-3 gap-4 mb-6 bg-[var(--bs-bg-tertiary)] p-4 rounded-lg border border-[var(--bs-border-light)]">
                <div>
                  <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Input Tokens</p>
                  <p className="text-sm font-mono text-[var(--bs-text-primary)]">{trace?.input_tokens !== undefined ? trace.input_tokens.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Output Tokens</p>
                  <p className="text-sm font-mono text-[var(--bs-text-primary)]">{trace?.output_tokens !== undefined ? trace.output_tokens.toLocaleString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Retries</p>
                  <p className="text-sm font-mono text-[var(--bs-text-primary)]">{trace?.retry_count !== undefined ? trace.retry_count : 'N/A'}</p>
                </div>
              </div>
              <ToolUsageTable toolCalls={toolCalls} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[var(--bs-text-primary)] mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--bs-text-secondary)]" /> Technical Details
              </h4>
              <div className="bg-[var(--bs-bg-tertiary)] border border-[var(--bs-border-light)] rounded-lg p-4">
                <details className="text-sm text-[var(--bs-text-secondary)]">
                  <summary className="cursor-pointer font-medium hover:text-[var(--bs-text-primary)] select-none">View Raw Trace Payload</summary>
                  <pre className="mt-4 p-4 bg-black/50 rounded overflow-x-auto font-mono text-xs text-gray-400 whitespace-pre-wrap">
                    {trace ? JSON.stringify(trace, null, 2) : 'No trace data available for this agent.'}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AgentTraceExplorer = () => {
  const { analysisId } = useParams();
  const { currentAnalysis, loadSpecificAnalysis, isRefreshing } = useData();
  const [analysis, setAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const initAnalysis = async () => {
      if (currentAnalysis && (currentAnalysis.analysis_id === analysisId || currentAnalysis.id === analysisId || !analysisId)) {
        setAnalysis(currentAnalysis);
        return;
      }
      if (analysisId) {
        setLocalLoading(true);
        const data = await loadSpecificAnalysis(analysisId);
        setAnalysis(data);
        setLocalLoading(false);
      } else {
        setAnalysis(null);
      }
    };
    initAnalysis();
  }, [analysisId, currentAnalysis, loadSpecificAnalysis]);

  const isLoading = isRefreshing || localLoading;

  if (isLoading && !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--bs-text-secondary)] py-24">
        <Loader2 className="h-10 w-10 text-[var(--bs-orange-500)] animate-spin mb-4" />
        <p className="text-sm font-medium">Loading agent traces...</p>
      </div>
    );
  }

  if (!analysis && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-12 text-center">
        <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-medium)] p-8 rounded-lg">
          <AlertCircle className="h-12 w-12 text-[var(--bs-text-tertiary)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Analysis Selected</h2>
          <p className="text-sm text-[var(--bs-text-secondary)]">Please select an analysis to view its execution trace.</p>
        </div>
      </div>
    );
  }

  const traces = analysis?.traces || [];
  const history = analysis?.agent_history || [];
  const metrics = analysis?.llm_metrics || {};
  
  const mappedStages = mapAgentsToStages(traces, history);
  const displayId = analysis?.analysis_id || analysis?.id || analysisId;

  // Final summary stats
  const totalLLM = metrics.total_calls || "N/A";
  const totalTokens = metrics.total_tokens ? metrics.total_tokens.toLocaleString() : "N/A";
  const mcpCalls = traces.flatMap(t => t.tool_calls || []).filter(tc => tc.provider === 'MCP' || (tc.tool_name && (tc.tool_name.includes('github') || tc.tool_name.includes('tavily')))).length;
  const totalTools = traces.flatMap(t => t.tool_calls || []).length;
  const execTime = metrics.total_latency_ms ? `${(metrics.total_latency_ms / 1000).toFixed(1)}s` : "N/A";
  const createdAt = analysis?.created_at ? new Date(analysis.created_at).toLocaleString() : 'N/A';

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 py-8">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6">
        <div className="flex flex-col gap-2 mb-6">
          {displayId && (
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-[var(--bs-text-secondary)]">
              <Link to={`/analyses/${displayId}`} className="hover:text-[var(--bs-text-primary)] flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Analysis Result
              </Link>
              <span className="text-[var(--bs-border-medium)]">|</span>
              <Link to={`/architecture/${displayId}`} className="hover:text-[var(--bs-text-primary)] transition-colors">
                View Architecture
              </Link>
              <span className="text-[var(--bs-border-medium)]">|</span>
              <Link to={`/metrics/${displayId}`} className="hover:text-[var(--bs-text-primary)] transition-colors">
                View LLM Metrics
              </Link>
            </div>
          )}
          <h1 className="text-3xl font-bold text-[var(--bs-text-primary)] tracking-tight mb-2">Agent Execution Trace</h1>
          <p className="text-base text-[var(--bs-text-secondary)] max-w-2xl">
            See how BuildScout researched, evaluated, decided, designed, and validated the solution.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 md:gap-6 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] p-4 rounded-xl shadow-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--bs-text-tertiary)] mb-1">Status</p>
            <div className="flex items-center gap-1.5 font-medium text-[var(--bs-text-primary)] text-sm">
              <StatusIcon status={analysis.status} className="h-4 w-4" />
              {analysis.status || 'UNKNOWN'}
            </div>
          </div>
          <div className="pl-4 md:pl-6 border-l border-[var(--bs-border-light)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--bs-text-tertiary)] mb-1">Date</p>
            <p className="font-mono text-sm text-[var(--bs-text-primary)]">{createdAt}</p>
          </div>
          <div className="pl-4 md:pl-6 border-l border-[var(--bs-border-light)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--bs-text-tertiary)] mb-1">Execution Time</p>
            <p className="font-mono text-sm text-[var(--bs-text-primary)]">{execTime}</p>
          </div>
          <div className="pl-4 md:pl-6 border-l border-[var(--bs-border-light)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--bs-text-tertiary)] mb-1">Agents</p>
            <p className="font-mono text-sm text-[var(--bs-text-primary)]">{history.length}</p>
          </div>
        </div>
      </div>

      {/* 2. AGENT PIPELINE */}
      <div className="mb-16 bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-8 shadow-sm">
        <h2 className="text-xs font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-8 text-center">Execution Pipeline</h2>
        <div className="relative max-w-5xl mx-auto">
          {/* Connector Line */}
          <div className="absolute top-6 left-[8%] right-[8%] h-0.5 bg-[var(--bs-border-light)] hidden md:block"></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2 relative z-10">
            {mappedStages.map((stage, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className={`h-12 w-12 rounded-full border-4 flex items-center justify-center shadow-md mb-4 bg-[var(--bs-bg-primary)] transition-colors ${
                  stage.status === 'COMPLETED' || stage.status === 'SUCCESS' ? 'border-[var(--bs-status-success)] text-[var(--bs-status-success)]' :
                  stage.status === 'FAILED' ? 'border-red-500 text-red-500 bg-red-500/10' :
                  stage.status === 'RUNNING' ? 'border-blue-500 text-blue-500 bg-blue-500/10' :
                  'border-[var(--bs-border-medium)] text-[var(--bs-text-tertiary)]'
                }`}>
                  <StatusIcon status={stage.status} className="h-5 w-5 bg-transparent" />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${stage.status !== 'PENDING' ? 'text-[var(--bs-text-primary)]' : 'text-[var(--bs-text-tertiary)]'}`}>
                    {stage.label}
                  </p>
                  <p className={`text-[10px] font-mono truncate max-w-[120px] mx-auto px-2 ${stage.status !== 'PENDING' ? 'text-[var(--bs-text-secondary)]' : 'text-[var(--bs-text-tertiary)] opacity-50'}`} title={stage.agent}>
                    {stage.agent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. AGENT CARDS */}
      <div className="mb-16">
        <h2 className="text-sm font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-6">Agent Details</h2>
        {mappedStages.filter(s => s.status !== 'PENDING').map((stage, idx) => (
          <AgentCard key={idx} stage={stage} />
        ))}
        {mappedStages.filter(s => s.status !== 'PENDING').length === 0 && (
          <div className="text-center py-16 border border-[var(--bs-border-light)] border-dashed rounded-xl bg-[var(--bs-bg-secondary)]">
            <p className="text-[var(--bs-text-secondary)]">No agent execution traces found in this analysis.</p>
          </div>
        )}
      </div>

      {/* 7. FINAL EXECUTION SUMMARY */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-[var(--bs-text-tertiary)] uppercase tracking-widest mb-6">Execution Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Agents Completed</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">
              {mappedStages.filter(s => s.status === 'COMPLETED').length} <span className="text-lg text-[var(--bs-text-tertiary)]">/ {mappedStages.length}</span>
            </p>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Total Time</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">{execTime}</p>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">LLM Calls</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">{totalLLM}</p>
          </div>
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-purple-400/80 uppercase tracking-wider mb-2 font-bold">MCP Calls</p>
            <p className="text-3xl font-bold font-mono text-purple-400">{mcpCalls}</p>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Tool Calls</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">{totalTools}</p>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Total Tokens</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">{totalTokens}</p>
          </div>
          <div className="bg-[var(--bs-bg-secondary)] border border-[var(--bs-border-light)] rounded-xl p-5 text-center shadow-sm">
            <p className="text-[10px] text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-2">Cache Hits</p>
            <p className="text-3xl font-bold font-mono text-[var(--bs-text-primary)]">N/A</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AgentTraceExplorer;
