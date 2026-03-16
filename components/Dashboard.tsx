import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { Lead, Oportunidad, RAS, ResultadoLlamada, ResultadoRAS, FaseOportunidad, ModalidadRAS } from '../types';
import { exportChartsAsImage, exportChartsAsCSV, ChartData } from '../lib/exportChart';

interface DashboardProps {
  leads: Lead[];
  opportunities: Oportunidad[];
  rases: RAS[];
}

const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];
const MESES = [
  { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
  { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
  { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
  { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' }
];
const PROCESO_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = 2023; y <= 2030; y++) { opts.push(`Marzo ${y}`, `Agosto ${y}`); }
  return opts;
})();

const RESULTADO_HEX: Record<string, string> = {
  [ResultadoLlamada.SinGestion]: '#94a3b8',
  [ResultadoLlamada.PrimerContacto]: '#1d4ed8',
  [ResultadoLlamada.Contactado]: '#15803d',
  [ResultadoLlamada.Interesado]: '#047857',
  [ResultadoLlamada.NoInteresado]: '#b91c1c',
  [ResultadoLlamada.NumeroIncorrecto]: '#4b5563',
  [ResultadoLlamada.LlamarMasTarde]: '#b45309',
};
const AGENTE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#ca8a04', '#be185d', '#6d28d9'];
const CARRERA_COLORS = ['#9333ea', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#c084fc', '#818cf8', '#a78bfa', '#d8b4fe', '#e9d5ff'];

const FASE_HEX: Record<string, string> = {
  [FaseOportunidad.Interesado]: '#3b82f6',
  [FaseOportunidad.Evaluando]: '#60a5fa',
  [FaseOportunidad.Contactado]: '#f59e0b',
  [FaseOportunidad.NoInteresado]: '#ef4444',
  [FaseOportunidad.PromesaInscripcion]: '#22c55e',
  [FaseOportunidad.Inscripto]: '#16a34a',
};

const CARRERA_HEX: Record<string, string> = {
  'LV': '#0ea5e9', 'WY': '#8b5cf6', 'LT': '#f43f5e', 'LD': '#14b8a6',
  'YN': '#f97316', 'LG': '#6366f1', 'VD': '#ec4899', 'UI': '#06b6d4',
  'GF': '#a855f7', 'WE': '#eab308',
};

const Dashboard: React.FC<DashboardProps> = ({ leads, opportunities, rases }) => {
  // ---- Global vs Month toggle ----
  const [globalView, setGlobalView] = useState<'general' | 'mes'>('general');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const filterYearMonth = `${selectedYear}-${selectedMonth}`;

  // ---- Global KPI (no filters) ----
  const activeLeads = useMemo(() => leads.filter(l => !l.deleted_at), [leads]);
  const activeOpps = useMemo(() => opportunities.filter(o => !o.deleted_at), [opportunities]);
  const activeRasesAll = useMemo(() => (rases || []).filter(r => !r.deleted_at), [rases]);

  const kpiLeads = useMemo(() => {
    if (globalView === 'general') return activeLeads;
    return activeLeads.filter(l => l.fecha_lead.slice(0, 7) === filterYearMonth);
  }, [activeLeads, globalView, filterYearMonth]);

  const kpiOpps = useMemo(() => {
    if (globalView === 'general') return activeOpps;
    return activeOpps.filter(o => o.created_at && o.created_at.slice(0, 7) === filterYearMonth);
  }, [activeOpps, globalView, filterYearMonth]);

  const globalStats = useMemo(() => ({
    totalLeads: kpiLeads.length,
    primerContacto: kpiLeads.filter(l => l.resultado_llamada === ResultadoLlamada.PrimerContacto).length,
    contactados: kpiLeads.filter(l => l.resultado_llamada === ResultadoLlamada.Contactado).length,
    interesados: kpiLeads.filter(l => l.resultado_llamada === ResultadoLlamada.Interesado).length,
    totalOpps: kpiOpps.length,
    rasAgendadas: kpiOpps.filter(o => o.ras_agendada).length,
    rasRealizadas: activeRasesAll.filter(r => r.resultado_ras === ResultadoRAS.Realizada).length,
  }), [kpiLeads, kpiOpps, activeRasesAll]);

  const funnelData = [
    { name: 'Nuevos (1er C)', value: globalStats.primerContacto, color: '#3b82f6' },
    { name: 'Contactados', value: globalStats.contactados, color: '#06b6d4' },
    { name: 'Interesados', value: globalStats.interesados, color: '#f59e0b' },
    { name: 'Oportunidades', value: globalStats.totalOpps, color: '#22c55e' },
  ];

  // ---- Collapsible section states ----
  const [leadSectionOpen, setLeadSectionOpen] = useState(true);
  const [oppSectionOpen, setOppSectionOpen] = useState(true);
  const [rasSectionOpen, setRasSectionOpen] = useState(true);

  // ---- Chart visibility toggles ----
  const [showLeadChart, setShowLeadChart] = useState(true);
  const [showOppPipeline, setShowOppPipeline] = useState(true);
  const [showOppCarreras, setShowOppCarreras] = useState(true);
  const [showRasModalidad, setShowRasModalidad] = useState(true);
  const [showRasAgente, setShowRasAgente] = useState(true);
  const [showRasCarrera, setShowRasCarrera] = useState(true);

  // ==================== LEADS SECTION ====================
  const [leadStatusFilter, setLeadStatusFilter] = useState('');
  const [leadMonthFilter, setLeadMonthFilter] = useState('');

  const filteredLeads = useMemo(() => {
    return activeLeads.filter(l => {
      const matchesStatus = !leadStatusFilter || l.resultado_llamada === leadStatusFilter;
      const leadMonth = l.fecha_lead.split('-')[1];
      const matchesMonth = !leadMonthFilter || leadMonth === leadMonthFilter;
      return matchesStatus && matchesMonth;
    });
  }, [activeLeads, leadStatusFilter, leadMonthFilter]);

  const leadStats = useMemo(() => {
    let chartData;
    let chartTitle;
    if (leadStatusFilter) {
      chartTitle = `Carreras en estado: ${leadStatusFilter}`;
      const careerMap: Record<string, number> = {};
      filteredLeads.forEach(l => { careerMap[l.carrera_interes] = (careerMap[l.carrera_interes] || 0) + 1; });
      chartData = Object.entries(careerMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    } else {
      chartTitle = 'Distribución por Resultado de Llamada';
      chartData = Object.values(ResultadoLlamada).map(res => ({
        name: res,
        value: filteredLeads.filter(l => l.resultado_llamada === res).length,
      })).sort((a, b) => b.value - a.value);
    }
    return { total: filteredLeads.length, chartData, chartTitle };
  }, [filteredLeads, leadStatusFilter]);

  // ==================== OPPORTUNITIES SECTION ====================
  const [oppFaseFilter, setOppFaseFilter] = useState('');
  const [oppCareerFilter, setOppCareerFilter] = useState('');
  const [oppProcesoFilter, setOppProcesoFilter] = useState('');

  const filteredOpps = useMemo(() => {
    return activeOpps.filter(o => {
      const matchesFase = !oppFaseFilter || o.fase_oportunidad === oppFaseFilter;
      const matchesCareer = !oppCareerFilter || o.carrera_interes === oppCareerFilter;
      const matchesProceso = !oppProcesoFilter || o.proceso_inicio === oppProcesoFilter;
      return matchesFase && matchesCareer && matchesProceso;
    });
  }, [activeOpps, oppFaseFilter, oppCareerFilter, oppProcesoFilter]);

  const oppStats = useMemo(() => {
    const pipelineData = Object.values(FaseOportunidad).map(fase => ({
      name: fase,
      value: filteredOpps.filter(o => o.fase_oportunidad === fase).length,
    }));
    const careerMap: Record<string, number> = {};
    filteredOpps.forEach(o => { careerMap[o.carrera_interes] = (careerMap[o.carrera_interes] || 0) + 1; });
    const careerData = Object.entries(careerMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { total: filteredOpps.length, inscriptos: filteredOpps.filter(o => o.fase_oportunidad === FaseOportunidad.Inscripto).length, pipelineData, careerData };
  }, [filteredOpps]);

  // ==================== RASES SECTION ====================
  const [rasAgenteFilter, setRasAgenteFilter] = useState('');
  const [rasModalidadFilter, setRasModalidadFilter] = useState('');
  const [rasCarreraFilter, setRasCarreraFilter] = useState('');
  const [rasMonthFilter, setRasMonthFilter] = useState('');

  const activeRases = useMemo(() => (rases || []).filter(r => !r.deleted_at), [rases]);

  const rasFilterOptions = useMemo(() => {
    const agentes = [...new Set(activeRases.map(r => r.agente_nombre))].sort();
    const carreras = [...new Set(activeRases.map(r => r.carrera).filter(Boolean))].sort();
    return { agentes, carreras };
  }, [activeRases]);

  const filteredRases = useMemo(() => {
    return activeRases.filter(r => {
      const matchesAgente = !rasAgenteFilter || r.agente_nombre === rasAgenteFilter;
      const matchesModalidad = !rasModalidadFilter || r.modalidad === rasModalidadFilter;
      const matchesCarrera = !rasCarreraFilter || r.carrera === rasCarreraFilter;
      const fechaStr = r.fecha_hora.split('T')[0];
      const rasMonth = fechaStr.split('-')[1];
      const matchesMonth = !rasMonthFilter || rasMonth === rasMonthFilter;
      return matchesAgente && matchesModalidad && matchesCarrera && matchesMonth;
    });
  }, [activeRases, rasAgenteFilter, rasModalidadFilter, rasCarreraFilter, rasMonthFilter]);

  const rasStats = useMemo(() => {
    const presencial = filteredRases.filter(r => r.modalidad === ModalidadRAS.Presencial).length;
    const online = filteredRases.filter(r => r.modalidad === ModalidadRAS.EnLinea).length;
    const pieData = [
      { name: 'Presencial', value: presencial, color: '#2563eb' },
      { name: 'En Línea', value: online, color: '#38bdf8' },
    ];
    const agenteMap: Record<string, number> = {};
    filteredRases.forEach(r => { agenteMap[r.agente_nombre] = (agenteMap[r.agente_nombre] || 0) + 1; });
    const agenteData = Object.entries(agenteMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const carreraMap: Record<string, number> = {};
    filteredRases.forEach(r => { if (r.carrera) carreraMap[r.carrera] = (carreraMap[r.carrera] || 0) + 1; });
    const carreraData = Object.entries(carreraMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { total: filteredRases.length, presencial, online, pieData, agenteData, carreraData };
  }, [filteredRases]);

  // ---- Helpers ----
  const StatCard = ({ title, value, sub, iconColor, highlight }: { title: string; value: number; sub: string; iconColor: string; highlight?: boolean }) => (
    <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-between hover:shadow-md transition-shadow group ${highlight ? 'bg-gray-50 border-gray-200 ring-1 ring-gray-200' : 'bg-white border-gray-100'}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">{title}</h3>
          <div className={`w-3 h-3 rounded-full ${iconColor} shadow-inner group-hover:scale-125 transition-transform`}></div>
        </div>
        <div className={`font-black text-gray-900 ${highlight ? 'text-5xl' : 'text-4xl'}`}>{value}</div>
      </div>
      <div className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub}</div>
    </div>
  );

  const SectionHeader = ({ title, subtitle, open, onToggle, color }: { title: string; subtitle: string; open: boolean; onToggle: () => void; color: string }) => (
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3">
        <span className={`w-1.5 h-8 rounded-full ${color}`}></span>
        <div className="text-left">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
      </div>
      <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  );

  const EyeToggle = ({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border ${visible ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 border-gray-200 text-gray-400 line-through hover:bg-gray-200'}`}>
      {visible ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      )}
      {label}
    </button>
  );

  const selectClass = "bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* ============= HEADER ============= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel de Asesoría</h2>
          <p className="text-gray-500 mt-1 font-medium">Control en tiempo real del embudo comercial</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Período de datos</span>
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setGlobalView('general')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${globalView === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setGlobalView('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${globalView === 'mes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mensual
            </button>
          </div>
          {globalView === 'mes' && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {MESES.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Array.from({ length: 8 }, (_, i) => String(2023 + i)).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ============= GLOBAL KPI CARDS (grouped by funnel stage) ============= */}
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Captación */}
        <div className="flex-1 bg-blue-50/40 rounded-2xl p-3 border border-blue-100/60">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2 px-1">Captación</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard title="Total Leads" value={globalStats.totalLeads} sub="Base de Datos" iconColor="bg-blue-500" highlight />
            <StatCard title="1er Contacto" value={globalStats.primerContacto} sub="Nuevos" iconColor="bg-sky-500" />
            <StatCard title="Contactados" value={globalStats.contactados} sub="Efectividad" iconColor="bg-cyan-500" />
            <StatCard title="Interesados" value={globalStats.interesados} sub="Calificados" iconColor="bg-yellow-500" />
          </div>
        </div>
        {/* Cierre */}
        <div className="xl:w-[320px] bg-green-50/40 rounded-2xl p-3 border border-green-100/60">
          <p className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-2 px-1">Cierre</p>
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="RAS Agend." value={globalStats.rasAgendadas} sub="Agendados" iconColor="bg-indigo-500" />
            <StatCard title="Result. RAS" value={globalStats.rasRealizadas} sub="Cierres" iconColor="bg-green-500" highlight />
          </div>
        </div>
      </div>

      {/* ============= FUNNEL + TOP CARRERAS ============= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[450px]">
          <h3 className="text-lg font-bold mb-8 text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Estado del Embudo
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: '13px', fontWeight: 800, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
            Top Carreras por Interés
          </h3>
          <div className="space-y-5">
            {Array.from(new Set(kpiLeads.map(l => l.carrera_interes))).filter(Boolean)
              .map(carrera => ({ carrera, count: kpiLeads.filter(l => l.carrera_interes === carrera).length }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 6).map(({ carrera, count }, idx) => {
              const percentage = Math.round((count / kpiLeads.length) * 100) || 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-sky-500'];
              return (
                <div key={carrera} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-700">{carrera}</span>
                    <span className="text-gray-400 font-black">{percentage}% <span className="text-[10px] opacity-50">({count})</span></span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                    <div className={`${colors[idx % colors.length]} h-full transition-all duration-1000 group-hover:brightness-110`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
            {kpiLeads.length === 0 && (
              <div className="py-10 text-center text-gray-400 italic">No hay datos de carreras registrados</div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ============= LEADS CHARTS SECTION ============= */}
      {/* ============================================================ */}
      <SectionHeader title="Leads" subtitle={`${leadStats.total} prospectos filtrados`} open={leadSectionOpen} onToggle={() => setLeadSectionOpen(p => !p)} color="bg-blue-600" />
      {leadSectionOpen && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-48">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Estado</label>
                <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)} className={`${selectClass} text-blue-700`}>
                  <option value="">Todos los Estados</option>
                  {Object.values(ResultadoLlamada).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Mes</label>
                <select value={leadMonthFilter} onChange={e => setLeadMonthFilter(e.target.value)} className={`${selectClass} text-gray-700`}>
                  <option value="">Todos los Meses</option>
                  {MESES.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
                </select>
              </div>
              {(leadStatusFilter || leadMonthFilter) && (
                <button onClick={() => { setLeadStatusFilter(''); setLeadMonthFilter(''); }} className="text-gray-400 hover:text-red-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                  Limpiar
                </button>
              )}
              <div className="flex items-end gap-2 ml-auto">
                <EyeToggle label="Resultado" visible={showLeadChart} onToggle={() => setShowLeadChart(p => !p)} />
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showLeadChart) charts.push({
                    title: leadStats.chartTitle,
                    data: leadStats.chartData.map((d, i) => ({ ...d, color: RESULTADO_HEX[d.name] || (i % 2 === 0 ? '#2563eb' : '#93c5fd') })),
                    type: 'bar-horizontal',
                  });
                  if (charts.length > 0) exportChartsAsImage(charts, 'dashboard_leads_graficas');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Imagen
                </button>
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showLeadChart) charts.push({
                    title: leadStats.chartTitle,
                    data: leadStats.chartData,
                    type: 'bar-horizontal',
                  });
                  if (charts.length > 0) exportChartsAsCSV(charts, 'dashboard_leads_datos');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  CSV
                </button>
              </div>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 grid grid-cols-1 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prospectos Filtrados</p>
                <h4 className="text-3xl font-black text-gray-900">{leadStats.total}</h4>
                <p className="text-xs text-blue-600 font-bold mt-1">de {activeLeads.length} totales</p>
              </div>
            </div>
            {showLeadChart && (
            <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                {leadStats.chartTitle}
              </h5>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadStats.chartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12} animationDuration={500}>
                      {leadStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RESULTADO_HEX[entry.name] || (index % 2 === 0 ? '#2563eb' : '#93c5fd')} />
                      ))}
                      <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 800, fill: '#6b7280' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 max-h-12 overflow-y-auto">
                {leadStats.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RESULTADO_HEX[d.name] || (i % 2 === 0 ? '#2563eb' : '#93c5fd') }}></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ============= OPPORTUNITIES CHARTS SECTION ============= */}
      {/* ============================================================ */}
      <SectionHeader title="Oportunidades" subtitle={`${oppStats.total} oportunidades filtradas`} open={oppSectionOpen} onToggle={() => setOppSectionOpen(p => !p)} color="bg-purple-600" />
      {oppSectionOpen && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-44">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Fase</label>
                <select value={oppFaseFilter} onChange={e => setOppFaseFilter(e.target.value)} className={`${selectClass} text-blue-700`}>
                  <option value="">Todas</option>
                  {Object.values(FaseOportunidad).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-36">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carrera</label>
                <select value={oppCareerFilter} onChange={e => setOppCareerFilter(e.target.value)} className={`${selectClass} text-purple-700`}>
                  <option value="">Todas</option>
                  {CARRERAS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-44">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Proceso Inicio</label>
                <select value={oppProcesoFilter} onChange={e => setOppProcesoFilter(e.target.value)} className={`${selectClass} text-gray-700`}>
                  <option value="">Todos</option>
                  {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {(oppFaseFilter || oppCareerFilter || oppProcesoFilter) && (
                <button onClick={() => { setOppFaseFilter(''); setOppCareerFilter(''); setOppProcesoFilter(''); }} className="text-gray-400 hover:text-red-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                  Limpiar
                </button>
              )}
              <div className="flex items-end gap-2 ml-auto">
                <EyeToggle label="Pipeline" visible={showOppPipeline} onToggle={() => setShowOppPipeline(p => !p)} />
                <EyeToggle label="Carreras" visible={showOppCarreras} onToggle={() => setShowOppCarreras(p => !p)} />
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showOppPipeline) charts.push({ title: 'Pipeline Actual', data: oppStats.pipelineData.map(d => ({ ...d, color: FASE_HEX[d.name] || '#2563eb' })), type: 'bar' });
                  if (showOppCarreras) charts.push({ title: 'Mix de Carreras', data: oppStats.careerData.map((d, i) => ({ ...d, color: CARRERA_HEX[d.name] || CARRERA_COLORS[i % CARRERA_COLORS.length] })), type: 'bar' });
                  if (charts.length > 0) exportChartsAsImage(charts, 'dashboard_oportunidades_graficas');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Imagen
                </button>
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showOppPipeline) charts.push({ title: 'Pipeline Actual', data: oppStats.pipelineData, type: 'bar' });
                  if (showOppCarreras) charts.push({ title: 'Mix de Carreras', data: oppStats.careerData, type: 'bar' });
                  if (charts.length > 0) exportChartsAsCSV(charts, 'dashboard_oportunidades_datos');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  CSV
                </button>
              </div>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Opps Filtradas</p>
              <h4 className="text-3xl font-black text-gray-900">{oppStats.total}</h4>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscriptos</p>
              <h4 className="text-3xl font-black text-green-600">{oppStats.inscriptos}</h4>
            </div>
            {showOppPipeline && (
            <div className="md:col-span-2 lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pipeline Actual</p>
              <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oppStats.pipelineData} margin={{ top: 15, right: 5, left: 5, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20} animationDuration={500}>
                      {oppStats.pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={FASE_HEX[entry.name] || '#2563eb'} />
                      ))}
                      <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}
            {showOppCarreras && (
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mix de Carreras</p>
              <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oppStats.careerData} margin={{ top: 15, right: 5, left: 5, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20} animationDuration={500}>
                      {oppStats.careerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CARRERA_HEX[entry.name] || CARRERA_COLORS[index % CARRERA_COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ============= RASES CHARTS SECTION ============= */}
      {/* ============================================================ */}
      <SectionHeader title="RASES" subtitle={`${rasStats.total} reuniones filtradas`} open={rasSectionOpen} onToggle={() => setRasSectionOpen(p => !p)} color="bg-green-600" />
      {rasSectionOpen && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-44">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Agente</label>
                <select value={rasAgenteFilter} onChange={e => setRasAgenteFilter(e.target.value)} className={`${selectClass} text-blue-700`}>
                  <option value="">Todos</option>
                  {rasFilterOptions.agentes.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Modalidad</label>
                <select value={rasModalidadFilter} onChange={e => setRasModalidadFilter(e.target.value)} className={`${selectClass} text-blue-700`}>
                  <option value="">Todas</option>
                  {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-36">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carrera</label>
                <select value={rasCarreraFilter} onChange={e => setRasCarreraFilter(e.target.value)} className={`${selectClass} text-purple-700`}>
                  <option value="">Todas</option>
                  {rasFilterOptions.carreras.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="w-full sm:w-40">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Mes</label>
                <select value={rasMonthFilter} onChange={e => setRasMonthFilter(e.target.value)} className={`${selectClass} text-gray-700`}>
                  <option value="">Todos</option>
                  {MESES.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
                </select>
              </div>
              {(rasAgenteFilter || rasModalidadFilter || rasCarreraFilter || rasMonthFilter) && (
                <button onClick={() => { setRasAgenteFilter(''); setRasModalidadFilter(''); setRasCarreraFilter(''); setRasMonthFilter(''); }} className="text-gray-400 hover:text-red-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap">
                  Limpiar
                </button>
              )}
              <div className="flex items-end gap-2 ml-auto">
                <EyeToggle label="Modalidad" visible={showRasModalidad} onToggle={() => setShowRasModalidad(p => !p)} />
                <EyeToggle label="Agente" visible={showRasAgente} onToggle={() => setShowRasAgente(p => !p)} />
                <EyeToggle label="Carrera" visible={showRasCarrera} onToggle={() => setShowRasCarrera(p => !p)} />
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showRasModalidad) charts.push({ title: 'Modalidad', data: rasStats.pieData.map(d => ({ name: d.name, value: d.value, color: d.color })), type: 'pie' });
                  if (showRasAgente) charts.push({ title: 'RAS por Agente', data: rasStats.agenteData.map((d, i) => ({ ...d, color: AGENTE_COLORS[i % AGENTE_COLORS.length] })), type: 'bar-horizontal' });
                  if (showRasCarrera && rasStats.carreraData.length > 0) charts.push({ title: 'RAS por Carrera', data: rasStats.carreraData.map((d, i) => ({ ...d, color: CARRERA_HEX[d.name] || CARRERA_COLORS[i % CARRERA_COLORS.length] })), type: 'bar' });
                  if (charts.length > 0) exportChartsAsImage(charts, 'dashboard_rases_graficas');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Imagen
                </button>
                <button onClick={() => {
                  const charts: ChartData[] = [];
                  if (showRasModalidad) charts.push({ title: 'Modalidad', data: rasStats.pieData.map(d => ({ name: d.name, value: d.value })), type: 'pie' });
                  if (showRasAgente) charts.push({ title: 'RAS por Agente', data: rasStats.agenteData, type: 'bar-horizontal' });
                  if (showRasCarrera && rasStats.carreraData.length > 0) charts.push({ title: 'RAS por Carrera', data: rasStats.carreraData, type: 'bar' });
                  if (charts.length > 0) exportChartsAsCSV(charts, 'dashboard_rases_datos');
                }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  CSV
                </button>
              </div>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Citas Filtradas</p>
              <h4 className="text-3xl font-black text-gray-900">{rasStats.total}</h4>
              <p className="text-xs text-blue-600 font-bold mt-1">de {activeRases.length} totales</p>
            </div>
            {/* Modalidad Pie */}
            {showRasModalidad && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-20 h-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={rasStats.pieData} innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value" animationDuration={500}>
                      {rasStats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modalidad</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span className="text-[10px] font-bold text-gray-600">Presencial: {rasStats.presencial}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span className="text-[10px] font-bold text-gray-600">En línea: {rasStats.online}</span>
                  </div>
                </div>
              </div>
            </div>
            )}
            {/* RAS por Agente */}
            {showRasAgente && (
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                RAS por Agente
              </h5>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rasStats.agenteData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10} animationDuration={500}>
                      {rasStats.agenteData.map((_, index) => (
                        <Cell key={`ag-${index}`} fill={AGENTE_COLORS[index % AGENTE_COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 800, fill: '#6b7280' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2 max-h-10 overflow-y-auto">
                {rasStats.agenteData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: AGENTE_COLORS[i % AGENTE_COLORS.length] }}></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          {/* RAS por Carrera */}
          {showRasCarrera && rasStats.carreraData.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-purple-600 rounded-full"></span>
                RAS por Carrera
              </h5>
              <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rasStats.carreraData} margin={{ top: 15, right: 5, left: 5, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24} animationDuration={500}>
                      {rasStats.carreraData.map((entry, index) => (
                        <Cell key={`cr-${index}`} fill={CARRERA_HEX[entry.name] || CARRERA_COLORS[index % CARRERA_COLORS.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {rasStats.carreraData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CARRERA_HEX[d.name] || CARRERA_COLORS[i % CARRERA_COLORS.length] }}></span>
                    <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
