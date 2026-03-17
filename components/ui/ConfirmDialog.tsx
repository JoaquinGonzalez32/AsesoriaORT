import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, onClose, onConfirm, title, message, detail,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  danger = false, loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md" preventClose={loading}>
      <div className="p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">{message}</p>
        {detail && (
          <p className="mt-3 font-bold text-gray-800 text-sm bg-gray-50 rounded-lg px-3 py-2">{detail}</p>
        )}
      </div>
      <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 ${
            danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
