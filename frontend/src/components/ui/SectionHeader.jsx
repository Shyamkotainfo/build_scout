import React from 'react';

const SectionHeader = ({
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex items-center justify-between pb-4 ${className}`}
      {...props}
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--bs-text-primary)]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-[var(--bs-text-tertiary)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default SectionHeader;
