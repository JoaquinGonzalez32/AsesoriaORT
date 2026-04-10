import React from 'react';
import { SectionConfig, ReportType, ReportFilters } from './reportTypes';
import {
  LeadKPIs, OppKPIs, RasKPIs, BarItem,
  computeLeadKPIs, computeOppKPIs, computeRasKPIs,
  computeLeadsByResultado, computeLeadsResultadoHorario,
  computeOppsByFase, computeByCarrera,
  computeRasesByResultado, computeRasesByAgente,
} from './reportSections';
import { Lead, Oportunidad, RAS } from '../../types';
import { MESES } from '../../lib/shared-constants';

interface Props {
  reportType: ReportType;
  filters: ReportFilters;
  sections: SectionConfig[];
  leads: Lead[];
  opportunities: Oportunidad[];
  rases: RAS[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const formatDate = () => {
  const d = new Date();
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

function filtersDescription(filters: ReportFilters, reportType: ReportType): string {
  const parts: string[] = [];
  if (reportType === 'oportunidades') {
    if (filters.proceso) parts.push(filters.proceso);
  } else {
    if (filters.mes) {
      const [y, m] = filters.mes.split('-');
      const mesName = MESES.find(x => x.val === m)?.name || m;
      parts.push(`${mesName} ${y}`);
    }
  }
  if (filters.estado) parts.push(filters.estado);
  if (filters.carrera) parts.push(filters.carrera);
  if (filters.desde || filters.hasta) {
    const desde = filters.desde || '...';
    const hasta = filters.hasta || '...';
    parts.push(`${desde} → ${hasta}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Todos';
}

const reportTitle: Record<ReportType, string> = {
  leads: 'Informe de Leads',
  oportunidades: 'Informe de Oportunidades',
  rases: 'Informe de RASES',
};

// ─── Bar component ────────────────────────────────────────────────────────
const HBar: React.FC<{ items: BarItem[] }> = ({ items }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 text-right text-[11px] font-bold text-gray-600 shrink-0 truncate">{item.label}</span>
          <div className="flex-1 h-[22px] bg-gray-100 rounded-md overflow-hidden relative">
            <div
              className="h-full rounded-md flex items-center justify-end pr-2 transition-all"
              style={{ width: `${Math.max((item.value / max) * 100, 2)}%`, backgroundColor: item.color }}
            >
              {item.value > 0 && <span className="text-[10px] font-extrabold text-white">{item.value}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── KPI cards ────────────────────────────────────────────────────────────
const KPICard: React.FC<{ value: number; label: string; colorClass?: string }> = ({ value, label, colorClass = 'text-gray-900' }) => (
  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
    <div className={`text-3xl font-extrabold ${colorClass}`}>{value}</div>
    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const ProgressBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({ value, max: maxVal, color, label }) => (
  <div className="mt-2">
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${maxVal > 0 ? (value / maxVal) * 100 : 0}%`, backgroundColor: color }} />
    </div>
    <div className="text-[11px] text-gray-500 font-semibold mt-1">{label}</div>
  </div>
);

// ─── Section renderers ────────────────────────────────────────────────────
const SectionWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-[13px] font-extrabold text-blue-800 uppercase tracking-[1.5px] mb-4 pb-1.5 border-b border-gray-200">{title}</h3>
    {children}
  </div>
);

const renderLeadSection = (id: string, title: string, leads: Lead[]) => {
  switch (id) {
    case 'leads-kpi': {
      const kpi = computeLeadKPIs(leads);
      return (
        <SectionWrapper key={id} title={title}>
          <div className="flex gap-4">
            <KPICard value={kpi.total} label="Total Leads" />
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-green-600">{kpi.contactados}</div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Contactados</div>
              <ProgressBar value={kpi.contactados} max={kpi.total} color="#16a34a" label={`${kpi.contactados} de ${kpi.total} contactados (${kpi.pctContactados}%)`} />
            </div>
          </div>
        </SectionWrapper>
      );
    }
    case 'leads-resultado': {
      const data = computeLeadsByResultado(leads);
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    case 'leads-tabla': {
      const { rows, totals } = computeLeadsResultadoHorario(leads);
      return (
        <SectionWrapper key={id} title={title}>
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr>
                <th className="bg-gray-100 text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Resultado</th>
                <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Mañana</th>
                <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Tarde</th>
                <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Noche</th>
                <th className="bg-gray-100 text-right px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                  <td className="px-3 py-2 text-gray-700">{r.resultado}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{r.manana}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{r.tarde}</td>
                  <td className="px-3 py-2 text-center text-gray-600">{r.noche}</td>
                  <td className="px-3 py-2 text-right font-bold text-gray-800">{r.total}</td>
                </tr>
              ))}
              <tr className="font-extrabold border-t-2 border-gray-300">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-center">{totals.manana}</td>
                <td className="px-3 py-2 text-center">{totals.tarde}</td>
                <td className="px-3 py-2 text-center">{totals.noche}</td>
                <td className="px-3 py-2 text-right">{totals.total}</td>
              </tr>
            </tbody>
          </table>
        </SectionWrapper>
      );
    }
    case 'leads-detalle': {
      const display = leads.slice(0, 50);
      return (
        <SectionWrapper key={id} title={title}>
          {leads.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay leads con los filtros seleccionados</p>
          ) : (
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-100 text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Nombre</th>
                  <th className="bg-gray-100 text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Carrera</th>
                  <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Resultado</th>
                  <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Horario</th>
                  <th className="bg-gray-100 text-center px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Intentos</th>
                  <th className="bg-gray-100 text-left px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {display.map((l, i) => (
                  <tr key={l.lead_id} className={i % 2 === 1 ? 'bg-gray-50/50' : ''}>
                    <td className="px-3 py-2 font-bold text-gray-800">{l.nombre}</td>
                    <td className="px-3 py-2"><span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">{l.carrera_interes || '—'}</span></td>
                    <td className="px-3 py-2 text-center text-gray-600">{l.resultado_llamada}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{l.horario_llamada || '—'}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{l.intentos_llamado}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-500 max-w-[180px] truncate">{l.comentario || ''}</td>
                  </tr>
                ))}
                {leads.length > 50 && (
                  <tr><td colSpan={6} className="text-center text-gray-400 text-[11px] py-3">... y {leads.length - 50} leads mas</td></tr>
                )}
              </tbody>
            </table>
          )}
        </SectionWrapper>
      );
    }
    default: return null;
  }
};

