import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data yet',
  description,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      {...props}
    >
      <div className="rounded-full bg-[var(--bs-bg-tertiary)] p-4 mb-4">
        <Icon className="h-8 w-8 text-[var(--bs-text-muted)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--bs-text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--bs-text-tertiary)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
