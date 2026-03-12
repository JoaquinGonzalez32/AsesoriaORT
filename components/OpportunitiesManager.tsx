import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Oportunidad, FaseOportunidad, LiceoTipo, ModalidadRAS } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { exportChartsAsImage, exportChartsAsCSV, ChartData } from '../lib/exportChart';
import { parseNLQuery, SmartCondition, NLOperator } from '../lib/nlParser';

class OppErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(err: any) { return { error: String(err) }; }
  render() {
    if (this.state.error) return <div className="p-10 text-red-600 font-bold bg-white rounded-xl m-4 border border-red-200"><p>Error en Oportunidades:</p><pre className="text-xs mt-2 whitespace-pre-wrap">{this.state.error}</pre></div>;
    return this.props.children;
  }
}

interface OpportunitiesManagerProps {
  opportunities: Oportunidad[];
  onAdd: (opp: any) => void;
  onUpdate: (opp: Oportunidad, rasInfo?: any) => void;
  onDelete: (id: string) => void;
}

const OpportunitiesManager: React.FC<OpportunitiesManagerProps> = ({ opportunities, onAdd, onUpdate, onDelete }) => {
  const navigateToDetail = useNavigate();
  // Estados de Filtros
  const [filter, setFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [procesoFilter, setProcesoFilter] = useState(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    if (m >= 9) return `Marzo ${y + 1}`;
    if (m >= 4) return `Agosto ${y}`;
    return `Marzo ${y}`;
  });
  const [faseFilter, setFaseFilter] = useState('');
  const [rasAgendadaFilter, setRasAgendadaFilter] = useState('');
  const [rasAsistioFilter, setRasAsistioFilter] = useState('');
  const [careerFilter, setCareerFilter] = useState<string[]>([]);
  const [nlQuery, setNlQuery] = useState('');
  const [smartConditions, setSmartConditions] = useState<SmartCondition[]>([]);
  const [nlOperator, setNlOperator] = useState<NLOperator>('AND');

  // Estados de UI
  const [showModal, setShowModal] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Oportunidad | null>(null);
  const [editingContact, setEditingContact] = useState<{ key: string; opps: Oportunidad[]; nombre: string; cedula: string; telefono: string; mail: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [multipleInteres, setMultipleInteres] = useState(false);
  const [otrosIntereses, setOtrosIntereses] = useState<string[]>([]);
  const [originalOtrosIntereses, setOriginalOtrosIntereses] = useState<string[]>([]);
  const [mainCarrera, setMainCarrera] = useState('');
  const [expandedContacts, setExpandedContacts] = useState<string[]>([]);
  const [showCareerDropdown, setShowCareerDropdown] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const careerDropdownRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (careerDropdownRef.current && !careerDropdownRef.current.contains(e.target as Node)) {
        setShowCareerDropdown(false);
      }
    };
    if (showCareerDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCareerDropdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

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

  const PROCESO_OPTIONS = (() => {
    const options: string[] = [];
    for (let y = 2023; y <= 2030; y++) {
      options.push(`Marzo ${y}`, `Agosto ${y}`);
    }
    return options;
  })();

  const activeOpps = useMemo(() => {
    return (opportunities || []).filter(o => {
      if (o.deleted_at) return false;
      
      const searchLower = filter.toLowerCase();
      const matchesSearch = !filter || 
        o.nombre.toLowerCase().includes(searchLower) || 
        (o.cedula && o.cedula.includes(filter)) || 
        (o.mail && o.mail.toLowerCase().includes(searchLower));
      
      const matchesDateFrom = !dateFrom || o.fecha_lead >= dateFrom;
      const matchesDateTo = !dateTo || o.fecha_lead <= dateTo;
      const matchesProceso = !procesoFilter || o.proceso_inicio === procesoFilter;
      const matchesFase = smartConditions.length > 0
        ? true
        : (!faseFilter || o.fase_oportunidad === faseFilter);
      const matchesRasAgendada = !rasAgendadaFilter || (rasAgendadaFilter === 'true' ? o.ras_agendada : !o.ras_agendada);
      const matchesRasAsistio = !rasAsistioFilter || (rasAsistioFilter === 'true' ? o.ras_asistio : !o.ras_asistio);

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesProceso && matchesFase && matchesRasAgendada && matchesRasAsistio;
    });
  }, [opportunities, filter, dateFrom, dateTo, procesoFilter, faseFilter, rasAgendadaFilter, rasAsistioFilter, smartConditions]);

  // Agrupar oportunidades por SAPE (contacto)
  const groupedBySape = useMemo(() => {
    const groups: { key: string; contact: { nombre: string; cedula: string; telefono: string; mail: string; sape: string }; opps: Oportunidad[] }[] = [];
    const sapeMap = new Map<string, Oportunidad[]>();
    const noSape: Oportunidad[] = [];

    activeOpps.forEach(o => {
      const sape = o.sape != null ? String(o.sape).trim() : '';
      if (sape) {
        if (!sapeMap.has(sape)) sapeMap.set(sape, []);
        sapeMap.get(sape)!.push(o);
      } else {
        noSape.push(o);
      }
    });

    sapeMap.forEach((opps, sape) => {
      const first = opps[0];
      groups.push({
        key: sape,
        contact: { nombre: first.nombre || '', cedula: first.cedula || '', telefono: first.telefono || '', mail: first.mail || '', sape: sape },
        opps,
      });
    });

    // Oportunidades sin SAPE van como grupos individuales
    noSape.forEach(o => {
      groups.push({
        key: `no-sape-${o.opp_id}`,
        contact: { nombre: o.nombre || '', cedula: o.cedula || '', telefono: o.telefono || '', mail: o.mail || '', sape: o.sape != null ? String(o.sape) : '' },
        opps: [o],
      });
    });

    return groups;
  }, [activeOpps]);

  // Filtrar grupos por carrera: el contacto debe tener AL MENOS todas las carreras seleccionadas
  const filteredGroups = useMemo(() => {
    if (smartConditions.length > 0) {
      const matcher = (condition: SmartCondition) => (group: { opps: Oportunidad[] }) =>
        group.opps.some(opp =>
          opp.carrera_interes === condition.carrera &&
          (condition.fase === null || opp.fase_oportunidad === condition.fase)
        );
      return groupedBySape.filter(group =>
        nlOperator === 'OR'
          ? smartConditions.some(c => matcher(c)(group))
          : smartConditions.every(c => matcher(c)(group))
      );
    }
    if (careerFilter.length === 0) return groupedBySape;
    return groupedBySape.filter(group => {
      const groupCareers = new Set(group.opps.map(o => o.carrera_interes));
      return careerFilter.every(c => groupCareers.has(c));
    });
  }, [groupedBySape, careerFilter, smartConditions, nlOperator]);

  // Opps que se muestran (para stats)
  const displayOpps = useMemo(() => {
    return filteredGroups.flatMap(g => g.opps);
  }, [filteredGroups]);

  const stats = useMemo(() => {
    const total = displayOpps.length;
    const inscriptos = displayOpps.filter(o => o.fase_oportunidad === FaseOportunidad.Inscripto).length;

    const pipelineData = Object.values(FaseOportunidad).map(fase => ({
      name: fase,
      value: displayOpps.filter(o => o.fase_oportunidad === fase).length
    }));

    const careerMap: Record<string, number> = {};
    displayOpps.forEach(o => {
      careerMap[o.carrera_interes] = (careerMap[o.carrera_interes] || 0) + 1;
    });
    const careerData = Object.entries(careerMap).map(([name, value]) => ({ name, value }));

    const contactos = filteredGroups.length;

    return { total, inscriptos, contactos, pipelineData, careerData };
  }, [displayOpps, filteredGroups]);

  const toggleContact = (key: string) => {
    setExpandedContacts(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Validar SAPE duplicado al guardar
  const validateSape = (sape: string, currentOppId?: string): string | null => {
    if (!sape?.trim()) return null;
    const existing = (opportunities || []).filter(o => !o.deleted_at && String(o.sape || '') === sape.trim() && o.opp_id !== currentOppId);
    if (existing.length > 0) {
      const sameNombre = existing[0].nombre;
      return sameNombre;
    }
    return null;
  };

  const resetAllFilters = () => {
    setFilter('');
    setDateFrom('');
    setDateTo('');
    setProcesoFilter('');
    setFaseFilter('');
    setRasAgendadaFilter('');
    setRasAsistioFilter('');
    setCareerFilter([]);
    setNlQuery('');
    setSmartConditions([]);
    setNlOperator('AND');
  };

  const handleNLSearch = (query: string) => {
    setNlQuery(query);
    if (!query.trim()) {
      setSmartConditions([]);
      setNlOperator('AND');
      return;
    }
    const parsed = parseNLQuery(query);
    setSmartConditions(parsed.conditions);
    setNlOperator(parsed.operator);

    if (parsed.rasAgendada !== undefined) setRasAgendadaFilter(parsed.rasAgendada ? 'true' : 'false');
    if (parsed.rasAsistio !== undefined) setRasAsistioFilter(parsed.rasAsistio ? 'true' : 'false');

    const carreras = parsed.conditions.map(c => c.carrera);
    setCareerFilter(carreras);

    const fases = [...new Set(parsed.conditions.map(c => c.fase).filter(Boolean))];
    if (fases.length === 1 && fases[0]) {
      setFaseFilter(fases[0]);
    } else {
      setFaseFilter('');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const updatedOpp: any = {
      ...editingOpp,
      nombre: formData.get('nombre'),
      cedula: formData.get('cedula'),
      mail: formData.get('mail'),
      sape: formData.get('sape'),
      carrera_interes: formData.get('carrera_interes'),
      proceso_inicio: formData.get('proceso_inicio'),
      fase_oportunidad: formData.get('fase_oportunidad'),
      liceo_tipo: formData.get('liceo_tipo'),
      ras_agendada: formData.get('ras_agendada') === 'on',
      ras_asistio: formData.get('ras_asistio') === 'on',
      multiple_interes: multipleInteres,
      otros_intereses: multipleInteres ? otrosIntereses.filter(c => typeof c === 'string' && c.length > 1) : [],
      comentario_extra: formData.get('comentario_extra'),
    };

    // Validar SAPE duplicado
    const sapeVal = String(updatedOpp.sape || '').trim();
    if (sapeVal) {
      const existingNombre = validateSape(sapeVal, editingOpp?.opp_id);
      if (existingNombre) {
        const continuar = confirm(`El SAPE "${sapeVal}" ya está asignado a "${existingNombre}".\n\n¿Deseas continuar? (Solo se permite duplicar si es la misma persona)`);
        if (!continuar) { setIsSubmitting(false); return; }
      }
    }

    try {
      if (editingOpp) {
        await onUpdate(updatedOpp);
      } else {
        await onAdd(updatedOpp);
      }

      // Solo preguntar por carreras NUEVAS (que no existían antes)
      const carrerasNuevas = [...new Set(otrosIntereses)]
        .filter(c => c !== updatedOpp.carrera_interes && !originalOtrosIntereses.includes(c));
      if (multipleInteres && carrerasNuevas.length > 0) {
        const carrerasTexto = carrerasNuevas.join(', ');
        const generar = confirm(`¿Deseas generar una oportunidad separada para cada carrera adicional?\n\nCarreras nuevas: ${carrerasTexto}\n\nSe crearán ${carrerasNuevas.length} oportunidad(es) con los mismos datos de ${updatedOpp.nombre}.`);
        if (generar) {
          for (const carrera of carrerasNuevas) {
            await onAdd({
              nombre: updatedOpp.nombre,
              cedula: updatedOpp.cedula,
              mail: updatedOpp.mail,
              sape: updatedOpp.sape,
              carrera_interes: carrera,
              proceso_inicio: updatedOpp.proceso_inicio,
              fase_oportunidad: updatedOpp.fase_oportunidad,
              liceo_tipo: updatedOpp.liceo_tipo,
              liceo: updatedOpp.liceo || '',
              fecha_lead: updatedOpp.fecha_lead || new Date().toISOString().split('T')[0],
              ras_agendada: false,
              ras_asistio: false,
              multiple_interes: true,
              otros_intereses: [],
              comentario_extra: `[Generada desde múltiples intereses - Carrera principal: ${updatedOpp.carrera_interes}] ${updatedOpp.comentario_extra || ''}`,
            });
          }
        }
      }

      setShowModal(false);
      setEditingOpp(null);
    } catch (err: any) {
      console.error('[OpportunitiesManager] Save error:', err);
      alert(`Error al guardar la oportunidad: ${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          cedula: item.cedula || '',
          mail: item.mail || '',
          carrera_interes: item.carrera_interes || 'LV',
          liceo: item.liceo || '',
          liceo_tipo: (item.liceo_tipo as LiceoTipo) || LiceoTipo.Publico,
          fecha_lead: item.fecha_lead || new Date().toISOString().split('T')[0],
          ras_agendada: item.ras_agendada === 'SÍ' || item.ras_agendada === 'true',
          ras_asistio: item.ras_asistio === 'SÍ' || item.ras_asistio === 'true',
          multiple_interes: false,
          proceso_inicio: item.proceso_inicio || '',
          fase_oportunidad: item.fase_oportunidad || FaseOportunidad.Interesado,
          comentario_extra: item.comentario_extra || 'Importado vía CSV',
        });
        importedCount++;
      }
      alert(`Se importaron ${importedCount} registros correctamente.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (activeOpps.length === 0) { alert('No hay datos para exportar.'); return; }
    const headers = ['Nombre', 'CI', 'Mail', 'Carrera', 'Liceo', 'Tipo Liceo', 'Fecha Lead', 'RAS Agendada', 'RAS Asistió', 'Estado'];
    const rows = activeOpps.map(o => [
      `"${o.nombre}"`, 
      `"${o.cedula || ''}"`, 
      `"${o.mail || ''}"`, 
      `"${o.carrera_interes}"`, 
      `"${o.liceo}"`, 
      `"${o.liceo_tipo}"`, 
      `"${o.fecha_lead}"`, 
      o.ras_agendada ? 'SÍ' : 'NO', 
      o.ras_asistio ? 'SÍ' : 'NO', 
      `"${o.proceso_inicio}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `oportunidades_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openOppModal = (opp: Oportunidad) => {
    const orig = Array.isArray(opp.otros_intereses) ? opp.otros_intereses : [];
    setEditingOpp(opp);
    setMultipleInteres(opp.multiple_interes || false);
    setOtrosIntereses([...orig]);
    setOriginalOtrosIntereses([...orig]);
    setMainCarrera(opp.carrera_interes);
    setShowModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingContact) return;
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get('c_nombre') as string;
    const cedula = formData.get('c_cedula') as string;
    const telefono = formData.get('c_telefono') as string;
    const mail = formData.get('c_mail') as string;
    try {
      for (const opp of editingContact.opps) {
        await onUpdate({ ...opp, nombre, cedula, telefono, mail, updated_at: new Date().toISOString() });
      }
      setEditingContact(null);
    } catch {
      alert('Error al actualizar el contacto.');
    }
  };

  return (
    <><div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Opps Filtradas</p>
          <h4 className="text-3xl font-black text-gray-900">{stats.total}</h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contactos</p>
          <h4 className="text-3xl font-black text-indigo-600">{stats.contactos}</h4>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscriptos</p>
          <h4 className="text-3xl font-black text-green-600">{stats.inscriptos}</h4>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${stats.total > 0 ? Math.round((stats.inscriptos / stats.total) * 100) : 0}%` }} />
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2">{stats.total > 0 ? Math.round((stats.inscriptos / stats.total) * 100) : 0}% del total filtrado</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            Pipeline Actual
          </h5>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.pipelineData}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700, fill: '#9ca3af' }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28} animationDuration={500}>
                  {stats.pipelineData.map((entry) => (
                    <Cell key={entry.name} fill={FASE_HEX[entry.name] || '#2563eb'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {stats.pipelineData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: FASE_HEX[d.name] || '#2563eb'}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-purple-600 rounded-full"></span>
            Mix de Carreras
          </h5>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.careerData}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: '#9ca3af' }} interval={0} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28} animationDuration={500}>
                  {stats.careerData.map((entry) => (
                    <Cell key={entry.name} fill={CARRERA_HEX[entry.name] || '#6366f1'} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 800, fill: '#374151' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {stats.careerData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{backgroundColor: CARRERA_HEX[d.name] || '#6366f1'}}></span>
                <span className="text-[9px] font-black text-gray-400 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>)}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Oportunidades de Venta</h2>
          <p className="text-sm text-gray-500">Gestión avanzada del pipeline de asesoría</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 transition-all flex items-center gap-2 active:scale-95">
            Importar
          </button>
          <button onClick={handleExportCSV} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            Exportar CSV
          </button>
          <button onClick={() => {
            const charts: ChartData[] = [
              { title: 'Pipeline Actual', data: stats.pipelineData.map((d, i) => ({ ...d, color: '#2563eb' })), type: 'bar' },
              { title: 'Mix de Carreras', data: stats.careerData.map((d, i) => ({ ...d, color: '#9333ea' })), type: 'bar' },
            ];
            exportChartsAsImage(charts, 'oportunidades_graficas');
          }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Imagen
          </button>
          <button onClick={() => {
            const charts: ChartData[] = [
              { title: 'Pipeline Actual', data: stats.pipelineData, type: 'bar' },
              { title: 'Mix de Carreras', data: stats.careerData, type: 'bar' },
            ];
            exportChartsAsCSV(charts, 'oportunidades_datos');
          }} className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            CSV
          </button>
          <button onClick={() => { setEditingOpp(null); setMultipleInteres(false); setOtrosIntereses([]); setOriginalOtrosIntereses([]); setMainCarrera(CARRERAS_OPTIONS[0]); setShowModal(true); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95">
            + Nueva Opp
          </button>
        </div>
      </div>

      {/* NL Search Panel */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6" strokeLinecap="round"/></svg>
          <span className="text-[11px] font-black uppercase text-blue-600 tracking-wide">Búsqueda inteligente</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder='Ej: "inscriptos de UI que también tengan interés en VD"'
            value={nlQuery}
            onChange={e => handleNLSearch(e.target.value)}
            className="flex-1 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-blue-300"
          />
          {nlQuery && (
            <button
              type="button"
              onClick={() => { setNlQuery(''); setSmartConditions([]); setNlOperator('AND'); setCareerFilter([]); setFaseFilter(''); }}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              title="Limpiar búsqueda inteligente"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/></svg>
            </button>
          )}
        </div>
        {nlQuery && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Interpretado como:</span>
            {smartConditions.length > 0 ? (
              <>
                {smartConditions.map((c, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <span className={`text-[10px] font-black uppercase px-1.5 ${nlOperator === 'OR' ? 'text-amber-600' : 'text-blue-500'}`}>
                        {nlOperator}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                      nlOperator === 'OR' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      <span>{c.carrera}</span>
                      <span className={nlOperator === 'OR' ? 'text-amber-400' : 'text-blue-400'}>·</span>
                      <span className="font-normal">{c.fase ?? 'cualquier fase'}</span>
                    </span>
                  </React.Fragment>
                ))}
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No se detectaron filtros en la búsqueda</span>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span className="text-sm font-bold text-gray-900">Filtros avanzados</span>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {showAdvancedFilters && (
          <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
            {/* Fila 1: filtros principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Nombre / CI / Mail</label>
                <input type="text" placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Fase</label>
                <select value={faseFilter} onChange={(e) => setFaseFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${faseFilter ? 'text-blue-700' : 'text-gray-700'}`}>
                  <option value="">Todas</option>
                  {Object.values(FaseOportunidad).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Proceso Inicio</label>
                <select value={procesoFilter} onChange={(e) => setProcesoFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${procesoFilter ? 'text-blue-700' : 'text-gray-700'}`}>
                  <option value="">Todos</option>
                  {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="relative" ref={careerDropdownRef}>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Carreras</label>
                <button
                  type="button"
                  onClick={() => setShowCareerDropdown(prev => !prev)}
                  className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer text-left flex items-center justify-between gap-2 ${careerFilter.length > 0 ? 'text-blue-700' : 'text-gray-700'}`}
                >
                  <span className="truncate">
                    {careerFilter.length === 0 ? 'Todas' : careerFilter.join(', ')}
                  </span>
                  <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${showCareerDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showCareerDropdown && (
                  <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto">
                    {CARRERAS_OPTIONS.map(c => {
                      const isSelected = careerFilter.includes(c);
                      return (
                        <label
                          key={c}
                          className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-purple-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setCareerFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className={`text-sm font-bold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>{c}</span>
                        </label>
                      );
                    })}
                    {careerFilter.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCareerFilter([])}
                        className="w-full text-center text-[10px] font-black uppercase text-red-500 hover:bg-red-50 py-2 border-t border-gray-100 transition-colors"
                      >
                        Limpiar selección
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Fila 2: filtros secundarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Realiza RAS</label>
                <select value={rasAsistioFilter} onChange={(e) => setRasAsistioFilter(e.target.value)} className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full font-bold cursor-pointer ${rasAsistioFilter ? 'text-blue-700' : 'text-gray-700'}`}>
                  <option value="">Todos</option>
                  <option value="true">SÍ (Realizada)</option>
                  <option value="false">NO (Pendiente)</option>
                </select>
              </div>
              <div className="lg:col-span-2 relative" ref={datePickerRef}>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Rango de Fechas</label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(p => !p)}
                  className={`bg-gray-50 border rounded-xl px-4 py-2.5 text-sm w-full font-bold text-left flex items-center justify-between gap-2 transition-all ${(dateFrom || dateTo) ? 'border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                >
                  <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {dateFrom || dateTo
                      ? `${dateFrom ? new Date(dateFrom + 'T00:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '…'}  →  ${dateTo ? new Date(dateTo + 'T00:00:00').toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '…'}`
                      : 'Todas las fechas'}
                  </span>
                  <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {showDatePicker && (
                  <div className="absolute z-30 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 w-full min-w-[320px]">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Desde</label>
                        <input type="date" lang="es" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-1.5 block">Hasta</label>
                        <input type="date" lang="es" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    {(dateFrom || dateTo) && (
                      <button
                        type="button"
                        onClick={() => { setDateFrom(''); setDateTo(''); setShowDatePicker(false); }}
                        className="mt-3 w-full text-center text-[10px] font-black uppercase text-red-500 hover:bg-red-50 py-2 rounded-xl border border-red-100 transition-colors"
                      >
                        Limpiar rango
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <button onClick={resetAllFilters} className="w-full bg-gray-900 text-white text-[10px] font-black uppercase py-3 rounded-xl hover:bg-black transition-all shadow-md active:scale-95">Limpiar filtros</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contactos agrupados por SAPE */}
      <div className="space-y-3">
        {filteredGroups.length > 0 ? filteredGroups.map(group => {
          const isExpanded = expandedContacts.includes(group.key);
          const hasMultiple = group.opps.length > 1;
          const c = group.contact;
          return (
            <div key={group.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Contact Header */}
              <button
                type="button"
                onClick={() => toggleContact(group.key)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs ${hasMultiple ? 'bg-purple-600' : 'bg-blue-600'}`}>
                  {group.opps.length}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Nombre</div>
                    <div className="text-sm font-bold text-gray-900 truncate">{c.nombre}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Cédula</div>
                    <div className="text-sm text-gray-600 font-mono">{c.cedula || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Teléfono</div>
                    <div className="text-sm text-gray-600">{c.telefono || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Mail</div>
                    <div className="text-sm text-gray-600 truncate">{c.mail || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">SAPE</div>
                    <div className="text-sm font-bold text-indigo-600 font-mono">{c.sape || 'Sin SAPE'}</div>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setEditingContact({ key: group.key, opps: group.opps, nombre: c.nombre, cedula: c.cedula, telefono: c.telefono, mail: c.mail }); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                    title="Editar contacto"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </button>

              {/* Oportunidades del contacto */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="py-3 px-5">Carrera</th>
                        <th className="py-3 px-4">Fase</th>
                        <th className="py-3 px-4">Proceso</th>
                        <th className="py-3 px-4 text-center">RAS Agend.</th>
                        <th className="py-3 px-4 text-center">Realiza RAS</th>
                        <th className="py-3 px-4 text-center">Liceo</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.opps.map(opp => (
                        <tr key={opp.opp_id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 text-sm">
                          <td className="py-3 px-5 font-black text-purple-600 tracking-tighter">{opp.carrera_interes}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                              opp.fase_oportunidad === FaseOportunidad.Inscripto ? 'bg-green-100 text-green-700' :
                              opp.fase_oportunidad === FaseOportunidad.NoInteresado ? 'bg-red-100 text-red-700' :
                              opp.fase_oportunidad === FaseOportunidad.PromesaInscripcion ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {opp.fase_oportunidad}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-gray-500 font-medium">{opp.proceso_inicio || '—'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-[10px] font-bold ${opp.ras_agendada ? 'text-blue-600' : 'text-gray-300'}`}>
                              {opp.ras_agendada ? 'SÍ' : 'NO'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {opp.ras_asistio ? (
                              <span className="flex items-center justify-center gap-1 text-green-600 font-bold text-[10px]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                SÍ
                              </span>
                            ) : (
                              <span className="text-gray-300 font-bold text-[10px]">NO</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-[11px] font-medium text-gray-500">{opp.liceo_tipo}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => navigateToDetail(`/opportunities/${opp.opp_id}`)} className="text-gray-400 hover:text-gray-700 transition-colors font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                Ver
                              </button>
                              <button onClick={() => openOppModal(opp)} className="text-blue-600 font-bold hover:text-blue-800 transition-colors text-sm">Gestionar</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 text-center text-gray-400 italic text-sm">
            No se encontraron resultados.
          </div>
        )}
      </div>
      </div>

      {/* Editor Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto">
                <form onSubmit={handleSubmitForm} className="flex flex-col max-h-[90vh]">
                  <div className="px-8 py-6 bg-blue-900 text-white flex justify-between items-center rounded-t-3xl shrink-0">
                    <div>
                      <h3 className="text-xl font-bold">{editingOpp ? 'Gestionar Oportunidad' : 'Nueva Oportunidad'}</h3>
                      <p className="text-blue-200 text-xs mt-1">Completa los datos de seguimiento</p>
                    </div>
                    <button type="button" onClick={() => setShowModal(false)} className="text-white opacity-50 hover:opacity-100 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>

                  <div className="p-8 space-y-6 overflow-y-auto flex-1 min-h-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Nombre Completo</label>
                        <input name="nombre" defaultValue={editingOpp?.nombre} required className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Cédula de Identidad</label>
                        <input name="cedula" defaultValue={editingOpp?.cedula} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Correo Electrónico</label>
                        <input name="mail" type="email" defaultValue={editingOpp?.mail} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">SAPE</label>
                        <input name="sape" defaultValue={editingOpp?.sape} placeholder="Código SAPE" className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Carrera de Interés</label>
                        <select name="carrera_interes" defaultValue={editingOpp?.carrera_interes} onChange={(e) => { setMainCarrera(e.target.value); setOtrosIntereses(prev => prev.filter(c => c !== e.target.value)); }} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                          {CARRERAS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Fase</label>
                        <select name="fase_oportunidad" defaultValue={editingOpp?.fase_oportunidad} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white text-blue-700">
                          {Object.values(FaseOportunidad).map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Proceso Inicio</label>
                        <select name="proceso_inicio" defaultValue={editingOpp?.proceso_inicio} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                          <option value="">Sin especificar</option>
                          {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Tipo Liceo</label>
                        <select name="liceo_tipo" defaultValue={editingOpp?.liceo_tipo} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm font-bold bg-white">
                          {Object.values(LiceoTipo).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={multipleInteres} onChange={(e) => { setMultipleInteres(e.target.checked); if (!e.target.checked) setOtrosIntereses([]); }} className="w-5 h-5 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-purple-600 transition-colors uppercase">Múltiples Interés</span>
                      </label>
                      {multipleInteres && (
                        <div className="pt-3 border-t border-purple-200 space-y-3">
                          <label className="text-[10px] font-black text-purple-500 uppercase block">Otras carreras de interés</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {CARRERAS_OPTIONS.map(c => {
                              const isMain = c === mainCarrera;
                              const isSelected = otrosIntereses.includes(c);
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  disabled={isMain}
                                  onClick={() => setOtrosIntereses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    isMain ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                                    isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-md' :
                                    'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
                                  }`}
                                >
                                  {c} {isMain ? '(principal)' : ''}
                                </button>
                              );
                            })}
                          </div>
                          {otrosIntereses.length > 0 && (
                            <p className="text-[10px] text-purple-600 font-bold">{otrosIntereses.length} carrera(s) adicional(es) seleccionada(s)</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                      <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                        Hitos de Reunión (RAS)
                      </h4>
                      <div className="flex flex-wrap gap-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" name="ras_agendada" defaultChecked={editingOpp?.ras_agendada} className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors uppercase">RAS Agendada</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" name="ras_asistio" defaultChecked={editingOpp?.ras_asistio} className="w-5 h-5 rounded-lg border-gray-300 text-green-600 focus:ring-green-500" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors uppercase">Realiza RAS</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Comentarios de Seguimiento</label>
                      <textarea name="comentario_extra" defaultValue={editingOpp?.comentario_extra} rows={3} className="w-full border-gray-200 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50/50"></textarea>
                    </div>
                  </div>

                  <div className="px-8 py-6 bg-gray-50 flex justify-between items-center border-t border-gray-100 rounded-b-3xl shrink-0">
                    {editingOpp && (
                      <button type="button" onClick={() => { if(confirm('¿Eliminar?')) onDelete(editingOpp.opp_id); setShowModal(false); }} className="text-red-500 text-xs font-black uppercase tracking-widest hover:underline">
                        Eliminar Oportunidad
                      </button>
                    )}
                    <div className="flex gap-4 ml-auto">
                      <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 font-bold text-gray-500 text-sm">Cancelar</button>
                      <button type="submit" disabled={isSubmitting} className="bg-blue-900 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black transition-all text-sm disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Editar Contacto */}
      {editingContact && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setEditingContact(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto">
                <form onSubmit={handleSaveContact}>
                  <div className="px-6 py-5 bg-indigo-900 text-white rounded-t-2xl flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Editar Contacto</h3>
                      <p className="text-indigo-200 text-xs mt-0.5">Se actualizarán {editingContact.opps.length} oportunidad(es)</p>
                    </div>
                    <button type="button" onClick={() => setEditingContact(null)} className="text-white opacity-50 hover:opacity-100 transition-opacity">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre Completo</label>
                      <input name="c_nombre" defaultValue={editingContact.nombre} required className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Cédula</label>
                      <input name="c_cedula" defaultValue={editingContact.cedula} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Teléfono</label>
                      <input name="c_telefono" defaultValue={editingContact.telefono} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Correo Electrónico</label>
                      <input name="c_mail" type="email" defaultValue={editingContact.mail} className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl border-t border-gray-100">
                    <button type="button" onClick={() => setEditingContact(null)} className="px-5 py-2 font-bold text-gray-500 text-sm">Cancelar</button>
                    <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all text-sm">Guardar</button>
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

const OpportunitiesManagerWrapped: React.FC<OpportunitiesManagerProps> = (props) => (
  <OppErrorBoundary><OpportunitiesManager {...props} /></OppErrorBoundary>
);

export default OpportunitiesManagerWrapped;