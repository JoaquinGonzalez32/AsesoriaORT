import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead, Oportunidad, RAS } from '../../types';
import { ROUTES, IconDashboard, IconUsers, IconTarget, IconCalendar, IconListaTrabajo, IconFileBarChart } from '../../constants';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  opportunities: Oportunidad[];
  rases: RAS[];
}

type Item = {
  id: string;
  group: 'Navegación' | 'Oportunidades' | 'Leads' | 'RASES' | 'Acciones';
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
};

/** Normaliza string para búsqueda tolerante a tildes */
const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose, leads, opportunities, rases }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      // Focus tras el siguiente paint
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const go = useCallback((to: string) => {
    navigate(to);
    onClose();
  }, [navigate, onClose]);

  // Construir items
  const allItems = useMemo<Item[]>(() => {
    const items: Item[] = [];

    // Navegación
    const nav: Array<[string, string, React.ReactNode]> = [
      [ROUTES.DASHBOARD, 'Dashboard', <IconDashboard size={16} />],
      [ROUTES.LEADS, 'Leads', <IconUsers size={16} />],
      [ROUTES.OPPORTUNITIES, 'Oportunidades', <IconTarget size={16} />],
      [ROUTES.RASES, 'Agenda RASES', <IconCalendar size={16} />],
      [ROUTES.LISTAS_TRABAJO, 'Listas de Trabajo', <IconListaTrabajo size={16} />],
      [ROUTES.REPORTS, 'Informes', <IconFileBarChart size={16} />],
    ];
    nav.forEach(([to, label, icon]) => items.push({
      id: `nav:${to}`, group: 'Navegación', label, icon, hint: 'Ir a',
      onSelect: () => go(to),
    }));

    // Oportunidades
    opportunities.forEach(op => items.push({
      id: `opp:${op.opp_id}`,
      group: 'Oportunidades',
      label: op.nombre,
      hint: `${op.carrera_interes || '—'} · ${op.fase_oportunidad || ''}`,
      icon: <IconTarget size={16} />,
      onSelect: () => go(`/opportunities/${op.opp_id}`),
    }));

    // Leads
    leads.forEach(l => items.push({
      id: `lead:${l.lead_id}`,
      group: 'Leads',
      label: l.nombre,
      hint: `${l.carrera_interes || '—'} · ${l.resultado_llamada || ''}`,
      icon: <IconUsers size={16} />,
      onSelect: () => go(ROUTES.LEADS),
    }));

    // RASES (próximas)
    rases.slice(0, 50).forEach(r => items.push({
      id: `ras:${r.ras_id}`,
      group: 'RASES',
      label: r.nombre_interesado || r.titulo || 'Sin nombre',
      hint: `${r.fecha_hora ? new Date(r.fecha_hora).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' }) : ''} · ${r.agente_nombre || ''}`,
      icon: <IconCalendar size={16} />,
      onSelect: () => go(ROUTES.RASES),
    }));

    return items;
  }, [leads, opportunities, rases, go]);

  // Filtrado
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) {
      // Sin query: solo navegación + primeras 5 de cada grupo
      const groups: Record<string, Item[]> = {};
      allItems.forEach(it => { (groups[it.group] ||= []).push(it); });
      return [
        ...(groups['Navegación'] || []),
        ...(groups['Oportunidades'] || []).slice(0, 5),
        ...(groups['Leads'] || []).slice(0, 5),
        ...(groups['RASES'] || []).slice(0, 5),
      ];
    }
    return allItems.filter(it => {
      const hay = normalize(`${it.label} ${it.hint || ''} ${it.group}`);
      return q.split(/\s+/).every(token => hay.includes(token));
    }).slice(0, 50);
  }, [allItems, query]);

  // Reset activeIdx cuando cambia el resultado
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Scroll item activo a la vista
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${activeIdx}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Keyboard nav
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[activeIdx]?.onSelect();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  // Agrupar visualmente
  const grouped: Array<{ group: string; items: Item[] }> = [];
  let currentGroup: string | null = null;
  filtered.forEach(it => {
    if (it.group !== currentGroup) {
      grouped.push({ group: it.group, items: [it] });
      currentGroup = it.group;
    } else {
      grouped[grouped.length - 1].items.push(it);
    }
  });

  // Map plano para indexar el highlight
  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4 fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de comandos"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-2xl bg-cream-50 rounded-2xl shadow-2xl ring-1 ring-ink/10 overflow-hidden zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink/5 bg-cream">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted shrink-0" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar leads, oportunidades, RASES, ir a…"
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink-faint text-base"
            aria-label="Buscar"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono text-ink-muted bg-cream-100 border border-ink/10 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Lista */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-display italic text-2xl text-ink-faint">Sin resultados</p>
              <p className="text-xs text-ink-muted mt-1">Probá con otro término</p>
            </div>
          ) : (
            grouped.map(g => (
              <div key={g.group} className="mb-1">
                <div className="px-5 py-1.5 font-display italic text-xs text-burgundy-700 tracking-wide">
                  {g.group}
                </div>
                {g.items.map(it => {
                  flatIdx++;
                  const idx = flatIdx;
                  const active = idx === activeIdx;
                  return (
                    <button
                      key={it.id}
                      data-idx={idx}
                      onClick={() => it.onSelect()}
                      onMouseEnter={() => setActiveIdx(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        active
                          ? 'bg-burgundy-50 text-burgundy-800'
                          : 'text-ink hover:bg-cream-100'
                      }`}
                    >
                      <span className={active ? 'text-burgundy-600' : 'text-ink-muted'}>
                        {it.icon}
                      </span>
                      <span className="flex-1 min-w-0 truncate text-sm font-medium">{it.label}</span>
                      {it.hint && (
                        <span className={`text-xs truncate max-w-[40%] ${active ? 'text-burgundy-600/80' : 'text-ink-faint'}`}>
                          {it.hint}
                        </span>
                      )}
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-ink/5 bg-cream text-[11px] text-ink-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-cream-100 border border-ink/10 rounded px-1.5 py-0.5">↑↓</kbd> navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-cream-100 border border-ink/10 rounded px-1.5 py-0.5">↵</kbd> abrir
            </span>
          </div>
          <span className="font-display italic text-burgundy-700">CRM Asesoría</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
