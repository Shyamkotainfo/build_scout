import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">BuildSmart</h1>
        <p className="mt-1 text-sm text-slate-400">AI-powered solution discovery and reuse</p>
      </div>
      <div className="mt-4 sm:mt-0">
        <Link
          to="/new-analysis"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
        >
          <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Analysis
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
