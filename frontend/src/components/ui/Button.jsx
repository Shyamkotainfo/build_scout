import React from 'react';

const variantClasses = {
  primary:   'bg-[var(--bs-orange-500)] text-white hover:bg-[var(--bs-orange-600)] border-transparent',
  secondary: 'bg-[var(--bs-navy-800)] text-white hover:bg-[var(--bs-navy-700)] border-transparent',
  outline:   'bg-transparent text-[var(--bs-navy-800)] border-[var(--bs-border-medium)] hover:bg-[var(--bs-bg-tertiary)]',
  ghost:     'bg-transparent text-[var(--bs-text-secondary)] border-transparent hover:bg-[var(--bs-bg-tertiary)]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-md border
        transition-colors duration-150 cursor-pointer
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bs-orange-500)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
