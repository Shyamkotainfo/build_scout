import React, { useState } from 'react';

const positionClasses = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

const Tooltip = ({
  content,
  position = 'top',
  children,
  className = '',
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      {...props}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium
            bg-[var(--bs-navy-800)] text-white shadow-[var(--bs-shadow-md)]
            pointer-events-none
            ${positionClasses[position] || positionClasses.top}`}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
