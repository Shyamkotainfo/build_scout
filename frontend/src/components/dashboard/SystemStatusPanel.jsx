import React from 'react';
import { getHealth } from '../../services/analysis_service';

const SystemStatusPanel = ({ healthStatus }) => {
  // healthStatus comes from the top-level or context, 
  // but we can also manage it here if we want. We'll rely on props to be simple.
  
  const isConnected = healthStatus === 'connected';

  const statuses = [
    { name: 'Backend', status: isConnected ? 'Connected' : 'Unavailable', active: isConnected },
    { name: 'API', status: isConnected ? 'Available' : 'Unknown', active: isConnected },
    { name: 'MCP', status: isConnected ? 'Available' : 'Unknown', active: isConnected }, // Or Not verified depending on health details
    { name: 'LLM', status: isConnected ? 'Available' : 'Unknown', active: isConnected },
    { name: 'Database', status: isConnected ? 'Available' : 'Unknown', active: isConnected },
  ];

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-5 mt-auto">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">System Status</h3>
      <ul className="space-y-3 text-sm">
        {statuses.map((s, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span className="text-slate-400">{s.name}</span>
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  s.active ? 'bg-green-500' : s.status === 'Unavailable' ? 'bg-red-500' : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-300 text-xs font-medium">{s.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemStatusPanel;
