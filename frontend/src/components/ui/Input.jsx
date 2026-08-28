import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--bs-text-primary)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm
          bg-[var(--bs-bg-primary)] text-[var(--bs-text-primary)]
          placeholder:text-[var(--bs-text-muted)]
          focus:outline-2 focus:outline-offset-0 focus:outline-[var(--bs-orange-500)] focus:border-[var(--bs-orange-500)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error
            ? 'border-[var(--bs-status-critical)] focus:outline-[var(--bs-status-critical)]'
            : 'border-[var(--bs-border-medium)] hover:border-[var(--bs-navy-500)]'
          }`}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[var(--bs-status-critical)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
