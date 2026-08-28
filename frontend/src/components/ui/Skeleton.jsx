import React from 'react';

const variantClasses = {
  text:   'rounded-md',
  circle: 'rounded-full',
  rect:   'rounded-lg',
};

const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  ...props
}) => {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const defaultHeight = variant === 'text' ? 'h-4' : variant === 'circle' ? 'h-10 w-10' : 'h-20';

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-[var(--bs-bg-hover)]
        ${variantClasses[variant] || variantClasses.text}
        ${!width && !height ? defaultHeight : ''}
        ${count > 1 && i < count - 1 ? 'mb-2' : ''}
        ${className}`}
      style={style}
      role="status"
      aria-label="Loading"
      {...props}
    />
  ));

  return <>{items}</>;
};

export default Skeleton;
