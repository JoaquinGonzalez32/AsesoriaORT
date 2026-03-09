import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Lead, ResultadoLlamada, HorarioLlamada, ModalidadRAS, FaseOportunidad, LiceoTipo } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { exportChartsAsImage, exportChartsAsCSV, ChartData } from '../lib/exportChart';

interface LeadsManagerProps {
  leads: Lead[];
  onAdd: (lead: Omit<Lead, 'lead_id' | 'created_at' | 'updated_at'>) => void;
  onUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onConvert: (lead: Lead, extra: any) => void;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, onAdd, onUpdate, onDelete, onConvert }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [showConvertModal, setShowConvertModal] = useState<Lead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [rasAgendada, setRasAgendada] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const hasModal = showModal || !!leadToDelete || !!showConvertModal;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal, leadToDelete, showConvertModal]);

  const RESULTADO_COLOR: Record<string, string> = {
    [ResultadoLlamada.PrimerContacto]: 'bg-blue-100 text-blue-700',
    [ResultadoLlamada.Contactado]: 'bg-green-100 text-green-700',
    [ResultadoLlamada.Interesado]: 'bg-emerald-100 text-emerald-700',
    [ResultadoLlamada.NoInteresado]: 'bg-red-100 text-red-700',
    [ResultadoLlamada.NumeroIncorrecto]: 'bg-gray-100 text-gray-600',
    [ResultadoLlamada.LlamarMasTarde]: 'bg-amber-100 text-amber-700',
  };

  const RESULTADO_HEX: Record<string, string> = {
    [ResultadoLlamada.PrimerContacto]: '#3b82f6',
    [ResultadoLlamada.Contactado]: '#22c55e',
    [ResultadoLlamada.Interesado]: '#16a34a',
    [ResultadoLlamada.NoInteresado]: '#ef4444',
    [ResultadoLlamada.NumeroIncorrecto]: '#f97316',
    [ResultadoLlamada.LlamarMasTarde]: '#60a5fa',
  };

  const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];
  const MESES = [
    { val: '01', name: 'Enero' }, { val: '02', name: 'Febrero' }, { val: '03', name: 'Marzo' },
    { val: '04', name: 'Abril' }, { val: '05', name: 'Mayo' }, { val: '06', name: 'Junio' },
    { val: '07', name: 'Julio' }, { val: '08', name: 'Agosto' }, { val: '09', name: 'Septiembre' },
    { val: '10', name: 'Octubre' }, { val: '11', name: 'Noviembre' }, { val: '12', name: 'Diciembre' }
  ];

  const activeLeads = useMemo(() => {
    return (leads || []).filter(l => {
      const s = filter.toLowerCase();
      const matchesSearch = !filter || l.nombre.toLowerCase().includes(s);
      const matchesStatus = !statusFilter || l.resultado_llamada === statusFilter;
      const leadMonth = l.fecha_lead.split('-')[1];
      const matchesMonth = !monthFilter || leadMonth === monthFilter;
      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [leads, filter, statusFilter, monthFilter]);

  const stats = useMemo(() => {
    const total = activeLeads.length;
    const contactados = activeLeads.filter(l => l.resultado_llamada === ResultadoLlamada.Contactado || l.resultado_llamada === ResultadoLlamada.Interesado).length;
    let chartData;
    let chartTitle;

    if (statusFilter) {
      chartTitle = `Carreras en estado: ${statusFilter}`;
      const careerMap: Record<string, number> = {};
      activeLeads.forEach(l => {
        careerMap[l.carrera_interes] = (careerMap[l.carrera_interes] || 0) + 1;
      });
      chartData = Object.entries(careerMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    } else {
      chartTitle = "Distribución por Resultado de Llamada";
      chartData = Object.values(ResultadoLlamada).map(res => ({
        name: res,
        value: activeLeads.filter(l => l.resultado_llamada === res).length
      })).sort((a, b) => b.value - a.value);
    }

    return { total, contactados, chartData, chartTitle };
  }, [activeLeads, statusFilter]);

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        if (!item.nombre) continue;
        await onAdd({
          nombre: item.nombre,
          carrera_interes: item.carrera_interes || 'LV',
          fecha_lead: new Date().toISOString().split('T')[0],
          resultado_llamada: (item.resultado_llamada as ResultadoLlamada) || ResultadoLlamada.PrimerContacto,
          horario_llamada: (item.horario_llamada as HorarioLlamada) || null,
          intentos_llamado: 1,
          comentario: item.comentario || 'Importado vía CSV',
          owner: null,
        });
        importedCount++;
      }
      alert(`Se importaron ${importedCount} leads correctamente.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const openCreateModal = () => { setEditingLead(null); setShowModal(true); };
  const openEditModal = (lead: Lead) => { setEditingLead(lead); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingLead(null); };

  const handleSubmitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      if (editingLead) {
        const updated: Lead = {
          ...editingLead,
          nombre: formData.get('nombre') as string,
          carrera_interes: formData.get('carrera_interes') as string,
          resultado_llamada: formData.get('resultado_llamada') as ResultadoLlamada,
          horario_llamada: (formData.get('horario_llamada') as HorarioLlamada) || null,
          intentos_llamado: parseInt(formData.get('intentos_llamado') as string) || 1,
          comentario: formData.get('comentario') as string,
          updated_at: new Date().toISOString(),
        };
        await onUpdate(updated);
      } else {
        const newLeadData: Omit<Lead, 'lead_id' | 'created_at' | 'updated_at'> = {
          nombre: formData.get('nombre') as string,
          carrera_interes: formData.get('carrera_interes') as string,
          fecha_lead: new Date().toISOString().split('T')[0],
          resultado_llamada: formData.get('resultado_llamada') as ResultadoLlamada,
          horario_llamada: (formData.get('horario_llamada') as HorarioLlamada) || null,
          intentos_llamado: 1,
          comentario: formData.get('comentario') as string,
          owner: null,
        };
        await onAdd(newLeadData);
      }
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      onDelete(leadToDelete.lead_id);
      setLeadToDelete(null);
    }
  };

  return (
    <><div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
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
      {showCharts && (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prospectos Filtrados</p>
            <h4 className="text-3xl font-black text-gray-900">{stats.total}</h4>
            <p className="text-xs text-blue-600 font-bold mt-1">de {leads.length} totales</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Efectividad del Filtro</p>
            <h4 className="text-3xl font-black text-green-600">{Math.round((stats.contactados / stats.total) * 100 || 0)}%</h4>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((stats.contactados / stats.total) * 100 || 0)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-medium mt-2">{stats.contactados} de {stats.total} contactados</p>
          </div>
        </div>
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            {stats.chartTitle}
          </h5>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12} animationDuration={500}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RESULTADO_HEX[entry.name] || (index % 2 === 0 ? '#2563eb' : '#93c5fd')} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 800, fill: '#6b7280' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 max-h-12 overflow-y-auto">
            {stats.chartData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: RESULTADO_HEX[d.name] || (i % 2 === 0 ? '#2563eb' : '#93c5fd')}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Leads</h2>
          <p className="text-sm text-gray-500">Administra los prospectos entrantes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-52 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm bg-white"
          />
          <div className="relative w-full sm:w-40">
             <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none bg-white">
              <option value="">Todos los Meses</option>
              {MESES.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
            </select>
          </div>
          <div className="relative w-full sm:w-48">
             <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none bg-white">
              <option value="">Todos los Estados</option>
              {Object.values(ResultadoLlamada).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {(filter || statusFilter || monthFilter) && (
            <button onClick={() => { setFilter(''); setStatusFilter(''); setMonthFilter(''); }} className="w-full sm:w-auto text-gray-400 hover:text-red-500 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 whitespace-nowrap">
              Reiniciar filtros
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <button onClick={() => {
            const charts: ChartData[] = [{
              title: stats.chartTitle,
              data: stats.chartData.map((d, i) => ({ ...d, color: RESULTADO_HEX[d.name] || (i % 2 === 0 ? '#2563eb' : '#93c5fd') })),
              type: 'bar-horizontal',
            }];
            exportChartsAsImage(charts, 'leads_graficas');
          }} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all text-sm active:scale-95 whitespace-nowrap flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Imagen
          </button>
          <button onClick={() => {
            const charts: ChartData[] = [{
              title: stats.chartTitle,
              data: stats.chartData,
              type: 'bar-horizontal',
            }];
            exportChartsAsCSV(charts, 'leads_datos');
          }} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all text-sm active:scale-95 whitespace-nowrap flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            CSV
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-gray-200 transition-all text-sm active:scale-95 whitespace-nowrap">
            Importar CSV
          </button>
          <button onClick={openCreateModal} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
            + Nuevo Lead
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Carrera</th>
              <th className="p-4">Resultado</th>
              <th className="p-4 text-center">Intentos</th>
              <th className="p-4">Comentario</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activeLeads.length > 0 ? (
              activeLeads.map(l => (
                <tr key={l.lead_id} className="border-b border-gray-100 text-sm hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-400 font-medium">{new Date(l.fecha_lead).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-gray-900">{l.nombre}</td>
                  <td className="p-4 font-black text-blue-600">{l.carrera_interes}</td>
                  <td className="p-4">
                    <span className={`${RESULTADO_COLOR[l.resultado_llamada] || 'bg-sky-100 text-sky-700'} text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter`}>
                      {l.resultado_llamada}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-gray-700">{l.intentos_llamado}</span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs max-w-[200px] truncate">
                    {l.comentario || '—'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {l.convertido ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                          Convertido
                        </span>
                      ) : (
                        <button onClick={() => { setShowConvertModal(l); setRasAgendada(false); }} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm hover:bg-blue-700 transition-colors">
                          Convertir
                        </button>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === l.lead_id ? null : l.lead_id); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
                        </button>
                        {openMenuId === l.lead_id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-36 animate-in zoom-in-95 duration-150">
                              <button
                                onClick={() => { openEditModal(l); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Editar
                              </button>
                              <button
                                onClick={() => { setLeadToDelete(l); setOpenMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                Eliminar
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400 font-medium italic">
                  No se encontraron leads con estos criterios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto">
                <form onSubmit={handleSubmitLead} className="flex flex-col max-h-[90vh]">
                  <div className="px-8 py-6 bg-blue-900 text-white rounded-t-2xl shrink-0">
                    <h3 className="text-xl font-bold">{editingLead ? 'Editar Lead' : 'Nuevo Lead'}</h3>
                    <p className="text-blue-200 text-xs mt-1">{editingLead ? 'Modifica los datos del interesado' : 'Ingresa los datos del interesado'}</p>
                  </div>
                  <div className="p-8 space-y-5 overflow-y-auto flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre Completo *</label>
                        <input name="nombre" required defaultValue={editingLead?.nombre} placeholder="Ej: Juan Pérez" className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Carrera Interés *</label>
                        <select name="carrera_interes" required defaultValue={editingLead?.carrera_interes} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                          {CARRERAS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Resultado Llamada</label>
                        <select name="resultado_llamada" defaultValue={editingLead?.resultado_llamada} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold text-sky-700 bg-sky-50 focus:ring-2 focus:ring-blue-500 outline-none">
                          {Object.values(ResultadoLlamada).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Intentos de Llamado</label>
                        <input name="intentos_llamado" type="number" min="0" defaultValue={editingLead?.intentos_llamado ?? 1} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Horario Llamada</label>
                        <select name="horario_llamada" defaultValue={editingLead?.horario_llamada || ''} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="">Sin especificar</option>
                          {Object.values(HorarioLlamada).map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Comentario</label>
                        <textarea name="comentario" rows={3} defaultValue={editingLead?.comentario} className="w-full border-gray-200 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50/50"></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-100 rounded-b-2xl shrink-0">
                    <button type="button" onClick={closeModal} className="px-6 py-2.5 font-bold text-gray-500 rounded-xl transition-colors text-sm">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all text-sm disabled:opacity-50">
                      {isSubmitting ? 'Guardando...' : editingLead ? 'Guardar Cambios' : 'Crear Lead'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {leadToDelete && (
        <>
          <div className="fixed inset-0 z-[70] bg-gray-900/60 backdrop-blur-md" onClick={() => setLeadToDelete(null)} />
          <div className="fixed inset-0 z-[70] overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 pointer-events-auto">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                    <svg width="32" height="32" className="text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">¿Eliminar este lead?</h3>
                  <p className="text-sm text-gray-500 leading-relaxed px-4">
                    Estás a punto de eliminar a <span className="font-bold text-gray-900">"{leadToDelete.nombre}"</span>.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="bg-gray-50/80 px-8 py-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setLeadToDelete(null)}
                    className="flex-1 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-8 py-3 bg-red-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    Eliminar Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showConvertModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowConvertModal(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const rasInfo = rasAgendada ? {
                    agente_nombre: formData.get('ras_agente_nombre'),
                    fecha_hora: formData.get('ras_fecha_hora') && formData.get('ras_hora') ? `${formData.get('ras_fecha_hora')}T${formData.get('ras_hora')}` : formData.get('ras_fecha_hora'),
                    modalidad: formData.get('ras_modalidad'),
                  } : null;
                  onConvert(showConvertModal, {
                    cedula: formData.get('cedula'),
                    telefono: formData.get('telefono'),
                    mail: formData.get('mail'),
                    sape: formData.get('sape'),
                    liceo_tipo: formData.get('liceo_tipo'),
                    ras_agendada: rasAgendada,
                    rasInfo,
                    multiple_interes: false,
                    otros_intereses: [],
                    proceso_inicio: formData.get('proceso_inicio'),
                    fase_oportunidad: formData.get('fase_oportunidad'),
                    comentario_extra: formData.get('comentario_extra'),
                  });
                  setShowConvertModal(null);
                }} className="flex flex-col max-h-[90vh]">
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl shrink-0">
                    <h3 className="text-xl font-bold">Convertir a Oportunidad</h3>
                    <p className="text-sm opacity-80">{showConvertModal.nombre}</p>
                  </div>
                  <div className="p-8 space-y-5 overflow-y-auto flex-1 min-h-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Cédula</label>
                        <input name="cedula" placeholder="Ej: 1.234.567-8" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Teléfono</label>
                        <input name="telefono" placeholder="Ej: 099 123 456" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Mail</label>
                        <input name="mail" type="email" placeholder="ejemplo@mail.com" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">SAPE</label>
                        <input name="sape" placeholder="Código SAPE" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={rasAgendada} onChange={(e) => setRasAgendada(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-blue-600" />
                        <span className="text-sm font-bold group-hover:text-blue-600 uppercase transition-colors">Agendar Reunión (RAS)</span>
                      </label>
                      {rasAgendada && (
                        <div className="space-y-3 pt-3 border-t border-gray-200">
                           <div><label className="text-[10px] font-black text-blue-500 uppercase block mb-1">¿Quien hace RAS?</label><select name="ras_agente_nombre" required className="w-full border-blue-100 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"><option value="">Seleccionar...</option><option value="Natalia Benarducci">Natalia Benarducci</option><option value="Mariana Muzi">Mariana Muzi</option><option value="Bruno Arce">Bruno Arce</option><option value="Diego Miranda">Diego Miranda</option><option value="Alejandro Erramun">Alejandro Erramun</option><option value="Lucia Nazur">Lucia Nazur</option><option value="Fabian Barros">Fabian Barros</option><option value="Maria Podesta">Maria Podesta</option><option value="Fernanda Nuñez">Fernanda Nuñez</option><option value="Pablo Pirotto">Pablo Pirotto</option><option value="Daniel Dominguez">Daniel Dominguez</option></select></div>
                           <div className="grid grid-cols-3 gap-2">
                              <div><label className="text-[10px] font-black text-blue-500 uppercase block mb-1">Fecha</label><input name="ras_fecha_hora" type="date" required className="w-full border-blue-100 border rounded-lg px-2 py-2 text-xs" /></div>
                              <div><label className="text-[10px] font-black text-blue-500 uppercase block mb-1">Hora</label><select name="ras_hora" className="w-full border-blue-100 border rounded-lg px-2 py-2 text-xs"><option value="">--:--</option>{Array.from({length: 48}, (_, i) => {const h = String(Math.floor(i/2)).padStart(2,'0'); const m = i%2===0?'00':'30'; return `${h}:${m}`;}).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                              <div><label className="text-[10px] font-black text-blue-500 uppercase block mb-1">Modalidad</label><select name="ras_modalidad" className="w-full border-blue-100 border rounded-lg px-2 py-2 text-xs">{Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Proceso Inicio</label>
                        <select name="proceso_inicio" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm font-bold">
                           <option value="">Seleccionar...</option>
                           {[2023,2024,2025,2026,2027,2028,2029,2030].flatMap(y => [`Marzo ${y}`, `Agosto ${y}`]).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Fase</label>
                        <select name="fase_oportunidad" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm font-bold">
                           {Object.values(FaseOportunidad).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Tipo Liceo</label>
                        <select name="liceo_tipo" className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm font-bold">
                           {Object.values(LiceoTipo).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-gray-50 flex justify-end gap-4 border-t border-gray-100 rounded-b-2xl shrink-0">
                    <button type="button" onClick={() => setShowConvertModal(null)} className="font-bold text-gray-500">Cancelar</button>
                    <button type="submit" className="bg-green-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all">Confirmar Conversión</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LeadsManager;