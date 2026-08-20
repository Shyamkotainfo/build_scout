import React from 'react';

const ArchitectureDiagram = ({ blueprint, decisions }) => {
  if (!blueprint) return null;

  const dataFlow = blueprint.data_flow || [];
  
  if (dataFlow.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold leading-6 text-white mb-4">Architecture Data Flow</h2>
        <div className="rounded-lg border border-slate-700 border-dashed bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-slate-500">No data flow available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold leading-6 text-white mb-4">Architecture Data Flow</h2>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 overflow-x-auto">
        <div className="flex flex-col items-center min-w-max mx-auto space-y-2">
          {dataFlow.map((flowStep, idx) => (
            <React.Fragment key={idx}>
              <div className="bg-slate-800 border border-slate-600 rounded-md px-6 py-3 shadow-md min-w-[250px] text-center">
                <span className="font-semibold text-slate-200">{flowStep}</span>
              </div>
              {idx < dataFlow.length - 1 && (
                <div className="text-slate-500 h-6 flex flex-col items-center justify-center">
                  <div className="w-px h-full bg-slate-600"></div>
                  <div className="-mt-1 text-xs">↓</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
