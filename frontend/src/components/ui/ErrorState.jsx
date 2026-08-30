import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="alert"
      {...props}
    >
      <div className="rounded-full bg-[var(--bs-status-critical-light)] p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-[var(--bs-status-critical)]" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[var(--bs-text-primary)] mb-1">
        {title}
      </h3>
      {message && (
        <p className="text-sm text-[var(--bs-text-tertiary)] max-w-sm mb-4">
          {message}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
