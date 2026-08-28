import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onTabChange,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex border-b border-[var(--bs-border-light)] ${className}`}
      role="tablist"
      aria-label="Tabs"
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange?.(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 cursor-pointer
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bs-orange-500)]
              ${isActive
                ? 'border-[var(--bs-orange-500)] text-[var(--bs-orange-600)]'
                : 'border-transparent text-[var(--bs-text-tertiary)] hover:text-[var(--bs-text-primary)] hover:border-[var(--bs-border-medium)]'
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
