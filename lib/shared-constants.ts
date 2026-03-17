import { ResultadoLlamada, FaseOportunidad } from '../types';

// ─── Carreras ────────────────────────────────────────────────────────────────
export const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

export const CARRERA_HEX: Record<string, string> = {
  LV: '#0ea5e9', WY: '#8b5cf6', LT: '#f43f5e', LD: '#14b8a6',
  YN: '#f97316', LG: '#6366f1', VD: '#ec4899', UI: '#06b6d4',
  GF: '#a855f7', WE: '#eab308',
};
export const CARRERA_FALLBACK = Object.values(CARRERA_HEX);

// ─── Agentes RAS ─────────────────────────────────────────────────────────────
export const AGENTES_RAS = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucia Nazur', 'Fabian Barros', 'Maria Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez',
];
export const AGENTE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#ca8a04', '#be185d', '#6d28d9'];

// ─── Proceso ─────────────────────────────────────────────────────────────────
export const PROCESO_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = 2023; y <= 2030; y++) { opts.push(`Marzo ${y}`, `Agosto ${y}`); }
  return opts;
})();

export const getDefaultProceso = () => {
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  if (m >= 9) return `Marzo ${y + 1}`;
  if (m >= 4) return `Agosto ${y}`;
  return `Marzo ${y}`;
};

// ─── Meses ───────────────────────────────────────────────────────────────────
export const MESES = [
  { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
  { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
  { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
  { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' },
];

// ─── Colores de Resultado Llamada ────────────────────────────────────────────
export const RESULTADO_HEX: Record<string, string> = {
  [ResultadoLlamada.SinGestion]: '#94a3b8',
  [ResultadoLlamada.PrimerContacto]: '#1d4ed8',
  [ResultadoLlamada.Contactado]: '#15803d',
  [ResultadoLlamada.Interesado]: '#047857',
  [ResultadoLlamada.NoInteresado]: '#b91c1c',
  [ResultadoLlamada.NumeroIncorrecto]: '#4b5563',
  [ResultadoLlamada.LlamarMasTarde]: '#b45309',
};

// ─── Colores de Fase Oportunidad ─────────────────────────────────────────────
export const FASE_HEX: Record<string, string> = {
  [FaseOportunidad.Interesado]: '#3b82f6',
  [FaseOportunidad.Evaluando]: '#60a5fa',
  [FaseOportunidad.Contactado]: '#f59e0b',
  [FaseOportunidad.NoInteresado]: '#ef4444',
  [FaseOportunidad.PromesaInscripcion]: '#22c55e',
  [FaseOportunidad.Inscripto]: '#16a34a',
};

export const FASE_STYLE: Record<string, string> = {
  [FaseOportunidad.Interesado]: 'bg-blue-100 text-blue-700',
  [FaseOportunidad.Evaluando]: 'bg-sky-100 text-sky-700',
  [FaseOportunidad.Contactado]: 'bg-yellow-100 text-yellow-700',
  [FaseOportunidad.NoInteresado]: 'bg-red-100 text-red-700',
  [FaseOportunidad.PromesaInscripcion]: 'bg-green-100 text-green-700',
  [FaseOportunidad.Inscripto]: 'bg-emerald-100 text-emerald-800',
};

// ─── Colores de carreras para graficas ───────────────────────────────────────
export const CARRERA_COLORS = ['#9333ea', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#c084fc', '#818cf8', '#a78bfa', '#d8b4fe', '#e9d5ff'];
