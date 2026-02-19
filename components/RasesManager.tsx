import React, { useMemo, useState, useRef } from 'react';
import { RAS, ModalidadRAS } from '../types';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { exportChartsAsImage, exportChartsAsCSV, ChartData } from '../lib/exportChart';

interface RasesManagerProps {
  rases: RAS[];
  onAdd?: (ras: any) => void;
  onDelete: (id: string) => void;
}

const RasesManager: React.FC<RasesManagerProps> = ({ rases, onAdd, onDelete }) => {
  const [filter, setFilter] = useState('');
  const [tituloFilter, setTituloFilter] = useState('');
  const [agenteFilter, setAgenteFilter] = useState('');
  const [modalidadFilter, setModalidadFilter] = useState('');
  const [carreraFilter, setCarreraFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [rasToDelete, setRasToDelete] = useState<RAS | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MESES = [
    { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
    { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
    { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
    { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' }
  ];

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

  const AGENTE_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488', '#ca8a04', '#be185d', '#6d28d9'];
  const CARRERA_COLORS = ['#9333ea', '#6366f1', '#8b5cf6', '#a855f7', '#7c3aed', '#c084fc', '#818cf8', '#a78bfa', '#d8b4fe', '#e9d5ff'];

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
                ...(stats.carreraData.length > 0 ? [{ title: 'RAS por Carrera', data: stats.carreraData.map((d, i) => ({ ...d, color: CARRERA_COLORS[i % CARRERA_COLORS.length] })), type: 'bar' as const }] : []),
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
                <span className="text-[10px] font-bold text-gray-600">P: {stats.presencial}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-[10px] font-bold text-gray-600">OL: {stats.online}</span>
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
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2 max-h-10 overflow-y-auto">
            {stats.agenteData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: AGENTE_COLORS[i % AGENTE_COLORS.length]}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}: {d.value}</span>
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
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.carreraData}>
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24} animationDuration={500}>
                  {stats.carreraData.map((_, index) => (
                    <Cell key={`cr-${index}`} fill={CARRERA_COLORS[index % CARRERA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {stats.carreraData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: CARRERA_COLORS[i % CARRERA_COLORS.length]}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}


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
            <select value={agenteFilter} onChange={(e) => setAgenteFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold text-blue-700 cursor-pointer">
              <option value="">Todos</option>
              {filterOptions.agentes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Modalidad</label>
            <select value={modalidadFilter} onChange={(e) => setModalidadFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold text-blue-700 cursor-pointer">
              <option value="">Todas</option>
              {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carrera</label>
            <select value={carreraFilter} onChange={(e) => setCarreraFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold text-purple-700 cursor-pointer">
              <option value="">Todas</option>
              {filterOptions.carreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Estado Oportunidad</label>
            <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold text-green-700 cursor-pointer">
              <option value="">Todos</option>
              {filterOptions.estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Mes</label>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold text-gray-700 cursor-pointer">
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

      {/* Rases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRases.length > 0 ? (
          activeRases.map((ras) => (
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
                {ras.carrera && (
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Carrera</span>
                    <span className="ml-2 text-xs font-black text-purple-600">{ras.carrera}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-50 flex items-center justify-end">
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
          ))
        ) : (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-400 font-medium">No hay reuniones agendadas que coincidan.</p>
          </div>
        )}
      </div>

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