const renderOppSection = (id: string, title: string, opps: Oportunidad[]) => {
  switch (id) {
    case 'opps-kpi': {
      const kpi = computeOppKPIs(opps);
      return (
        <SectionWrapper key={id} title={title}>
          <div className="flex gap-4">
            <KPICard value={kpi.total} label="Oportunidades" />
            <KPICard value={kpi.contactos} label="Contactos" colorClass="text-purple-600" />
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-extrabold text-green-600">{kpi.inscriptos}</div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Inscriptos</div>
              <ProgressBar value={kpi.inscriptos} max={kpi.total} color="#16a34a" label={`${kpi.inscriptos} de ${kpi.total} (${kpi.pctInscriptos}%)`} />
            </div>
          </div>
        </SectionWrapper>
      );
    }
    case 'opps-pipeline': {
      const data = computeOppsByFase(opps);
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    case 'opps-carreras': {
      const data = computeByCarrera(opps);
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    default: return null;
  }
};

const renderRasSection = (id: string, title: string, rases: RAS[]) => {
  switch (id) {
    case 'rases-kpi': {
      const kpi = computeRasKPIs(rases);
      return (
        <SectionWrapper key={id} title={title}>
          <div className="flex gap-4">
            <KPICard value={kpi.total} label="Total RASES" />
            <KPICard value={kpi.presencial} label="Presencial" colorClass="text-blue-600" />
            <KPICard value={kpi.enLinea} label="En Linea" colorClass="text-sky-500" />
          </div>
        </SectionWrapper>
      );
    }
    case 'rases-resultado': {
      const data = computeRasesByResultado(rases);
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    case 'rases-agente': {
      const data = computeRasesByAgente(rases);
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    case 'rases-carrera': {
      const data = computeByCarrera(rases.map(r => ({ carrera_interes: r.carrera })));
      return <SectionWrapper key={id} title={title}><HBar items={data} /></SectionWrapper>;
    }
    default: return null;
  }
};

// ─── Main preview ─────────────────────────────────────────────────────────
const ReportPreview: React.FC<Props> = ({ reportType, filters, sections, leads, opportunities, rases }) => {
  const enabledSections = sections.filter(s => s.enabled);

  if (enabledSections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
          <p className="font-bold text-sm">No hay secciones activas</p>
          <p className="text-xs mt-1">Activa al menos una seccion para ver el preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="bg-white shadow-lg rounded-lg mx-auto max-w-[820px] min-h-[600px]" style={{ padding: '48px 52px' }}>
        {/* Header */}
        <div className="flex justify-between items-end border-b-[3px] border-blue-800 pb-5 mb-8">
          <div>
            <h1 className="text-[22px] font-extrabold text-blue-800 tracking-tight">{reportTitle[reportType]}</h1>
            <p className="text-[13px] text-gray-400 mt-1">CRM Asesoria ORT</p>
          </div>
          <div className="text-right text-[12px] text-gray-400 leading-relaxed">
            <div><strong className="text-gray-600">Fecha:</strong> {formatDate()}</div>
            <div><strong className="text-gray-600">Filtros:</strong> {filtersDescription(filters, reportType)}</div>
          </div>
        </div>

        {/* Sections */}
        {enabledSections.map(s => {
          switch (reportType) {
            case 'leads': return renderLeadSection(s.id, s.title, leads);
            case 'oportunidades': return renderOppSection(s.id, s.title, opportunities);
            case 'rases': return renderRasSection(s.id, s.title, rases);
          }
        })}

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-200 flex justify-between text-[10px] text-gray-300">
          <span>CRM Asesoria ORT - Informe generado automaticamente</span>
          <span>Pagina 1 de 1</span>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
