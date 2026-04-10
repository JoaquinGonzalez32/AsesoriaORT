import React, { useState, useRef, useEffect } from 'react';

interface DateRangePickerProps {
  /** Fecha desde en formato YYYY-MM-DD */
  desde: string;
  /** Fecha hasta en formato YYYY-MM-DD */
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
  className?: string;
}

type Preset = {
  label: string;
  /** Devuelve [desde, hasta] en YYYY-MM-DD */
  range: () => [string, string];
};

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const today = () => new Date();

const PRESETS: Preset[] = [
  {
    label: 'Hoy',
    range: () => { const t = today(); return [fmt(t), fmt(t)]; },
  },
  {
    label: 'Ayer',
    range: () => { const y = today(); y.setDate(y.getDate() - 1); return [fmt(y), fmt(y)]; },
  },
  {
    label: 'Últimos 7 días',
    range: () => { const e = today(); const s = new Date(); s.setDate(s.getDate() - 6); return [fmt(s), fmt(e)]; },
  },
  {
    label: 'Últimos 30 días',
    range: () => { const e = today(); const s = new Date(); s.setDate(s.getDate() - 29); return [fmt(s), fmt(e)]; },
  },
  {
    label: 'Este mes',
    range: () => { const t = today(); const s = new Date(t.getFullYear(), t.getMonth(), 1); return [fmt(s), fmt(t)]; },
  },
  {
    label: 'Mes pasado',
    range: () => {
      const t = today();
      const s = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const e = new Date(t.getFullYear(), t.getMonth(), 0);
      return [fmt(s), fmt(e)];
    },
  },
  {
    label: 'Este año',
    range: () => { const t = today(); const s = new Date(t.getFullYear(), 0, 1); return [fmt(s), fmt(t)]; },
  },
];

const formatDisplay = (d: string) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';

const DateRangePicker: React.FC<DateRangePickerProps> = ({ desde, hasta, onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasValue = !!(desde || hasta);

  // Click outside cierra (compatible con date-input nativo: solo cierra si el click NO es dentro del panel)
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const target = e.target as Node;
      // Si el target es un input type=date abierto, el click puede venir del picker nativo (fuera del DOM del panel)
      // Solo cerramos si target NO es nuestro ref Y NO es un input nativo de fecha
      if (ref.current && !ref.current.contains(target)) {
        if (target instanceof HTMLInputElement && target.type === 'date') return;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const applyPreset = (p: Preset) => {
    const [d, h] = p.range();
    onChange(d, h);
    setOpen(false);
  };

  const clear = () => {
    onChange('', '');
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full sm:w-auto border rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${
          hasValue
            ? 'border-burgundy-300 bg-burgundy-50 text-burgundy-800'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
        }`}
        aria-label="Seleccionar rango de fechas"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {hasValue
          ? `${formatDisplay(desde) || '…'} → ${formatDisplay(hasta) || '…'}`
          : 'Rango de fechas'}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl flex overflow-hidden min-w-[440px] zoom-in-95">
          {/* Presets */}
          <div className="bg-cream-50 border-r border-gray-100 py-2 w-40 flex flex-col">
            <p className="px-4 py-1.5 font-display italic text-xs text-burgundy-700">Atajos</p>
            {PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-left px-4 py-2 text-xs font-medium text-ink-soft hover:bg-burgundy-50 hover:text-burgundy-800 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex-1 p-4">
            <p className="font-display italic text-xs text-burgundy-700 mb-2">Rango personalizado</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1 block">Desde</label>
                <input
                  type="date"
                  value={desde}
                  onChange={e => onChange(e.target.value, hasta)}
                  className="bg-cream-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:ring-2 focus:ring-burgundy-400 focus:border-burgundy-400 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={hasta}
                  onChange={e => onChange(desde, e.target.value)}
                  className="bg-cream-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:ring-2 focus:ring-burgundy-400 focus:border-burgundy-400 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {hasValue && (
                <button
                  type="button"
                  onClick={clear}
                  className="flex-1 text-xs font-bold uppercase text-ink-muted hover:text-burgundy-700 hover:bg-burgundy-50 py-2 rounded-xl border border-gray-200 transition-colors"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 text-xs font-bold uppercase text-cream-50 bg-burgundy-700 hover:bg-burgundy-800 py-2 rounded-xl transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
