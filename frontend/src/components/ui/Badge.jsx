import React from 'react';

const statusStyles = {
  reuse:       'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]',
  pass:        'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]',
  completed:   'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]',
  connected:   'bg-[var(--bs-status-success-light)] text-[var(--bs-status-success)] border-[var(--bs-status-success-border)]',

  adapt:       'bg-[var(--bs-status-warning-light)] text-[var(--bs-status-warning)] border-[var(--bs-status-warning-border)]',
  warning:     'bg-[var(--bs-status-warning-light)] text-[var(--bs-status-warning)] border-[var(--bs-status-warning-border)]',

  build:       'bg-[var(--bs-status-build-light)] text-[var(--bs-status-build)] border-[var(--bs-status-build-border)]',

  critical:    'bg-[var(--bs-status-critical-light)] text-[var(--bs-status-critical)] border-[var(--bs-status-critical-border)]',
  failed:      'bg-[var(--bs-status-critical-light)] text-[var(--bs-status-critical)] border-[var(--bs-status-critical-border)]',
  unavailable: 'bg-[var(--bs-status-critical-light)] text-[var(--bs-status-critical)] border-[var(--bs-status-critical-border)]',

  running:     'bg-[var(--bs-status-running-light)] text-[var(--bs-status-running)] border-[var(--bs-status-running-border)]',
  pending:     'bg-[var(--bs-status-pending-light)] text-[var(--bs-status-pending)] border-[var(--bs-status-pending-border)]',
};

const variantBase = {
  default: 'border',
  outline: 'border bg-transparent',
};

const Badge = ({
  status,
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const statusClass = status ? (statusStyles[status] || '') : 'bg-[var(--bs-bg-tertiary)] text-[var(--bs-text-secondary)] border-[var(--bs-border-light)]';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${variantBase[variant] || variantBase.default}
        ${statusClass}
        ${className}`}
      aria-label={status ? `Status: ${status}` : undefined}
      {...props}
    >
      {children || (status ? status.toUpperCase() : '')}
    </span>
  );
};

export default Badge;
