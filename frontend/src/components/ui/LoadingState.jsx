import React from 'react';
import { Loader2 } from 'lucide-react';

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

const LoadingState = ({
  message = 'Loading...',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-6 gap-3 ${className}`}
      role="status"
      aria-label={message}
      {...props}
    >
      <Loader2
        className={`animate-spin text-[var(--bs-orange-500)] ${sizeClasses[size] || sizeClasses.md}`}
        aria-hidden="true"
      />
      {message && (
        <p className="text-sm font-medium text-[var(--bs-text-tertiary)]">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
