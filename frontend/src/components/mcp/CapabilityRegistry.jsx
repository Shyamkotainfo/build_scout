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
    if (status === 'Used') return 'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border border-[var(--bs-status-success-border)]';
    if (status === 'Not Used') return 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border border-[var(--bs-border-light)]';
    return 'bg-[var(--bs-bg-secondary)] text-[var(--bs-text-secondary)] border border-[var(--bs-border-light)] border-dashed';
  };

  const getTypeBadge = (type) => {
    if (type === 'MCP') return <span className="bg-[var(--bs-orange-100)] text-[var(--bs-orange-600)] border border-[var(--bs-orange-200)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">MCP</span>;
    return <span className="bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border border-[var(--bs-status-success-border)] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">LOCAL</span>;
  };

  return (
    <div className="bg-[var(--bs-bg-primary)] border border-[var(--bs-border-medium)] rounded-lg overflow-hidden mb-8 shadow-sm">
      <div className="p-4 border-b border-[var(--bs-border-light)] bg-[var(--bs-bg-tertiary)]">
        <h3 className="text-sm font-semibold text-[var(--bs-text-primary)]">Registered Capabilities</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--bs-text-secondary)]">
          <thead className="bg-[var(--bs-bg-secondary)] text-xs uppercase font-semibold text-[var(--bs-text-tertiary)]">
            <tr>
              <th className="px-6 py-4">Capability</th>
              <th className="px-6 py-4">Provider Type</th>
              <th className="px-6 py-4">External Provider</th>
              <th className="px-6 py-4">Fallback</th>
              <th className="px-6 py-4">Execution Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bs-border-light)]">
            {capabilities.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bs-bg-hover)] transition-colors">
                <td className="px-6 py-4 font-mono text-[var(--bs-text-primary)] text-xs">{row.cap}</td>
                <td className="px-6 py-4">{getTypeBadge(row.type)}</td>
                <td className="px-6 py-4">{row.provider}</td>
                <td className="px-6 py-4 text-[var(--bs-text-secondary)]">{row.fallback}</td>
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
