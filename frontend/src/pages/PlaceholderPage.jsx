import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-800 border-dashed bg-slate-900/50 p-12 text-center">
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">
        This feature is part of a future frontend task.
      </p>
    </div>
  );
};

export default PlaceholderPage;
