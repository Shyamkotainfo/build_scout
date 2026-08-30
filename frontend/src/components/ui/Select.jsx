import React from 'react';

const Select = ({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  placeholder = 'Select...',
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-[var(--bs-text-primary)]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm
          bg-[var(--bs-bg-primary)] text-[var(--bs-text-primary)]
          focus:outline-2 focus:outline-offset-0 focus:outline-[var(--bs-orange-500)] focus:border-[var(--bs-orange-500)]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150 cursor-pointer
          ${error
            ? 'border-[var(--bs-status-critical)]'
            : 'border-[var(--bs-border-medium)] hover:border-[var(--bs-navy-500)]'
          }`}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-[var(--bs-status-critical)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
