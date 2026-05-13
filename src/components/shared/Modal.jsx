import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-lavender-700/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-3xl shadow-xl border border-lavender-100 animate-slide-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-lavender-100">
            <h3 className="font-semibold text-lavender-700">{title}</h3>
            <button onClick={onClose} className="p-1 rounded-xl hover:bg-lavender-50 text-lavender-500">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="p-5 border-t border-lavender-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-lavender-600">{description}</p>
    </Modal>
  );
}
