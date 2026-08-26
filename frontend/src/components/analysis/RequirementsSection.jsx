import React from 'react';

const RequirementsSection = ({ requirements }) => {
  if (!requirements || requirements.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Requirements</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium leading-6 text-slate-100 mb-4">Requirements</h2>
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-900/50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-400 sm:pl-6 w-32">ID</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400">Description</th>
              <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-400 w-24">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {requirements.map((req) => (
              <tr key={req.id} className="hover:bg-slate-750 transition-colors">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-slate-400 sm:pl-6">{req.id}</td>
                <td className="py-4 px-3 text-sm text-slate-300">{req.description}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    req.priority.toUpperCase() === 'HIGH' ? 'bg-red-900/40 text-red-400 border border-red-800/60' :
                    req.priority.toUpperCase() === 'MEDIUM' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/60' :
                    'bg-slate-700/50 text-slate-300 border border-slate-600/60'
                  }`}>
                    {req.priority.toUpperCase()}
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

export default RequirementsSection;
