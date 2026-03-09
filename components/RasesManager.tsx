import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RAS, Oportunidad, ModalidadRAS } from '../types';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { exportChartsAsImage, exportChartsAsCSV, ChartData } from '../lib/exportChart';

interface RasesManagerProps {
  rases: RAS[];
  opportunities: Oportunidad[];
  onAdd?: (ras: any) => void;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const AGENTES_RAS = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucia Nazur', 'Fabian Barros', 'Maria Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez'
];

const CARRERAS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

const RasesManager: React.FC<RasesManagerProps> = ({ rases, opportunities, onAdd, onUpdate, onDelete }) => {
  const navigateToOpp = useNavigate();
  const [filter, setFilter] = useState('');
  const [tituloFilter, setTituloFilter] = useState('');
  const [agenteFilter, setAgenteFilter] = useState('');
  const [modalidadFilter, setModalidadFilter] = useState('');
  const [carreraFilter, setCarreraFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [rasToDelete, setRasToDelete] = useState<RAS | null>(null);
  const [rasToEdit, setRasToEdit] = useState<RAS | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MESES = [
    { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
    { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
    { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
    { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' }
  ];

  const oppFaseMap = useMemo(() => {
    const map: Record<string, string> = {};
    opportunities.forEach(o => { map[o.opp_id] = o.fase_oportunidad; });
    return map;
  }, [opportunities]);

  const filterOptions = useMemo(() => {
    const valid = rases.filter(r => !r.deleted_at);
    const agentes = [...new Set(valid.map(r => r.agente_nombre))].sort();
    const carreras = [...new Set(valid.map(r => r.carrera).filter(Boolean))].sort();
    const estados = [...new Set(valid.map(r => r.estado_oportunidad).filter(Boolean))].sort();
    return { agentes, carreras, estados };
  }, [rases]);

  const hasFilters = filter || tituloFilter || agenteFilter || modalidadFilter || carreraFilter || estadoFilter || dateFrom || dateTo || monthFilter;

  const resetAllFilters = () => {
    setFilter(''); setTituloFilter(''); setAgenteFilter('');
    setModalidadFilter(''); setCarreraFilter(''); setEstadoFilter('');
    setDateFrom(''); setDateTo(''); setMonthFilter('');
  };

  const activeRases = useMemo(() => {
    return rases.filter(r => {
      if (r.deleted_at) return false;
      const search = filter.toLowerCase();
      const matchesNombre = !filter || r.nombre_interesado.toLowerCase().includes(search);
      const matchesTitulo = !tituloFilter || r.titulo.toLowerCase().includes(tituloFilter.toLowerCase());
      const matchesAgente = !agenteFilter || r.agente_nombre === agenteFilter;
      const matchesModalidad = !modalidadFilter || r.modalidad === modalidadFilter;
      const matchesCarrera = !carreraFilter || r.carrera === carreraFilter;
      const matchesEstado = !estadoFilter || r.estado_oportunidad === estadoFilter;
      const fechaStr = r.fecha_hora.split('T')[0];
      const matchesDateFrom = !dateFrom || fechaStr >= dateFrom;
      const matchesDateTo = !dateTo || fechaStr <= dateTo;
      const rasMonth = fechaStr.split('-')[1];
      const matchesMonth = !monthFilter || rasMonth === monthFilter;
      return matchesNombre && matchesTitulo && matchesAgente && matchesModalidad && matchesCarrera && matchesEstado && matchesDateFrom && matchesDateTo && matchesMonth;
    });
  }, [rases, filter, tituloFilter, agenteFilter, modalidadFilter, carreraFilter, estadoFilter, dateFrom, dateTo, monthFilter]);

  const FASE_STYLE: Record<string, string> = {
    'Interesado': 'bg-blue-100 text-blue-700',
    'Evaluando': 'bg-blue-50 text-blue-500',
    'Contactado': 'bg-amber-100 text-amber-700',
    'No interesado': 'bg-red-100 text-red-700',
    'Promesa de Inscripción': 'bg-green-100 text-green-700',
    'Inscripto': 'bg-green-200 text-green-800',
  };
  const AGENTE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#ca8a04', '#be185d', '#6d28d9'];
  const CARRERA_HEX: Record<string, string> = {
    'LV': '#0ea5e9', 'WY': '#8b5cf6', 'LT': '#f43f5e', 'LD': '#14b8a6', 'YN': '#f97316',
    'LG': '#6366f1', 'VD': '#ec4899', 'UI': '#06b6d4', 'GF': '#a855f7', 'WE': '#eab308',
  };
  const CARRERA_FALLBACK = ['#0ea5e9', '#8b5cf6', '#f43f5e', '#14b8a6', '#f97316', '#6366f1', '#ec4899', '#06b6d4', '#a855f7', '#eab308'];

  const stats = useMemo(() => {
    const total = activeRases.length;
    const presencial = activeRases.filter(r => r.modalidad === ModalidadRAS.Presencial).length;
    const online = activeRases.filter(r => r.modalidad === ModalidadRAS.EnLinea).length;
    const pieData = [
      { name: 'Presencial', value: presencial, color: '#2563eb' },
      { name: 'En Línea', value: online, color: '#38bdf8' }
    ];

    const agenteMap: Record<string, number> = {};
    activeRases.forEach(r => { agenteMap[r.agente_nombre] = (agenteMap[r.agente_nombre] || 0) + 1; });
    const agenteData = Object.entries(agenteMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const topAgente = agenteData.length > 0 ? agenteData[0] : null;

    const carreraMap: Record<string, number> = {};
    activeRases.forEach(r => { if (r.carrera) carreraMap[r.carrera] = (carreraMap[r.carrera] || 0) + 1; });
    const carreraData = Object.entries(carreraMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return { total, presencial, online, pieData, agenteData, topAgente, carreraData };
  }, [activeRases]);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAdd) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((h, i) => obj[h] = values[i]);
        return obj;
      });

      let importedCount = 0;
      for (const item of data) {
        if (!item.titulo || !item.nombre_interesado) continue;
        await onAdd({
          opp_id: null, 
          titulo: item.titulo,
          nombre_interesado: item.nombre_interesado,
          agente_nombre: item.agente_nombre || 'Sin asignar',
          fecha_hora: item.fecha_hora || new Date().toISOString(),
          modalidad: (item.modalidad as ModalidadRAS) || ModalidadRAS.Presencial,
          carrera: item.carrera || '',
          estado_oportunidad: item.estado_oportunidad || 'Pendiente'
        });
        importedCount++;
      }
      alert(`Se importaron ${importedCount} reuniones correctamente.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const confirmDelete = () => {
    if (rasToDelete) {
      onDelete(rasToDelete.ras_id);
      setRasToDelete(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rasToEdit) return;
    const fd = new FormData(e.currentTarget);
    onUpdate(rasToEdit.ras_id, {
      titulo: fd.get('titulo') as string,
      nombre_interesado: fd.get('nombre_interesado') as string,
      agente_nombre: fd.get('agente_nombre') as string,
      fecha_hora: (fd.get('fecha_hora') as string) || rasToEdit.fecha_hora,
      modalidad: fd.get('modalidad') as ModalidadRAS,
      carrera: fd.get('carrera') as string,
    });
    setRasToEdit(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda de RASES</h2>
          <p className="text-sm text-gray-500">Control de reuniones de asesoramiento</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <button
            onClick={() => {
              const charts: ChartData[] = [
                { title: 'Modalidad', data: stats.pieData.map(d => ({ name: d.name, value: d.value, color: d.color })), type: 'pie' },
                { title: 'RAS por Agente', data: stats.agenteData.map((d, i) => ({ ...d, color: AGENTE_COLORS[i % AGENTE_COLORS.length] })), type: 'bar-horizontal' },
                ...(stats.carreraData.length > 0 ? [{ title: 'RAS por Carrera', data: stats.carreraData.map((d, i) => ({ ...d, color: CARRERA_HEX[d.name] || CARRERA_FALLBACK[i % CARRERA_FALLBACK.length] })), type: 'bar' as const }] : []),
              ];
              exportChartsAsImage(charts, 'rases_graficas');
            }}
            className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Imagen
          </button>
          <button
            onClick={() => {
              const charts: ChartData[] = [
                { title: 'Modalidad', data: stats.pieData.map(d => ({ name: d.name, value: d.value })), type: 'pie' },
                { title: 'RAS por Agente', data: stats.agenteData, type: 'bar-horizontal' },
                ...(stats.carreraData.length > 0 ? [{ title: 'RAS por Carrera', data: stats.carreraData, type: 'bar' as const }] : []),
              ];
              exportChartsAsCSV(charts, 'rases_datos');
            }}
            className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 transition-all flex items-center gap-2 active:scale-95"
          >
            Importar CSV
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <button
        type="button"
        onClick={() => setShowCharts(!showCharts)}
        className="w-full flex items-center justify-between bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
          <span className="text-sm font-bold text-gray-900">Gráficas y KPIs</span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showCharts ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {showCharts && (<>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Citas Filtradas</p>
          <h4 className="text-3xl font-black text-gray-900">{stats.total}</h4>
          <p className="text-xs text-blue-600 font-bold mt-1">de {rases.filter(r => !r.deleted_at).length} totales</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Top Agente</p>
          <h4 className="text-lg font-black text-gray-900 truncate">{stats.topAgente?.name || '—'}</h4>
          <p className="text-xs text-green-600 font-bold mt-1">{stats.topAgente ? `${stats.topAgente.value} reuniones` : 'Sin datos'}</p>
        </div>

        {/* Modalidad Pie */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-20 h-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.pieData} innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value" animationDuration={500}>
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modalidad</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-[10px] font-bold text-gray-600">Presencial: {stats.presencial}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-[10px] font-bold text-gray-600">En línea: {stats.online}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RAS por Agente */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            RAS por Agente
          </h5>
          <div className="h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.agenteData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10} animationDuration={500}>
                  {stats.agenteData.map((_, index) => (
                    <Cell key={`ag-${index}`} fill={AGENTE_COLORS[index % AGENTE_COLORS.length]} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 800, fill: '#6b7280' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 max-h-10 overflow-y-auto">
            {stats.agenteData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: AGENTE_COLORS[i % AGENTE_COLORS.length]}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carrera Distribution */}
      {stats.carreraData.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-600 rounded-full"></span>
            RAS por Carrera
          </h5>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.carreraData} margin={{ top: 18, right: 5, left: 5, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={500} maxBarSize={36}>
                  {stats.carreraData.map((d, index) => (
                    <Cell key={`cr-${index}`} fill={CARRERA_HEX[d.name] || CARRERA_FALLBACK[index % CARRERA_FALLBACK.length]} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      </>)}

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Nombre Interesado</label>
            <input type="text" placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Título RAS</label>
            <input type="text" placeholder="Buscar título..." value={tituloFilter} onChange={(e) => setTituloFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">¿Quien hace RAS?</label>
            <select value={agenteFilter} onChange={(e) => setAgenteFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${agenteFilter ? 'text-blue-700' : 'text-gray-700'}`}>
              <option value="">Todos</option>
              {filterOptions.agentes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Modalidad</label>
            <select value={modalidadFilter} onChange={(e) => setModalidadFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${modalidadFilter ? 'text-blue-700' : 'text-gray-700'}`}>
              <option value="">Todas</option>
              {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carrera</label>
            <select value={carreraFilter} onChange={(e) => setCarreraFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${carreraFilter ? 'text-blue-700' : 'text-gray-700'}`}>
              <option value="">Todas</option>
              {filterOptions.carreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Estado Oportunidad</label>
            <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${estadoFilter ? 'text-blue-700' : 'text-gray-700'}`}>
              <option value="">Todos</option>
              {filterOptions.estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Mes</label>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${monthFilter ? 'text-blue-700' : 'text-gray-700'}`}>
              <option value="">Todos</option>
              {MESES.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Desde</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Hasta</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full" />
          </div>
          <div className="flex items-end">
            {hasFilters && (
              <button onClick={resetAllFilters} className="w-full bg-gray-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-black transition-all shadow-md active:scale-95">Limpiar</button>
            )}
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-bold">{activeRases.length} reuniones</p>
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Cards
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Lista
          </button>
        </div>
      </div>

      {/* Rases Content */}
      {activeRases.length === 0 ? (
        <div className="py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
          <p className="text-gray-400 font-medium">No hay reuniones agendadas que coincidan.</p>
        </div>
      ) : viewMode === 'cards' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRases.map((ras) => (
            <div key={ras.ras_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    ras.modalidad === ModalidadRAS.Presencial ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                  }`}>
                    {ras.modalidad}
                  </span>
                  <span className="text-[10px] font-bold opacity-80">
                    {new Date(ras.fecha_hora).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">{ras.titulo}</h3>
              </div>
              <div className="p-5 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-800">
                  <p>
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Interesado</span>
                    {ras.nombre_interesado}
                  </p>
                  <p>
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">¿Quien hace RAS?</span>
                    {ras.agente_nombre}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {ras.carrera && (
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Carrera</span>
                      <span className="ml-2 text-xs font-black text-purple-600">{ras.carrera}</span>
                    </div>
                  )}
                  {oppFaseMap[ras.opp_id] && (
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Fase</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black ${FASE_STYLE[oppFaseMap[ras.opp_id]] || 'bg-gray-100 text-gray-600'}`}>{oppFaseMap[ras.opp_id]}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-end gap-4">
                  {ras.opp_id && (
                    <button
                      onClick={() => navigateToOpp(`/opportunities/${ras.opp_id}`)}
                      className="text-gray-400 hover:text-purple-600 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                      Ver Opp
                    </button>
                  )}
                  <button
                    onClick={() => setRasToEdit(ras)}
                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button
                    onClick={() => setRasToDelete(ras)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Título</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Interesado</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agente</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Modalidad</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Carrera</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fase</th>
                <th className="text-right px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody>
              {activeRases.map((ras) => (
                <tr key={ras.ras_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-bold text-gray-600 whitespace-nowrap">{new Date(ras.fecha_hora).toLocaleDateString('es-ES')}</td>
                  <td className="px-5 py-3 text-xs font-bold text-gray-900 max-w-[200px] truncate">{ras.titulo}</td>
                  <td className="px-5 py-3 text-xs font-bold text-gray-800">{ras.nombre_interesado}</td>
                  <td className="px-5 py-3 text-xs font-bold text-gray-800">{ras.agente_nombre}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      ras.modalidad === ModalidadRAS.Presencial ? 'bg-blue-100 text-blue-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {ras.modalidad}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs font-black text-purple-600">{ras.carrera || '—'}</td>
                  <td className="px-5 py-3">
                    {oppFaseMap[ras.opp_id] ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${FASE_STYLE[oppFaseMap[ras.opp_id]] || 'bg-gray-100 text-gray-600'}`}>{oppFaseMap[ras.opp_id]}</span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {ras.opp_id && (
                        <button
                          onClick={() => navigateToOpp(`/opportunities/${ras.opp_id}`)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                          title="Ver Oportunidad"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        </button>
                      )}
                      <button
                        onClick={() => setRasToEdit(ras)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={() => setRasToDelete(ras)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {rasToEdit && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveEdit}>
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Editar Reunión</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Título</label>
                    <input name="titulo" defaultValue={rasToEdit.titulo} required className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Interesado</label>
                      <input name="nombre_interesado" defaultValue={rasToEdit.nombre_interesado} required className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">¿Quien hace RAS?</label>
                      <select name="agente_nombre" defaultValue={rasToEdit.agente_nombre} required className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer">
                        {AGENTES_RAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Fecha</label>
                      <input name="fecha_hora" type="date" defaultValue={rasToEdit.fecha_hora.split('T')[0]} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Modalidad</label>
                      <select name="modalidad" defaultValue={rasToEdit.modalidad} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer">
                        {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carrera</label>
                      <select name="carrera" defaultValue={rasToEdit.carrera} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer">
                        <option value="">Sin carrera</option>
                        {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50/80 px-8 py-6 flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setRasToEdit(null)} className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-2xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-8 py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Deletion Modal */}
      {rasToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                <svg width="32" height="32" className="text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">¿Eliminar esta reunión?</h3>
              <p className="text-sm text-gray-500 leading-relaxed px-4">
                Estás a punto de borrar la reunión con <span className="font-bold text-gray-900">"{rasToDelete.nombre_interesado}"</span>. 
                Esta acción es permanente y eliminará el registro de la agenda.
              </p>
            </div>
            
            <div className="bg-gray-50/80 px-8 py-6 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setRasToDelete(null)} 
                className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-2xl transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-8 py-3 bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RasesManager;