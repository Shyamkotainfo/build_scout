import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, Zap, Shield, Target, Users, Map } from 'lucide-react';

const CapabilityCard = ({ title, description, why, outcome, dependencies }) => (
  <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-light)] rounded-xl p-6 relative group hover:border-[var(--bs-orange-300)] transition-colors h-full flex flex-col">
    <div className="flex items-start justify-between mb-4">
      <h4 className="text-lg font-bold text-[var(--bs-text-primary)]">{title}</h4>
      <span className="px-2.5 py-1 bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] text-[10px] font-bold tracking-wider rounded border border-[var(--bs-border-medium)]">PLANNED — V2</span>
    </div>
    
    <p className="text-sm text-[var(--bs-text-secondary)] leading-relaxed mb-6">
      {description}
    </p>

    <div className="mt-auto space-y-4 pt-4 border-t border-[var(--bs-border-light)]">
      <div>
        <h5 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Why It Matters</h5>
        <p className="text-xs text-[var(--bs-text-secondary)]">{why}</p>
      </div>
      <div>
        <h5 className="text-[10px] font-bold text-[var(--bs-orange-600)] uppercase tracking-wider mb-1">Expected Outcome</h5>
        <p className="text-xs font-medium text-[var(--bs-orange-800)]">{outcome}</p>
      </div>
      {dependencies && (
        <div>
          <h5 className="text-[10px] font-bold text-[var(--bs-text-tertiary)] uppercase tracking-wider mb-1">Dependencies</h5>
          <p className="text-xs text-[var(--bs-text-secondary)] font-mono">{dependencies}</p>
        </div>
      )}
    </div>
  </div>
);

const ThemeSection = ({ title, icon: Icon, description, children }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-[var(--bs-orange-50)] text-[var(--bs-orange-500)] rounded-xl border border-[var(--bs-orange-100)]">
        <Icon size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--bs-navy-900)] tracking-tight">{title}</h2>
      </div>
    </div>
    <p className="text-[var(--bs-text-secondary)] font-medium max-w-3xl mb-8 ml-[60px]">{description}</p>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ml-0 lg:ml-[60px]">
      {children}
    </div>
  </div>
);

