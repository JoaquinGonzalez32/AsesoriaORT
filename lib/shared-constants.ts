import { FaseOportunidad, ResultadoLlamada } from '../types';

export const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

export const MESES = [
  { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
  { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
  { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
  { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' }
];

export const AGENTES_RAS = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucia Nazur', 'Fabian Barros', 'Maria Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez'
];

export const PROCESO_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = 2023; y <= 2030; y++) { opts.push(`Marzo ${y}`, `Agosto ${y}`); }
  return opts;
})();

export const FASE_HEX: Record<string, string> = {
  [FaseOportunidad.Interesado]: '#3b82f6',
  [FaseOportunidad.Evaluando]: '#f59e0b',
  [FaseOportunidad.Contactado]: '#06b6d4',
  [FaseOportunidad.NoInteresado]: '#ef4444',
  [FaseOportunidad.PromesaInscripcion]: '#22c55e',
  [FaseOportunidad.Inscripto]: '#16a34a',
};

export const CARRERA_HEX: Record<string, string> = {
  LV: '#6366f1', WY: '#ec4899', LT: '#14b8a6', LD: '#f97316',
  YN: '#8b5cf6', LG: '#06b6d4', VD: '#10b981', UI: '#f43f5e',
  GF: '#eab308', WE: '#3b82f6',
};

export const RESULTADO_HEX: Record<string, string> = {
  [ResultadoLlamada.SinGestion]: '#94a3b8',
  [ResultadoLlamada.PrimerContacto]: '#1d4ed8',
  [ResultadoLlamada.Contactado]: '#15803d',
  [ResultadoLlamada.Interesado]: '#047857',
  [ResultadoLlamada.NoInteresado]: '#b91c1c',
  [ResultadoLlamada.NumeroIncorrecto]: '#4b5563',
  [ResultadoLlamada.LlamarMasTarde]: '#b45309',
};

// Mapeo de producto (nombre completo) a código de carrera — para importación CSV Zoho
export const PRODUCTO_A_CARRERA: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const pairs: [string, string][] = [
    ['Diseñador Gráfico', 'GF'],
    ['Diseñador Digital', 'WE'],
    ['Licenciatura en Animación y Videojuegos', 'LV'],
    ['Licenciatura en Diseño Multimedia', 'LD'],
    ['Licenciatura en Diseño, Arte y Tecnología', 'LT'],
    ['Licenciatura en Diseño de Modas', 'WY'],
    ['Licenciatura en Diseño Gráfico', 'LG'],
    ['Desarrollo y Producción de Videojuegos', 'VD'],
    ['Diseño de Interfaces', 'UI'],
    ['Licenciatura en Diseño Industrial', 'YN'],
  ];
  for (const [name, code] of pairs) {
    const key = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    map[key] = code;
  }
  return map;
})();

// Normalizador de texto (elimina tildes, minúsculas, trim)
export const normalizeText = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// CSV parser compartido
export const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
};

// Mapear producto a carrera con normalización
export const mapProductoACarrera = (producto: string): string | null => {
  const key = normalizeText(producto);
  return PRODUCTO_A_CARRERA[key] || null;
};
