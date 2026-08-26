import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Brain, Zap, Wrench, Network, Archive, Settings2, BarChart2, Layers } from 'lucide-react';

const V2FeatureCard = ({ icon: Icon, title, description, status }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-slate-600 transition-colors">
    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
    
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className="p-3 bg-slate-800 rounded-lg text-blue-400">
        <Icon size={24} />
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
        status === 'PLANNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
        'bg-slate-800 text-slate-400 border-slate-700'
      }`}>
        {status} — V2
      </div>
    </div>
    
    <h3 className="text-lg font-bold text-white mb-2 relative z-10">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed relative z-10">
      {description}
    </p>
  </div>
);

const V2Specification = () => {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/docs" className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">V2 Specification</h1>
              <p className="text-sm text-slate-400">Planned features and architectural enhancements.</p>
            </div>
          </div>
          <Link to="/roadmap" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
            View Product Roadmap
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12">
        {/* V1 vs V2 Summary Table */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="text-blue-400" size={24} />
            Architecture Evolution
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Current V1</h3>
              <ul className="space-y-3">
                {['Multi-Agent Architecture', 'Research & Evaluation', 'Decision & Blueprinting', 'MCP Integration & Local Fallback', 'LLM Retry & Observability', 'Developer Dashboard'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-6">
              <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4 border-b border-blue-900/50 pb-2">Planned V2</h3>
              <ul className="space-y-3">
                {['Human Feedback Loop', 'Memory / Context Retrieval', 'Prompt Optimizer', 'Expanded Skills Framework', 'Internal Solution Catalog', 'Advanced Evaluation Metrics'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <V2FeatureCard 
            icon={MessageSquare}
            title="Human Feedback Loop"
            status="PLANNED"
            description="Allow users to provide direct feedback on candidates, evaluations, and decisions (e.g., 'Correct', 'Wrong Reasoning'). This feedback will feed back into the system to improve future evaluation and recommendation quality."
          />
          <V2FeatureCard 
            icon={Brain}
            title="Memory & Context Retrieval"
            status="PLANNED"
            description="BuildSmart will remember past analyses, previously selected solutions, and organizational technology preferences. Current requests will be cross-referenced with this persistent memory before initiating new research."
          />
          <V2FeatureCard 
            icon={Zap}
            title="Prompt Optimizer"
            status="PLANNED"
            description="A lightweight pipeline that analyzes incoming requests, detects ambiguity, normalizes requirements, and structures context *before* passing the optimized prompt to the main agent workflow."
          />
          <V2FeatureCard 
            icon={Wrench}
            title="Expanded Skills"
            status="PARTIAL"
            description="Refactoring existing agent tasks into distinct, reusable capability modules (Skills) that can be dynamically loaded across different agents (e.g., dedicated License Compliance, Security Assessment)."
          />
          <V2FeatureCard 
            icon={Archive}
            title="Internal Solution Catalog"
            status="PLANNED"
            description="Allow BuildSmart to discover and evaluate internal repositories, templates, and POCs, making it useful beyond public open-source discovery for enterprise teams."
          />
          <V2FeatureCard 
            icon={Network}
            title="Additional MCP Integrations"
            status="PLANNED"
            description="Integrating more external Model Context Protocol providers including Cloud architecture documentation, package ecosystem registries, database schemas, and observability platforms."
          />
          <V2FeatureCard 
            icon={BarChart2}
            title="Advanced Evaluation"
            status="PLANNED"
            description="Incorporating deeper evaluation signals such as technical compatibility, community activity, maintenance maturity, cost projections, and performance benchmarks."
          />
          <V2FeatureCard 
            icon={Settings2}
            title="Continuous Improvement"
            status="PLANNED"
            description="An end-to-end learning loop where human feedback, decision outcomes, and subsequent blueprint success directly trigger automated prompt and skill improvements."
          />
        </div>

      </div>
    </div>
  );
};

export default V2Specification;
