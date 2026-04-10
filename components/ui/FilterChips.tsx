import React from 'react';

export interface FilterChip {
  /** Identificador único */
  key: string;
  /** Etiqueta del filtro: "Estado" */
  label: string;
  /** Valor mostrado: "Contactado" */
  value: string;
  /** Handler para remover este filtro */
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({ chips, onClearAll, className = '' }) => {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} role="region" aria-label="Filtros activos">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mr-1">
        Filtros activos:
      </span>
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 pl-3 pr-1 py-1 bg-burgundy-50 border border-burgundy-200 rounded-full text-xs text-burgundy-800 font-medium animate-in"
        >
          <span className="text-burgundy-600/70">{chip.label}:</span>
          <span className="font-bold">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-burgundy-200 text-burgundy-600 transition-colors"
            aria-label={`Quitar filtro ${chip.label}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      {chips.length > 1 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] font-bold uppercase tracking-wider text-ink-muted hover:text-burgundy-700 transition-colors ml-1 underline-offset-2 hover:underline"
        >
          Limpiar todos
        </button>
      )}
    </div>
  );
};

export default FilterChips;
