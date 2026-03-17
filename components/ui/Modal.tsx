import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max width class (default: max-w-lg) */
  maxWidth?: string;
  /** Blue header style */
  headerColor?: boolean;
  /** Prevent closing (e.g. while saving) */
  preventClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open, onClose, title, subtitle, children, footer,
  maxWidth = 'max-w-lg', headerColor = false, preventClose = false,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (!preventClose) onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
        <div className="min-h-full flex items-start justify-center py-8 px-4">
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} pointer-events-auto zoom-in-95`}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Modal'}
          >
            {title && (
              <div className={`px-8 py-6 rounded-t-2xl ${headerColor ? 'bg-blue-600 text-white' : 'border-b border-gray-100'}`}>
                <h3 className={`text-xl font-bold ${headerColor ? '' : 'text-gray-900'}`}>{title}</h3>
                {subtitle && <p className={`text-sm mt-1 ${headerColor ? 'opacity-80' : 'text-gray-500'}`}>{subtitle}</p>}
              </div>
            )}
            <div className={title ? '' : 'pt-0'}>{children}</div>
            {footer && (
              <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
