import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { buildSupportUrl, buildSupportEmailUrl } from '../../lib/errorMessages';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastReport {
  context: string;
  technical: string;
}

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  details?: string[];
  duration: number;
  report?: ToastReport;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, details?: string[], duration?: number, report?: ToastReport) => void;
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

  const toast = useCallback((type: ToastType, title: string, details?: string[], duration = 4000, report?: ToastReport) => {
    const id = ++nextId;
    // Errores con reporte permanecen visibles más tiempo
    const finalDuration = report ? Math.max(duration, 8000) : duration;
    setToasts(prev => [...prev, { id, type, title, details, duration: finalDuration, report }]);
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
      {item.report && (
        <div className="mt-3 space-y-1.5">
          <div className="flex flex-wrap gap-1.5">
            <a
              href={buildSupportUrl(item.report.context, item.report.technical)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/60 hover:bg-white border border-current/20 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
              Reportar por WhatsApp
            </a>
            <a
              href={buildSupportEmailUrl(item.report.context, item.report.technical)}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/60 hover:bg-white border border-current/20 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Reportar por correo
            </a>
          </div>
          <p className="text-[10px] opacity-70 leading-tight">
            Respondo más rápido por WhatsApp. Si no tenés WhatsApp Web, escribime por correo.
          </p>
        </div>
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
