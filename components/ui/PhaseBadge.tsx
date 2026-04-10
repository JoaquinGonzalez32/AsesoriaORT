import React from 'react';
import { FaseOportunidad } from '../../types';

interface PhaseBadgeProps {
  fase: FaseOportunidad | string;
  size?: 'sm' | 'md';
  withDot?: boolean;
  className?: string;
}

/**
 * Pill semántica para fase de oportunidad.
 * Colores reflejan progresión del pipeline: frío → cálido → cierre.
 */
// Paleta original del proyecto: 4 estados (Inscripto, NoInteresado, PromesaInscripcion, resto en azul)
const STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  [FaseOportunidad.Inscripto]: {
    bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200', dot: 'bg-green-600',
  },
  [FaseOportunidad.NoInteresado]: {
    bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200', dot: 'bg-red-500',
  },
  [FaseOportunidad.PromesaInscripcion]: {
    bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500',
  },
};

// Fallback azul (Interesado, Evaluando, Contactado)
const FALLBACK = {
  bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', dot: 'bg-blue-500',
};

const PhaseBadge: React.FC<PhaseBadgeProps> = ({ fase, size = 'sm', withDot = true, className = '' }) => {
  const style = STYLE[fase] || FALLBACK;
  const sizeClasses = size === 'md'
    ? 'px-2.5 py-1 text-[11px]'
    : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-bold uppercase tracking-wider ${style.bg} ${style.text} ${style.ring} ${sizeClasses} ${className}`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {fase}
    </span>
  );
};

export default PhaseBadge;
