// Accessible Modal Component with Focus Trap and ARIA attributes

import React, { useEffect, useRef } from 'react';
import FocusLock from 'react-focus-lock';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Optional: Provide custom styles for the overlay */
  overlayStyle?: React.CSSProperties;
  /** Optional: Provide custom styles for the modal container */
  containerStyle?: React.CSSProperties;
  /** Whether clicking outside should close the modal (default: true) */
  closeOnOutsideClick?: boolean;
  /** Whether ESC key should close the modal (default: true) */
  closeOnEscape?: boolean;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  overlayStyle = {},
  containerStyle = {},
  closeOnOutsideClick = true,
  closeOnEscape = true,
}) => {
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const descId = useRef(`modal-desc-${Math.random().toString(36).slice(2)}`);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      // Add escape key listener
      document.addEventListener('keydown', handleEscape);

      // Prevent background scroll
      document.body.style.overflow = 'hidden';

      // Set focus to modal container
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const defaultOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...overlayStyle,
  };

  const defaultContainerStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '2px solid #333',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    ...containerStyle,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      aria-describedby={description ? descId.current : undefined}
      style={defaultOverlayStyle}
      onClick={handleOverlayClick}
    >
      <FocusLock returnFocus>
        <div
          ref={modalRef}
          tabIndex={-1}
          style={defaultContainerStyle}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visually hidden title for screen readers */}
          <h2
            id={titleId.current}
            style={{
              position: 'absolute',
              left: '-10000px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            {title}
          </h2>

          {description && (
            <p
              id={descId.current}
              style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              {description}
            </p>
          )}

          {children}
        </div>
      </FocusLock>
    </div>
  );
};
