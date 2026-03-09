import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Oportunidad, RAS, FaseOportunidad, LiceoTipo, ModalidadRAS } from '../types';
import { ROUTES } from '../constants';

interface OportunidadDetalleProps {
  opportunities: Oportunidad[];
  rases: RAS[];
  onUpdateOpp: (updated: Oportunidad, rasInfo?: any) => Promise<void>;
  onDeleteOpp: (id: string) => Promise<void>;
  onAddRas: (rasData: any) => Promise<RAS | undefined>;
  onUpdateRas: (id: string, data: any) => Promise<void>;
  onDeleteRas: (id: string) => Promise<void>;
}

const CARRERAS_OPTIONS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];
const AGENTES_RAS = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucía Nazur', 'Fabián Barros', 'María Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez',
];
const PROCESO_OPTIONS = (() => {
  const opts: string[] = [];
  for (let y = 2023; y <= 2030; y++) { opts.push(`Marzo ${y}`, `Agosto ${y}`); }
  return opts;
})();

const FASE_HEX: Record<string, string> = {
  [FaseOportunidad.Interesado]: '#3b82f6',
  [FaseOportunidad.Evaluando]: '#60a5fa',
  [FaseOportunidad.Contactado]: '#f59e0b',
  [FaseOportunidad.NoInteresado]: '#ef4444',
  [FaseOportunidad.PromesaInscripcion]: '#22c55e',
  [FaseOportunidad.Inscripto]: '#16a34a',
};
const FASE_STYLE: Record<string, string> = {
  [FaseOportunidad.Interesado]: 'bg-blue-100 text-blue-700',
  [FaseOportunidad.Evaluando]: 'bg-sky-100 text-sky-700',
  [FaseOportunidad.Contactado]: 'bg-yellow-100 text-yellow-700',
  [FaseOportunidad.NoInteresado]: 'bg-red-100 text-red-700',
  [FaseOportunidad.PromesaInscripcion]: 'bg-green-100 text-green-700',
  [FaseOportunidad.Inscripto]: 'bg-emerald-100 text-emerald-800',
};

