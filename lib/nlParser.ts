import { FaseOportunidad } from '../types';

export interface SmartCondition {
  carrera: string;
  fase: FaseOportunidad | null;
}

export type NLOperator = 'AND' | 'OR';

export interface ParsedNLQuery {
  conditions: SmartCondition[];
  operator: NLOperator;
  rasAgendada?: boolean;
  rasAsistio?: boolean;
}

const CARRERAS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

// Orden importa: "no interesad" debe ir antes de "interesad"
const FASE_STEMS: { stem: string; fase: FaseOportunidad }[] = [
  { stem: 'no interesad', fase: FaseOportunidad.NoInteresado },
  { stem: 'inscript',     fase: FaseOportunidad.Inscripto },
  { stem: 'interesad',    fase: FaseOportunidad.Interesado },
  { stem: 'evaluand',     fase: FaseOportunidad.Evaluando },
  { stem: 'contactad',    fase: FaseOportunidad.Contactado },
  { stem: 'promesa',      fase: FaseOportunidad.PromesaInscripcion },
];

// Conectores que dividen condiciones con fases distintas
// Almacenados sin tildes — se comparan con texto normalizado
const CONNECTORS = [
  'tambien tengan interes en',
  'tambien tengan',
  'que tambien tengan interes en',
  'que tambien tengan',
  'que tengan interes en',
  'que tengan',
  'con interes en',
  'y tambien',
  'ademas tengan',
  'ademas',
];

/** Quita tildes/diacríticos para comparación accent-insensitive */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function detectCarreras(text: string): string[] {
  const found: string[] = [];
  for (const c of CARRERAS) {
    const re = new RegExp(`(?<![A-Za-z])${c}(?![A-Za-z])`, 'i');
    if (re.test(text)) {
      found.push(c.toUpperCase());
    }
  }
  return found;
}

function detectFase(text: string): FaseOportunidad | null {
  const norm = normalize(text);
  for (const { stem, fase } of FASE_STEMS) {
    if (norm.includes(stem)) return fase;
  }
  return null;
}

function detectRas(text: string): { rasAgendada?: boolean; rasAsistio?: boolean } {
  const norm = normalize(text);
  const result: { rasAgendada?: boolean; rasAsistio?: boolean } = {};

  if (/con ras agendada|ras agendad|tienen ras/.test(norm)) result.rasAgendada = true;
  if (/sin ras agendada|sin ras/.test(norm)) result.rasAgendada = false;
  if (/asistieron|asistio|ras realizada|ras hecha/.test(norm)) result.rasAsistio = true;
  if (/no asistieron|no asistio/.test(norm)) result.rasAsistio = false;

  return result;
}

function detectOperator(text: string): NLOperator {
  const norm = normalize(text);
  // Detectar " o " como conjunción OR (word boundary)
  if (/\b(?:o|or)\b/.test(norm)) return 'OR';
  return 'AND';
}

function splitByConnectors(text: string): string[] {
  let remaining = text;
  const segments: string[] = [];

  // Sort connectors by length descending to prefer longest match
  const sorted = [...CONNECTORS].sort((a, b) => b.length - a.length);

  while (remaining.length > 0) {
    let splitIdx = -1;
    let connectorLen = 0;

    const norm = normalize(remaining);
    for (const connector of sorted) {
      const idx = norm.indexOf(connector);
      if (idx !== -1 && (splitIdx === -1 || idx < splitIdx)) {
        splitIdx = idx;
        connectorLen = connector.length;
      }
    }

    if (splitIdx === -1) {
      segments.push(remaining.trim());
      break;
    }

    segments.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx + connectorLen).trim();
  }

  return segments.filter(s => s.length > 0);
}

export function parseNLQuery(query: string): ParsedNLQuery {
  const ras = detectRas(query);
  const operator = detectOperator(query);
  const segments = splitByConnectors(query);

  const conditions: SmartCondition[] = [];

  for (const segment of segments) {
    const carreras = detectCarreras(segment);
    const fase = detectFase(segment);

    for (const carrera of carreras) {
      conditions.push({ carrera, fase });
    }
  }

  return {
    conditions,
    operator,
    ...ras,
  };
}
