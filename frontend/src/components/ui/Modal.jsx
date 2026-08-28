import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  className = '',
  ...props
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Trap focus inside modal by preventing background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      {...props}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative z-10 w-full max-w-lg rounded-xl border border-[var(--bs-border-light)]
          bg-[var(--bs-bg-primary)] shadow-[var(--bs-shadow-lg)] ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--bs-border-light)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--bs-text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[var(--bs-text-muted)] hover:bg-[var(--bs-bg-tertiary)] hover:text-[var(--bs-text-primary)]
              transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bs-orange-500)] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