const OportunidadDetalle: React.FC<OportunidadDetalleProps> = ({
  opportunities, rases, onUpdateOpp, onDeleteOpp, onAddRas, onUpdateRas, onDeleteRas,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const opp = useMemo(() => opportunities.find(o => o.opp_id === id), [opportunities, id]);
  const linkedRas = useMemo(() => rases.find(r => r.opp_id === id && !r.deleted_at), [rases, id]);

  // --- Edit Opp state ---
  const [editingOpp, setEditingOpp] = useState(false);
  const [oppForm, setOppForm] = useState<Record<string, any>>({});

  // --- RAS state ---
  const [editingRas, setEditingRas] = useState(false);
  const [creatingRas, setCreatingRas] = useState(false);
  const [rasForm, setRasForm] = useState<Record<string, any>>({});
  const [confirmDeleteRas, setConfirmDeleteRas] = useState(false);

  const [saving, setSaving] = useState(false);

  // Populate opp form when entering edit mode
  useEffect(() => {
    if (editingOpp && opp) {
      setOppForm({
        nombre: opp.nombre,
        cedula: opp.cedula || '',
        mail: opp.mail || '',
        telefono: opp.telefono || '',
        sape: opp.sape || '',
        carrera_interes: opp.carrera_interes,
        fase_oportunidad: opp.fase_oportunidad,
        proceso_inicio: opp.proceso_inicio,
        liceo_tipo: opp.liceo_tipo,
        ras_agendada: opp.ras_agendada,
        ras_asistio: opp.ras_asistio,
        comentario_extra: opp.comentario_extra || '',
      });
    }
  }, [editingOpp, opp]);

  // Populate ras form
  useEffect(() => {
    if (editingRas && linkedRas) {
      setRasForm({
        titulo: linkedRas.titulo,
        agente_nombre: linkedRas.agente_nombre,
        fecha_hora: linkedRas.fecha_hora?.slice(0, 16) || '',
        modalidad: linkedRas.modalidad,
      });
    }
  }, [editingRas, linkedRas]);

  useEffect(() => {
    if (creatingRas && opp) {
      setRasForm({
        titulo: `Reunión de Asesoramiento - ${opp.nombre}`,
        agente_nombre: '',
        fecha_hora: '',
        modalidad: ModalidadRAS.Presencial,
      });
    }
  }, [creatingRas, opp]);

  // ---------- Handlers ----------
  const handleSaveOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opp) return;
    setSaving(true);
    try {
      const updated: Oportunidad = {
        ...opp,
        ...oppForm,
        updated_at: new Date().toISOString(),
      };
      await onUpdateOpp(updated);
      setEditingOpp(false);
    } catch (err) {
      console.error('Error updating opportunity:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedRas) return;
    setSaving(true);
    try {
      await onUpdateRas(linkedRas.ras_id, {
        titulo: rasForm.titulo,
        agente_nombre: rasForm.agente_nombre,
        fecha_hora: rasForm.fecha_hora,
        modalidad: rasForm.modalidad,
      });
      setEditingRas(false);
    } catch (err) {
      console.error('Error updating RAS:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opp || !rasForm.agente_nombre || !rasForm.fecha_hora) return;
    setSaving(true);
    try {
      await onAddRas({
        opp_id: opp.opp_id,
        titulo: rasForm.titulo,
        nombre_interesado: opp.nombre,
        agente_nombre: rasForm.agente_nombre,
        fecha_hora: rasForm.fecha_hora,
        modalidad: rasForm.modalidad,
        carrera: opp.carrera_interes,
        estado_oportunidad: opp.proceso_inicio,
      });
      // Update opp ras_agendada
      await onUpdateOpp({ ...opp, ras_agendada: true, updated_at: new Date().toISOString() });
      setCreatingRas(false);
    } catch (err) {
      console.error('Error creating RAS:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRas = async () => {
    if (!linkedRas || !opp) return;
    setSaving(true);
    try {
      await onDeleteRas(linkedRas.ras_id);
      await onUpdateOpp({ ...opp, ras_agendada: false, ras_asistio: false, updated_at: new Date().toISOString() });
      setConfirmDeleteRas(false);
    } catch (err) {
      console.error('Error deleting RAS:', err);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Not found ----------
  if (!opp) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oportunidad no encontrada</h2>
          <p className="text-gray-400 text-sm mb-6">No existe una oportunidad con el ID especificado.</p>
          <button onClick={() => navigate(ROUTES.OPPORTUNITIES)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">
            Volver a Oportunidades
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const selectClass = "bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold w-full cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none";
  const labelClass = "text-[10px] font-black uppercase text-gray-400 mb-1.5 block tracking-widest";

  // ---------- RENDER ----------
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.OPPORTUNITIES)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors font-bold text-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            Oportunidades
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{opp.nombre}</h2>
          <span className={`px-3 py-1 rounded-lg text-xs font-black ${FASE_STYLE[opp.fase_oportunidad] || 'bg-gray-100 text-gray-600'}`}>
            {opp.fase_oportunidad}
          </span>
        </div>
        {!editingOpp && (
          <button
            onClick={() => setEditingOpp(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar Oportunidad
          </button>
        )}
      </div>

      {/* =================== OPP DATA SECTION =================== */}
      {editingOpp ? (
        <form onSubmit={handleSaveOpp} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 bg-blue-900 text-white">
            <h3 className="text-lg font-bold">Editar Oportunidad</h3>
            <p className="text-blue-200 text-xs mt-0.5">Modifica los datos del contacto y seguimiento</p>
          </div>
          <div className="p-8 space-y-6">
            {/* Personal info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input required value={oppForm.nombre || ''} onChange={e => setOppForm(p => ({ ...p, nombre: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cédula</label>
                <input value={oppForm.cedula || ''} onChange={e => setOppForm(p => ({ ...p, cedula: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mail</label>
                <input type="email" value={oppForm.mail || ''} onChange={e => setOppForm(p => ({ ...p, mail: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input value={oppForm.telefono || ''} onChange={e => setOppForm(p => ({ ...p, telefono: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>SAPE</label>
                <input value={oppForm.sape || ''} onChange={e => setOppForm(p => ({ ...p, sape: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Carrera de Interés</label>
                <select value={oppForm.carrera_interes || ''} onChange={e => setOppForm(p => ({ ...p, carrera_interes: e.target.value }))} className={selectClass}>
                  {CARRERAS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fase</label>
                <select value={oppForm.fase_oportunidad || ''} onChange={e => setOppForm(p => ({ ...p, fase_oportunidad: e.target.value }))} className={selectClass}>
                  {Object.values(FaseOportunidad).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Proceso Inicio</label>
                <select value={oppForm.proceso_inicio || ''} onChange={e => setOppForm(p => ({ ...p, proceso_inicio: e.target.value }))} className={selectClass}>
                  <option value="">—</option>
                  {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className={labelClass}>Tipo Liceo</label>
                <select value={oppForm.liceo_tipo || ''} onChange={e => setOppForm(p => ({ ...p, liceo_tipo: e.target.value }))} className={selectClass}>
                  {Object.values(LiceoTipo).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex items-end gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={oppForm.ras_agendada || false} onChange={e => setOppForm(p => ({ ...p, ras_agendada: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-xs font-bold text-gray-700">RAS Agendada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={oppForm.ras_asistio || false} onChange={e => setOppForm(p => ({ ...p, ras_asistio: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className="text-xs font-bold text-gray-700">Asistió RAS</span>
                </label>
              </div>
            </div>
            <div>
              <label className={labelClass}>Comentarios de Seguimiento</label>
              <textarea rows={3} value={oppForm.comentario_extra || ''} onChange={e => setOppForm(p => ({ ...p, comentario_extra: e.target.value }))} className={`${inputClass} resize-none`} />
            </div>
          </div>
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setEditingOpp(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Row 1: Personal info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <InfoField label="Nombre" value={opp.nombre} />
              <InfoField label="Cédula" value={opp.cedula} />
              <InfoField label="Teléfono" value={opp.telefono} />
              <InfoField label="Mail" value={opp.mail} />
              <InfoField label="SAPE" value={opp.sape} highlight />
            </div>
            {/* Row 2: Academic/Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <InfoField label="Carrera" value={opp.carrera_interes} />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fase</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black ${FASE_STYLE[opp.fase_oportunidad] || 'bg-gray-100 text-gray-600'}`}>
                  {opp.fase_oportunidad}
                </span>
              </div>
              <InfoField label="Proceso Inicio" value={opp.proceso_inicio} />
              <InfoField label="Tipo Liceo" value={opp.liceo_tipo} />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RAS Agendada</p>
                <span className={`text-sm font-bold ${opp.ras_agendada ? 'text-blue-600' : 'text-gray-300'}`}>
                  {opp.ras_agendada ? 'SÍ' : 'NO'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asistió RAS</p>
                <span className={`text-sm font-bold ${opp.ras_asistio ? 'text-green-600' : 'text-gray-300'}`}>
                  {opp.ras_asistio ? 'SÍ' : 'NO'}
                </span>
              </div>
            </div>
            {/* Row 3: Dates + Comments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <InfoField label="Fecha Lead" value={opp.fecha_lead ? new Date(opp.fecha_lead).toLocaleDateString('es-ES') : undefined} />
              <div className="lg:col-span-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Comentarios</p>
                <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 min-h-[60px]">
                  {opp.comentario_extra || <span className="text-gray-300 italic">Sin comentarios</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== RAS SECTION =================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-green-500 rounded-full" />
            <h3 className="text-lg font-bold text-gray-900">RAS Vinculada</h3>
          </div>
          {!linkedRas && !creatingRas && (
            <button
              onClick={() => setCreatingRas(true)}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agendar RAS
            </button>
          )}
        </div>

        {/* --- Creating RAS Form --- */}
        {creatingRas && (
          <form onSubmit={handleCreateRas} className="p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Título</label>
                <input required value={rasForm.titulo || ''} onChange={e => setRasForm(p => ({ ...p, titulo: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Agente *</label>
                <select required value={rasForm.agente_nombre || ''} onChange={e => setRasForm(p => ({ ...p, agente_nombre: e.target.value }))} className={selectClass}>
                  <option value="">Seleccionar...</option>
                  {AGENTES_RAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Modalidad</label>
                <select value={rasForm.modalidad || ModalidadRAS.Presencial} onChange={e => setRasForm(p => ({ ...p, modalidad: e.target.value }))} className={selectClass}>
                  {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Fecha y Hora *</label>
                <input required type="datetime-local" step="1800" value={rasForm.fecha_hora || ''} onChange={e => setRasForm(p => ({ ...p, fecha_hora: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreatingRas(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Crear RAS'}
              </button>
            </div>
          </form>
        )}

        {/* --- Editing RAS Form --- */}
        {editingRas && linkedRas && (
          <form onSubmit={handleSaveRas} className="p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Título</label>
                <input required value={rasForm.titulo || ''} onChange={e => setRasForm(p => ({ ...p, titulo: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Agente</label>
                <select value={rasForm.agente_nombre || ''} onChange={e => setRasForm(p => ({ ...p, agente_nombre: e.target.value }))} className={selectClass}>
                  {AGENTES_RAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Modalidad</label>
                <select value={rasForm.modalidad || ''} onChange={e => setRasForm(p => ({ ...p, modalidad: e.target.value }))} className={selectClass}>
                  {Object.values(ModalidadRAS).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Fecha y Hora</label>
                <input required type="datetime-local" step="1800" value={rasForm.fecha_hora || ''} onChange={e => setRasForm(p => ({ ...p, fecha_hora: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingRas(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}

        {/* --- Display RAS Card --- */}
        {linkedRas && !editingRas && (
          <div className="p-8">
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden max-w-2xl">
              {/* Card header */}
              <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    linkedRas.modalidad === ModalidadRAS.Presencial
                      ? 'bg-white/20 text-white'
                      : 'bg-white/20 text-white'
                  }`}>
                    {linkedRas.modalidad}
                  </span>
                  <span className="text-xs font-bold opacity-80">
                    {new Date(linkedRas.fecha_hora).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    {' — '}
                    {new Date(linkedRas.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              {/* Card body */}
              <div className="p-6 space-y-4">
                <h4 className="font-bold text-sm text-gray-900 leading-tight">{linkedRas.titulo}</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Interesado</span>
                    <span className="font-bold text-gray-800">{linkedRas.nombre_interesado}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Agente</span>
                    <span className="font-bold text-gray-800">{linkedRas.agente_nombre}</span>
                  </div>
                  {linkedRas.carrera && (
                    <div>
                      <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Carrera</span>
                      <span className="font-black text-purple-600">{linkedRas.carrera}</span>
                    </div>
                  )}
                  {linkedRas.estado_oportunidad && (
                    <div>
                      <span className="text-[9px] font-black text-gray-400 block uppercase tracking-wider mb-0.5">Estado Oportunidad</span>
                      <span className="font-bold text-gray-700">{linkedRas.estado_oportunidad}</span>
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
                  <button
                    onClick={() => setEditingRas(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar RAS
                  </button>
                  <button
                    onClick={() => setConfirmDeleteRas(true)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Eliminar RAS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- No RAS message --- */}
        {!linkedRas && !creatingRas && (
          <div className="p-8">
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="text-gray-400 text-sm font-medium">No hay RAS agendada para esta oportunidad.</p>
              <p className="text-gray-300 text-xs mt-1">Usa el botón "Agendar RAS" para crear una.</p>
            </div>
          </div>
        )}
      </div>

      {/* =================== DELETE RAS CONFIRMATION MODAL =================== */}
      {confirmDeleteRas && linkedRas && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteRas(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar RAS</h3>
              <p className="text-sm text-gray-500 mb-6">
                Se eliminará la RAS de <strong>{linkedRas.nombre_interesado}</strong> con agente <strong>{linkedRas.agente_nombre}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmDeleteRas(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleDeleteRas} disabled={saving} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- Helper ---
const InfoField = ({ label, value, highlight }: { label: string; value?: string | null; highlight?: boolean }) => (
  <div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>
      {value || <span className="text-gray-300">—</span>}
    </p>
  </div>
);

export default OportunidadDetalle;
