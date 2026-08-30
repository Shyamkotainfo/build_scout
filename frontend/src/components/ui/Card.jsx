import React from 'react';

const variantClasses = {
  default:  'bg-[var(--bs-bg-primary)] border-[var(--bs-border-light)]',
  bordered: 'bg-[var(--bs-bg-primary)] border-[var(--bs-border-medium)]',
  elevated: 'bg-[var(--bs-bg-primary)] border-[var(--bs-border-light)] shadow-[var(--bs-shadow-md)]',
};

const paddingClasses = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

const Card = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`rounded-lg border
        ${variantClasses[variant] || variantClasses.default}
        ${paddingClasses[padding] || paddingClasses.md}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
