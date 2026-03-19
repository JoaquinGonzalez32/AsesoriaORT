import { Lead, Oportunidad, RAS, ResultadoLlamada, FaseOportunidad, HorarioLlamada, ModalidadRAS, ResultadoRAS } from '../../types';
import { RESULTADO_HEX, FASE_HEX, CARRERA_HEX, CARRERAS_OPTIONS, AGENTES_RAS, AGENTE_COLORS } from '../../lib/shared-constants';
import { SectionConfig, ReportType, ReportFilters } from './reportTypes';

// ─── Default sections per report type ─────────────────────────────────────
export function getDefaultSections(type: ReportType): SectionConfig[] {
  switch (type) {
    case 'leads':
      return [
        { id: 'leads-kpi', title: 'Indicadores Clave', defaultTitle: 'Indicadores Clave', description: 'Total de leads y cantidad contactados con barra de progreso.', enabled: true, type: 'kpi' },
        { id: 'leads-resultado', title: 'Distribucion por Resultado de Llamada', defaultTitle: 'Distribucion por Resultado de Llamada', description: 'Grafica de barras con la cantidad de leads por cada resultado de llamada.', enabled: true, type: 'chart' },
        { id: 'leads-tabla', title: 'Resumen por Resultado y Horario', defaultTitle: 'Resumen por Resultado y Horario', description: 'Tabla cruzada de resultado de llamada vs. horario (Mañana, Tarde, Noche).', enabled: true, type: 'table' },
        { id: 'leads-detalle', title: 'Detalle de Leads', defaultTitle: 'Detalle de Leads', description: 'Listado individual de cada lead con nombre, carrera, resultado, horario, intentos y comentario.', enabled: false, type: 'detail' },
      ];
    case 'oportunidades':
      return [
        { id: 'opps-kpi', title: 'Indicadores Clave', defaultTitle: 'Indicadores Clave', description: 'Total de oportunidades, contactos e inscriptos con barra de progreso.', enabled: true, type: 'kpi' },
        { id: 'opps-pipeline', title: 'Pipeline por Fase', defaultTitle: 'Pipeline por Fase', description: 'Distribucion de oportunidades en las 6 fases del pipeline comercial.', enabled: true, type: 'chart' },
        { id: 'opps-carreras', title: 'Mix de Carreras', defaultTitle: 'Mix de Carreras', description: 'Cantidad de oportunidades por cada carrera de interes.', enabled: true, type: 'chart' },
      ];
    case 'rases':
      return [
        { id: 'rases-kpi', title: 'Indicadores Clave', defaultTitle: 'Indicadores Clave', description: 'Total de RASES y desglose entre presencial y en linea.', enabled: true, type: 'kpi' },
        { id: 'rases-resultado', title: 'Resultado RAS', defaultTitle: 'Resultado RAS', description: 'Distribucion de RASES por resultado: Pendiente, Realizada, Frustrada, Cancelada.', enabled: true, type: 'chart' },
        { id: 'rases-agente', title: 'RAS por Agente', defaultTitle: 'RAS por Agente', description: 'Cantidad de RASES asignadas a cada agente, ordenadas de mayor a menor.', enabled: true, type: 'chart' },
        { id: 'rases-carrera', title: 'RAS por Carrera', defaultTitle: 'RAS por Carrera', description: 'Cantidad de RASES agrupadas por carrera de interes.', enabled: true, type: 'chart' },
      ];
  }
}

// ─── Filter helpers ───────────────────────────────────────────────────────
export function filterLeads(leads: Lead[], filters: ReportFilters): Lead[] {
  return leads.filter(l => {
    if (l.deleted_at) return false;
    if (filters.mes && l.fecha_lead.slice(0, 7) !== filters.mes) return false;
    if (filters.estado && l.resultado_llamada !== filters.estado) return false;
    if (filters.carrera && l.carrera_interes !== filters.carrera) return false;
    return true;
  });
}

export function filterOpps(opps: Oportunidad[], filters: ReportFilters): Oportunidad[] {
  return opps.filter(o => {
    if (o.deleted_at) return false;
    if (filters.proceso && o.proceso_inicio !== filters.proceso) return false;
    if (filters.estado && o.fase_oportunidad !== filters.estado) return false;
    if (filters.carrera && o.carrera_interes !== filters.carrera) return false;
    if (filters.desde && (o.fecha_lead || '') < filters.desde) return false;
    if (filters.hasta && (o.fecha_lead || '') > filters.hasta) return false;
    return true;
  });
}

export function filterRases(rases: RAS[], filters: ReportFilters): RAS[] {
  return rases.filter(r => {
    if (r.deleted_at) return false;
    if (filters.mes && r.fecha_hora.slice(0, 7) !== filters.mes) return false;
    if (filters.estado && r.resultado_ras !== filters.estado) return false;
    if (filters.carrera && r.carrera !== filters.carrera) return false;
    const fechaStr = (r.fecha_hora || '').split('T')[0];
    if (filters.desde && fechaStr < filters.desde) return false;
    if (filters.hasta && fechaStr > filters.hasta) return false;
    return true;
  });
}

