import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Search,
  GitBranch,
  Server,
  ShieldCheck,
  Activity,
  Wrench,
  LineChart,
  BookOpen,
  Map,
  Settings,
  Compass,
  Eye,
  Box,
  Cog,
} from 'lucide-react';

const navGroups = [
  {
    label: 'DISCOVER',
    items: [
      { name: 'Dashboard',     href: '/',              icon: LayoutDashboard },
      { name: 'New Analysis',  href: '/new-analysis',  icon: PlusCircle },
      { name: 'Analyses',      href: '/analyses',      icon: List },
    ],
  },
  {
    label: 'UNDERSTAND',
    items: [
      { name: 'Research',      href: '/research',      icon: Search },
      { name: 'Decisions',     href: '/decisions',     icon: GitBranch },
      { name: 'Architecture',  href: '/architecture',  icon: Server },
      { name: 'Validation',    href: '/validation',    icon: ShieldCheck },
    ],
  },
  {
    label: 'OBSERVE',
    items: [
      { name: 'Agent Trace',   href: '/agent-trace',   icon: Activity },
      { name: 'MCP & Tools',   href: '/tools',         icon: Wrench },
      { name: 'LLM Metrics',   href: '/metrics',       icon: LineChart },
    ],
  },
  {
    label: 'PRODUCT',
    items: [
      { name: 'Documentation', href: '/docs',          icon: BookOpen },
      { name: 'Roadmap',       href: '/roadmap',       icon: Map },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { name: 'Settings',      href: '/settings',      icon: Settings },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const match = location.pathname.match(/^\/(?:analyses|research|decisions|architecture|validation|traces|mcp|metrics)\/([a-zA-Z0-9-]+)/);
  const activeAnalysisId = match ? match[1] : null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-[var(--bs-border-light)] bg-[var(--bs-navy-900)] text-[var(--bs-text-muted)]">
      {/* Brand */}
      <div className="flex h-16 items-center px-6 border-b border-[var(--bs-navy-800)]">
        <h1 className="text-xl font-bold text-[var(--bs-text-primary)] tracking-wide">
          Build<span className="text-[var(--bs-orange-500)]">Scout</span>
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto pt-3">
        <nav className="flex-1 px-3" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--bs-navy-500)]">
                {group.label}
              </span>
              <div className="mt-1.5 space-y-0.5">
                {group.items.map((item) => {
                  let href = item.href;
                  // Append activeAnalysisId to context-dependent routes if available
                  if (activeAnalysisId && (group.label === 'UNDERSTAND' || group.label === 'OBSERVE')) {
                    // Only append if it doesn't already have an ID (which it shouldn't)
                    if (href !== '/' && !href.includes(activeAnalysisId)) {
                      href = `${href}/${activeAnalysisId}`;
                    }
                  }

                  const isActive =
                    item.href === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.href);
                      
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                        isActive
                          ? 'bg-[var(--bs-navy-800)] text-[var(--bs-orange-400)]'
                          : 'text-[var(--bs-navy-500)] hover:bg-[var(--bs-navy-800)] hover:text-[var(--bs-text-primary)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={`mr-3 h-4 w-4 flex-shrink-0 ${
                          isActive ? 'text-[var(--bs-orange-400)]' : 'text-[var(--bs-navy-500)] group-hover:text-[var(--bs-text-primary)]'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