const V2Specification = () => {
  return (
    <div className="min-h-screen bg-[var(--bs-bg-secondary)] -m-6 scroll-smooth">
      {/* Header */}
      <div className="bg-[var(--bs-bg-primary)] border-b border-[var(--bs-border-light)] sticky top-0 z-20 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/roadmap" className="p-2 text-[var(--bs-text-secondary)] hover:text-[var(--bs-text-primary)] hover:bg-[var(--bs-bg-hover)] rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--bs-navy-900)]">V2 Specification</h1>
              <p className="text-sm text-[var(--bs-text-secondary)] mt-0.5 font-medium">Detailed product strategy and capability requirements.</p>
            </div>
          </div>
          <Link to="/roadmap" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white border border-[var(--bs-border-medium)] text-[var(--bs-text-primary)] text-sm font-semibold rounded-lg hover:bg-[var(--bs-bg-hover)] transition-colors">
            <Map size={16} /> Roadmap Overview
          </Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16">
        
        {/* V2 Vision */}
        <div className="bg-[var(--bs-navy-900)] rounded-2xl p-10 mb-20 shadow-lg text-white">
          <h2 className="text-xl font-bold text-[var(--bs-orange-400)] mb-4 tracking-widest uppercase">The V2 Vision</h2>
          <p className="text-2xl font-medium leading-relaxed max-w-4xl">
            "Transition BuildScout from a stateless solution discovery tool into a stateful, learning, collaborative engineering intelligence platform that understands your organization's unique context."
          </p>
        </div>

        <ThemeSection 
          title="Memory & Context" 
          icon={Brain}
          description="Build organizational memory around decisions so every future engineering request becomes faster, smarter, and more contextual."
        >
          <CapabilityCard
            title="Context Retrieval & Memory"
            description="BuildScout remembers previous analyses, architectural decisions, organizational preferences, and approved solutions."
            why="Prevents the AI from recommending solutions that were previously rejected or don't fit the company stack."
            outcome="Recommendations become highly tailored to the specific organization over time."
            dependencies="Vector DB, User/Org Tenancy Model"
          />
          <CapabilityCard
            title="Internal Solution Catalog"
            description="Discover reusable internal repositories, templates, POCs, reference architectures, and approved company components."
            why="Enterprise value isn't just about public open-source. It's about reusing internal assets."
            outcome="Reduces duplicate internal work and promotes inner-sourcing."
            dependencies="Internal Git Integration, Enterprise Auth"
          />
        </ThemeSection>

        <ThemeSection 
          title="Intelligent Analysis" 
          icon={Zap}
          description="Enhance the core reasoning engine to handle ambiguous requests and provide alternative paths."
        >
          <CapabilityCard
            title="Prompt Optimizer"
            description="Transform ambiguous engineering requests into structured technical requirements before analysis."
            why="Users often don't know how to write perfect architectural prompts."
            outcome="Higher quality blueprints derived from fewer retries."
          />
          <CapabilityCard
            title="Architecture Alternatives"
            description="Generate and compare multiple architecture approaches rather than producing only one recommendation."
            why="Engineers rarely want just one answer; they want tradeoffs."
            outcome="BuildScout provides 'Option A vs Option B' with explicit pros and cons."
            dependencies="Multi-branch Blueprint Generation"
          />
          <CapabilityCard
            title="Engineering Feedback Loop"
            description="Capture engineer feedback on recommendations and use approved/rejected decisions to improve future discovery."
            why="The system must learn from the human experts using it."
            outcome="Continuous reinforcement learning for the decision agent."
            dependencies="Context Retrieval & Memory"
          />
        </ThemeSection>

        <ThemeSection 
          title="Enterprise Governance" 
          icon={Shield}
          description="Ensure decisions are compliant, secure, and fully auditable by architecture boards."
        >
          <CapabilityCard
            title="Engineering Approval Workflow"
            description="Allow engineers or architects to review, approve, reject, or override recommendations before an architecture is finalized."
            why="AI should augment, not replace, the final engineering sign-off."
            outcome="Maintains human-in-the-loop safety for enterprise deployments."
          />
          <CapabilityCard
            title="Security & Compliance Intelligence"
            description="Evaluate discovered solutions and proposed architectures against organizational security and compliance requirements."
            why="Certain industries cannot adopt packages without strict license and vulnerability checks."
            outcome="Zero non-compliant solutions recommended in blueprints."
            dependencies="CVE Databases, Policy-as-Code Integration"
          />
          <CapabilityCard
            title="Decision Governance"
            description="Maintain traceable links between requirements, research evidence, evaluations, decisions, architecture, and final validation."
            why="Auditors and future engineers need to know EXACTLY why a decision was made."
            outcome="A complete, immutable audit trail for every architectural choice."
          />
        </ThemeSection>

        <ThemeSection 
          title="Production Intelligence" 
          icon={Target}
          description="Evaluate options not just for code quality, but for day-two operational realities."
        >
          <CapabilityCard
            title="Production Readiness Assessment"
            description="Evaluate operational readiness across reliability, security, scalability, observability, cost, and maintainability."
            why="A solution might look good on GitHub but be a nightmare to operate."
            outcome="Prevents adoption of immature operational technologies."
          />
          <CapabilityCard
            title="Cost & Platform Intelligence"
            description="Compare architecture options across cloud/platform constraints and estimate relative infrastructure cost."
            why="Architecture decisions are often fundamentally cost decisions."
            outcome="Upfront visibility into the financial impact of architectural choices."
            dependencies="Cloud Pricing APIs"
          />
        </ThemeSection>

        <ThemeSection 
          title="Collaboration" 
          icon={Users}
          description="Bring the team into the decision-making process."
        >
          <CapabilityCard
            title="Team Decision Workspace"
            description="Allow engineering teams to review evidence, discuss recommendations, record decisions, and maintain an auditable decision history."
            why="Architecture is a team sport, not a single-player mode."
            outcome="BuildScout becomes the central hub for team architectural design."
            dependencies="Multiplayer Sync, Commenting System"
          />
        </ThemeSection>

      </div>
    </div>
  );
};

export default V2Specification;
