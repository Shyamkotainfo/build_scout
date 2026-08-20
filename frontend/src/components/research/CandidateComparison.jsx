import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

const CandidateComparison = ({ selectedCandidatesNames, candidates, evaluations, onClose }) => {
  const selectedCandidates = candidates.filter(c => selectedCandidatesNames.includes(c.name));

  if (selectedCandidates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">Compare Candidates</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 focus:outline-none">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <table className="min-w-full divide-y divide-slate-700 table-fixed w-full">
            <thead>
              <tr>
                <th className="w-48 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-900 z-10 border-b border-slate-700">Feature</th>
                {selectedCandidates.map(c => (
                  <th key={c.name} className="px-4 py-3 text-left text-base font-bold text-white border-b border-slate-700 w-[300px]">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{c.name}</span>
                      {c.url && (
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              
              <tr>
                <td className="py-4 text-sm font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Source</td>
                {selectedCandidates.map(c => (
                  <td key={c.name} className="px-4 py-4 align-top text-sm text-slate-300">
                    {c.metadata?.source || 'Unknown'}
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="py-4 text-sm font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">License</td>
                {selectedCandidates.map(c => (
                  <td key={c.name} className="px-4 py-4 align-top text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5 rounded bg-slate-800 px-2 py-1 border border-slate-700">
                      <ShieldCheck className="h-3 w-3" /> {c.license || 'Unknown'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 text-sm font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Stars</td>
                {selectedCandidates.map(c => (
                  <td key={c.name} className="px-4 py-4 align-top text-sm font-mono text-slate-300">
                    {c.stars != null ? c.stars.toLocaleString() : 'Unknown'}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 text-sm font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Score</td>
                {selectedCandidates.map(c => {
                  const evalData = evaluations?.find(e => e.candidate_name === c.name);
                  return (
                    <td key={c.name} className="px-4 py-4 align-top">
                      {evalData ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white">{evalData.score}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            evalData.score >= 90 ? 'bg-green-900/40 text-green-400 border border-green-800/60' :
                            evalData.score >= 70 ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60' :
                            evalData.score >= 50 ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800/60' :
                            'bg-red-900/40 text-red-400 border border-red-800/60'
                          }`}>
                            {evalData.score >= 90 ? 'Excellent' : evalData.score >= 70 ? 'Good' : evalData.score >= 50 ? 'Moderate' : 'Weak'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic">No evaluation</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="py-4 text-sm font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Description</td>
                {selectedCandidates.map(c => (
                  <td key={c.name} className="px-4 py-4 align-top text-sm text-slate-300">
                    {c.description}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-4 text-sm font-semibold text-yellow-500/80 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Concerns</td>
                {selectedCandidates.map(c => {
                  const evalData = evaluations?.find(e => e.candidate_name === c.name);
                  return (
                    <td key={c.name} className="px-4 py-4 align-top text-sm text-slate-300">
                      {evalData?.concerns?.length > 0 ? (
                        <ul className="space-y-1">
                          {evalData.concerns.map((concern, i) => (
                            <li key={i} className="flex items-start gap-1 before:content-['•'] before:text-yellow-600">{concern}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="py-4 text-sm font-semibold text-slate-500 sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 pr-4">Missing Evidence</td>
                {selectedCandidates.map(c => {
                  const evalData = evaluations?.find(e => e.candidate_name === c.name);
                  return (
                    <td key={c.name} className="px-4 py-4 align-top text-sm text-slate-400">
                      {evalData?.missing_evidence?.length > 0 ? (
                        <ul className="space-y-1">
                          {evalData.missing_evidence.map((evidence, i) => (
                            <li key={i} className="flex items-start gap-1 before:content-['•'] before:text-slate-600">{evidence}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
