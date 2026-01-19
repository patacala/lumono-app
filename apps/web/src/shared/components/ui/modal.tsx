'use client';

import { ReactNode, useEffect, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-primary-900/20 backdrop-blur-sm animate-backdrop-enter"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full ${sizeStyles[size]} max-h-[90vh]
          bg-white/95 backdrop-blur-xl rounded-2xl
          shadow-elevated-lg border border-white/30
          overflow-hidden flex flex-col
          animate-modal-enter
        `}
      >
        {/* Header */}
        {title && (
          <div
            className="
              px-6 py-5 border-b border-surface-200/50
              bg-gradient-to-r from-surface-50/50 to-transparent
              flex items-center justify-between
            "
          >
            <h2 className="text-xl font-semibold text-surface-900">{title}</h2>
            <button
              onClick={onClose}
              className="
                p-2 rounded-xl
                text-surface-400 hover:text-surface-600
                hover:bg-surface-100/70
                transition-all duration-200
              "
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`
        px-6 py-4 border-t border-surface-200/50
        bg-gradient-to-r from-surface-50/30 to-transparent
        flex items-center justify-end gap-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}

