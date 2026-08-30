import React from 'react';

const dotColors = {
  reuse:       'bg-[var(--bs-status-success)]',
  pass:        'bg-[var(--bs-status-success)]',
  completed:   'bg-[var(--bs-status-success)]',
  connected:   'bg-[var(--bs-status-success)]',
  adapt:       'bg-[var(--bs-status-warning)]',
  warning:     'bg-[var(--bs-status-warning)]',
  build:       'bg-[var(--bs-status-build)]',
  critical:    'bg-[var(--bs-status-critical)]',
  failed:      'bg-[var(--bs-status-critical)]',
  unavailable: 'bg-[var(--bs-status-critical)]',
  running:     'bg-[var(--bs-status-running)]',
  pending:     'bg-[var(--bs-status-pending)]',
};

const textColors = {
  reuse:       'text-[var(--bs-status-success)]',
  pass:        'text-[var(--bs-status-success)]',
  completed:   'text-[var(--bs-status-success)]',
  connected:   'text-[var(--bs-status-success)]',
  adapt:       'text-[var(--bs-status-warning)]',
  warning:     'text-[var(--bs-status-warning)]',
  build:       'text-[var(--bs-status-build)]',
  critical:    'text-[var(--bs-status-critical)]',
  failed:      'text-[var(--bs-status-critical)]',
  unavailable: 'text-[var(--bs-status-critical)]',
  running:     'text-[var(--bs-status-running)]',
  pending:     'text-[var(--bs-status-pending)]',
};

const sizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
};

const StatusIndicator = ({
  status = 'pending',
  size = 'md',
  showLabel = true,
  className = '',
  ...props
}) => {
  const isAnimated = status === 'running' || status === 'pending';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${className}`}
      role="status"
      aria-label={`Status: ${label}`}
      {...props}
    >
      <span
        className={`rounded-full ${sizeClasses[size] || sizeClasses.md} ${dotColors[status] || dotColors.pending} ${isAnimated ? 'animate-pulse' : ''}`}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${textColors[status] || textColors.pending}`}>
          {label}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
