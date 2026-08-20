import React from 'react';

const CapabilityRegistry = ({ traces }) => {
  const allToolCalls = [];
  (traces || []).forEach(t => {
    if (t.tool_calls) {
      allToolCalls.push(...t.tool_calls);
    }
  });

  const getStatus = (capName) => {
    if (!traces || traces.length === 0) return 'Unknown';
    // Match based on tool name prefixes, assuming convention
    // E.g. github.search maps to tools like "search_repositories" which we assume the user maps logically, 
    // or we check if the capability string exists in the tool name / arguments
    const wasUsed = allToolCalls.some(tc => 
      (tc.name && tc.name.toLowerCase().includes(capName.split('.')[0])) ||
      (tc.tool && tc.tool.toLowerCase().includes(capName.split('.')[0])) ||
      (tc.server && tc.server.toLowerCase().includes(capName.split('.')[0]))
    );
    return wasUsed ? 'Used' : 'Not Used';
  };

  const capabilities = [
    { cap: 'github.search', type: 'MCP', provider: 'GitHub', fallback: 'Local fallback', status: getStatus('github') },
    { cap: 'web.search', type: 'MCP', provider: 'Tavily', fallback: 'Local fallback', status: getStatus('tavily') },
    { cap: 'security.get', type: 'LOCAL', provider: '—', fallback: '—', status: getStatus('security') },
    { cap: 'license.get', type: 'LOCAL', provider: '—', fallback: '—', status: getStatus('license') },
    { cap: 'aws.documentation', type: 'LOCAL', provider: '—', fallback: '—', status: getStatus('aws') },
    { cap: 'cloud.architecture', type: 'LOCAL', provider: '—', fallback: '—', status: getStatus('cloud') }
  ];

  const getBadgeClass = (status) => {
    if (status === 'Used') return 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50';
    if (status === 'Not Used') return 'bg-slate-800 text-slate-500 border border-slate-700';
    return 'bg-slate-800 text-slate-400 border border-slate-700 border-dashed';
  };

  const getTypeBadge = (type) => {
    if (type === 'MCP') return <span className="bg-purple-900/30 text-purple-400 border border-purple-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    return <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOCAL</span>;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-sm font-semibold text-slate-200">Registered Capabilities</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/30 text-xs uppercase font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-4">Capability</th>
              <th className="px-6 py-4">Provider Type</th>
              <th className="px-6 py-4">External Provider</th>
              <th className="px-6 py-4">Fallback</th>
              <th className="px-6 py-4">Execution Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {capabilities.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-200 text-xs">{row.cap}</td>
                <td className="px-6 py-4">{getTypeBadge(row.type)}</td>
                <td className="px-6 py-4">{row.provider}</td>
                <td className="px-6 py-4 text-slate-400">{row.fallback}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CapabilityRegistry;
