import { useState, useEffect } from 'react';
import { getHealth } from '../services/analysis_service';

const Navbar = () => {
  const [health, setHealth] = useState({ status: 'checking' });

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await getHealth();
        setHealth({ status: 'connected' });
      } catch (error) {
        setHealth({ status: 'unavailable' });
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-slate-700 bg-[#1e293b]">
      <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <span className="text-lg font-semibold text-white">Developer Dashboard</span>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <div className="flex items-center space-x-2 rounded-md bg-slate-800 px-3 py-1.5 border border-slate-700">
            <span className="text-sm text-slate-400">Backend</span>
            <div className="flex items-center space-x-1">
              {health.status === 'checking' && (
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
              )}
              {health.status === 'connected' && (
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
              )}
              {health.status === 'unavailable' && (
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
              )}
              <span className="text-sm font-medium text-slate-300">
                {health.status === 'checking' && 'Checking...'}
                {health.status === 'connected' && 'Connected'}
                {health.status === 'unavailable' && 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
