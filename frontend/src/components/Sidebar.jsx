import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  Search, 
  Server, 
  Activity, 
  Wrench, 
  LineChart, 
  BookOpen, 
  Map, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'New Analysis', href: '/new-analysis', icon: PlusCircle },
    { name: 'Analyses', href: '/analyses', icon: List },
    { name: 'Research', href: '/research', icon: Search },
    { name: 'Architecture', href: '/architecture', icon: Server },
    { name: 'Agent Trace', href: '/agent-trace', icon: Activity },
    { name: 'MCP & Tools', href: '/tools', icon: Wrench },
    { name: 'LLM Metrics', href: '/metrics', icon: LineChart },
    { name: 'Documentation', href: '/docs', icon: BookOpen },
    { name: 'Roadmap', href: '/roadmap', icon: Map },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-700 bg-[#0f172a] text-slate-300">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white tracking-wide">BuildSmart<span className="text-blue-500">.</span></h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-slate-800 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
