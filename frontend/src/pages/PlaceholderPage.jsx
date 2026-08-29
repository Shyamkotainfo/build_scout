import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-[var(--bs-border-light)] border-dashed bg-[var(--bs-bg-secondary)] p-12 text-center">
      <h2 className="mt-2 text-xl font-semibold text-[var(--bs-text-primary)]">{title}</h2>
      <p className="mt-1 text-sm text-[var(--bs-text-secondary)]">
        This feature is part of a future frontend task.
      </p>
    </div>
  );
};

export default PlaceholderPage;
