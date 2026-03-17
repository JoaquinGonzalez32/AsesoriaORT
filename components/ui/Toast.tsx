import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  details?: string[];
  duration: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, details?: string[], duration?: number) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  dismiss: () => {},
});

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, title: string, details?: string[], duration = 4000) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, title, details, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// ─── Single toast ───────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>,
  error: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  warning: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  info: <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const SingleToast: React.FC<{ item: ToastItem; onDismiss: (id: number) => void }> = ({ item, onDismiss }) => {
  useEffect(() => {
    if (item.duration > 0) {
      const t = setTimeout(() => onDismiss(item.id), item.duration);
      return () => clearTimeout(t);
    }
  }, [item.id, item.duration, onDismiss]);

  return (
    <div className={`relative border rounded-xl px-4 py-3 text-sm shadow-lg slide-in-from-bottom-2 ${STYLES[item.type]}`}>
      <button
        onClick={() => onDismiss(item.id)}
        className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none"
        aria-label="Cerrar notificacion"
      >
        &times;
      </button>
      <div className="flex items-center gap-2 font-bold pr-6">
        {ICONS[item.type]}
        {item.title}
      </div>
      {item.details && item.details.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs opacity-80">
          {item.details.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      )}
    </div>
  );
};

// ─── Container ──────────────────────────────────────────────────────────────

const ToastContainer: React.FC<{ toasts: ToastItem[]; onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-96 max-w-[calc(100vw-2rem)]" aria-live="polite">
      {toasts.map(t => <SingleToast key={t.id} item={t} onDismiss={onDismiss} />)}
    </div>
  );
};