// ─── KPI computation ──────────────────────────────────────────────────────
export interface LeadKPIs { total: number; contactados: number; pctContactados: number }
export function computeLeadKPIs(leads: Lead[]): LeadKPIs {
  const total = leads.length;
  const contactados = leads.filter(l =>
    l.resultado_llamada !== ResultadoLlamada.SinGestion
  ).length;
  return { total, contactados, pctContactados: total > 0 ? Math.round((contactados / total) * 100) : 0 };
}

export interface OppKPIs { total: number; contactos: number; inscriptos: number; pctInscriptos: number }
export function computeOppKPIs(opps: Oportunidad[]): OppKPIs {
  const total = opps.length;
  const contactos = opps.filter(o =>
    o.fase_oportunidad !== FaseOportunidad.Interesado
  ).length;
  const inscriptos = opps.filter(o => o.fase_oportunidad === FaseOportunidad.Inscripto).length;
  return { total, contactos, inscriptos, pctInscriptos: total > 0 ? Math.round((inscriptos / total) * 100) : 0 };
}

export interface RasKPIs { total: number; presencial: number; enLinea: number }
export function computeRasKPIs(rases: RAS[]): RasKPIs {
  const total = rases.length;
  const presencial = rases.filter(r => r.modalidad === ModalidadRAS.Presencial).length;
  return { total, presencial, enLinea: total - presencial };
}

// ─── Chart data ───────────────────────────────────────────────────────────
export interface BarItem { label: string; value: number; color: string }

export function computeLeadsByResultado(leads: Lead[]): BarItem[] {
  const counts: Record<string, number> = {};
  Object.values(ResultadoLlamada).forEach(r => { counts[r] = 0; });
  leads.forEach(l => { counts[l.resultado_llamada] = (counts[l.resultado_llamada] || 0) + 1; });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value, color: RESULTADO_HEX[label] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value);
}

export function computeLeadsResultadoHorario(leads: Lead[]): { rows: { resultado: string; manana: number; tarde: number; noche: number; total: number }[]; totals: { manana: number; tarde: number; noche: number; total: number } } {
  const resultados = Object.values(ResultadoLlamada);
  const map: Record<string, { manana: number; tarde: number; noche: number }> = {};
  resultados.forEach(r => { map[r] = { manana: 0, tarde: 0, noche: 0 }; });

  leads.forEach(l => {
    const r = l.resultado_llamada;
    if (!map[r]) return;
    if (l.horario_llamada === HorarioLlamada.Manana) map[r].manana++;
    else if (l.horario_llamada === HorarioLlamada.Tarde) map[r].tarde++;
    else if (l.horario_llamada === HorarioLlamada.Noche) map[r].noche++;
  });

  const rows = resultados.map(r => ({
    resultado: r,
    manana: map[r].manana,
    tarde: map[r].tarde,
    noche: map[r].noche,
    total: map[r].manana + map[r].tarde + map[r].noche,
  })).filter(r => r.total > 0).sort((a, b) => b.total - a.total);

  const totals = rows.reduce((acc, r) => ({
    manana: acc.manana + r.manana,
    tarde: acc.tarde + r.tarde,
    noche: acc.noche + r.noche,
    total: acc.total + r.total,
  }), { manana: 0, tarde: 0, noche: 0, total: 0 });

  return { rows, totals };
}

export function computeOppsByFase(opps: Oportunidad[]): BarItem[] {
  const counts: Record<string, number> = {};
  Object.values(FaseOportunidad).forEach(f => { counts[f] = 0; });
  opps.forEach(o => { counts[o.fase_oportunidad] = (counts[o.fase_oportunidad] || 0) + 1; });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value, color: FASE_HEX[label] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value);
}

export function computeByCarrera(items: { carrera_interes?: string; carrera?: string }[]): BarItem[] {
  const counts: Record<string, number> = {};
  CARRERAS_OPTIONS.forEach(c => { counts[c] = 0; });
  items.forEach(i => {
    const c = ('carrera_interes' in i ? i.carrera_interes : (i as any).carrera) || '';
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value, color: CARRERA_HEX[label] || '#94a3b8' }))
    .sort((a, b) => b.value - a.value);
}

export function computeRasesByResultado(rases: RAS[]): BarItem[] {
  const order = Object.values(ResultadoRAS);
  const colors: Record<string, string> = {
    [ResultadoRAS.Realizada]: '#16a34a',
    [ResultadoRAS.Pendiente]: '#3b82f6',
    [ResultadoRAS.Frustrada]: '#ef4444',
    [ResultadoRAS.Cancelada]: '#94a3b8',
  };
  const counts: Record<string, number> = {};
  order.forEach(r => { counts[r] = 0; });
  rases.forEach(r => { counts[r.resultado_ras] = (counts[r.resultado_ras] || 0) + 1; });
  return order.map(r => ({ label: r, value: counts[r], color: colors[r] || '#94a3b8' })).sort((a, b) => b.value - a.value);
}

export function computeRasesByAgente(rases: RAS[]): BarItem[] {
  const counts: Record<string, number> = {};
  rases.forEach(r => {
    if (r.agente_nombre) counts[r.agente_nombre] = (counts[r.agente_nombre] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, color: AGENTE_COLORS[i % AGENTE_COLORS.length] }));
}
