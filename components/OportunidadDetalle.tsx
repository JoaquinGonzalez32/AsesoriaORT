import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Oportunidad, RAS, FaseOportunidad, LiceoTipo, ModalidadRAS, ResultadoRAS } from '../types';

import { ROUTES } from '../constants';

interface OportunidadDetalleProps {
  opportunities: Oportunidad[];
  rases: RAS[];
  onUpdateOpp: (updated: Oportunidad, rasInfo?: any) => Promise<void>;
  onDeleteOpp: (id: string) => Promise<void>;
  onAddOpp: (oppData: any) => Promise<void>;
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
  opportunities, rases, onUpdateOpp, onDeleteOpp, onAddOpp, onAddRas, onUpdateRas, onDeleteRas,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const opp = useMemo(() => opportunities.find(o => o.opp_id === id), [opportunities, id]);
  const linkedRas = useMemo(() => rases.find(r => r.opp_id === id && !r.deleted_at), [rases, id]);
  const otherOpps = useMemo(() => {
    if (!opp) return [];
    return opportunities.filter(o => !o.deleted_at && o.opp_id !== opp.opp_id && o.nombre.toLowerCase() === opp.nombre.toLowerCase());
  }, [opportunities, opp]);

  // --- Inline edit state ---
  const [editingOpp, setEditingOpp] = useState(false);
  const [oppForm, setOppForm] = useState<Record<string, any>>({});
  const [formDirty, setFormDirty] = useState(false);

  // --- Add Opp state ---
  const [showAddOpp, setShowAddOpp] = useState(false);
  const [newOppCarrera, setNewOppCarrera] = useState('');
  const [newOppProceso, setNewOppProceso] = useState(() => {
    const m = new Date().getMonth() + 1, y = new Date().getFullYear();
    if (m >= 9) return `Marzo ${y + 1}`;
    if (m >= 4) return `Agosto ${y}`;
    return `Marzo ${y}`;
  });
  const [addingOpp, setAddingOpp] = useState(false);

  // --- RAS state ---
  const [editingRas, setEditingRas] = useState(false);
  const [creatingRas, setCreatingRas] = useState(false);
  const [rasForm, setRasForm] = useState<Record<string, any>>({});
  const [confirmDeleteRas, setConfirmDeleteRas] = useState(false);

  const [saving, setSaving] = useState(false);

  // Sync form with opp data
  useEffect(() => {
    if (opp) {
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
        comentario_extra: opp.comentario_extra || '',
      });
      setFormDirty(false);
    }
  }, [opp]);

  const updateField = (field: string, value: any) => {
    setOppForm(p => ({ ...p, [field]: value }));
    setFormDirty(true);
  };

  // Populate ras form
  useEffect(() => {
    if (editingRas && linkedRas) {
      setRasForm({
        titulo: linkedRas.titulo,
        agente_nombre: linkedRas.agente_nombre,
        fecha_hora: linkedRas.fecha_hora?.slice(0, 16) || '',
        modalidad: linkedRas.modalidad,
        resultado_ras: linkedRas.resultado_ras || ResultadoRAS.Pendiente,
        comentario: linkedRas.comentario || '',
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
  const handleSaveOpp = async () => {
    if (!opp || !formDirty) return;
    setSaving(true);
    try {
      const updated: Oportunidad = {
        ...opp,
        ...oppForm,
        updated_at: new Date().toISOString(),
      };
      await onUpdateOpp(updated);
      setFormDirty(false);
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
        resultado_ras: rasForm.resultado_ras,
        comentario: rasForm.comentario,
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
      await onUpdateOpp({ ...opp, ras_agendada: false, updated_at: new Date().toISOString() });
      setConfirmDeleteRas(false);
    } catch (err) {
      console.error('Error deleting RAS:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddOppForContact = async () => {
    if (!opp || !newOppCarrera) return;
    setAddingOpp(true);
    try {
      await onAddOpp({
        nombre: opp.nombre,
        cedula: opp.cedula || '',
        telefono: opp.telefono || '',
        mail: opp.mail || '',
        sape: opp.sape || '',
        carrera_interes: newOppCarrera,
        liceo: opp.liceo || '',
        fecha_lead: new Date().toISOString().split('T')[0],
        ras_agendada: false,
        multiple_interes: false,
        liceo_tipo: opp.liceo_tipo,
        proceso_inicio: newOppProceso,
        fase_oportunidad: FaseOportunidad.Interesado,
        comentario_extra: '',
      });
      setShowAddOpp(false);
      setNewOppCarrera('');
      setNewOppProceso('');
    } catch (err) {
      console.error('Error creating opp:', err);
    } finally {
      setAddingOpp(false);
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
        {!editingOpp ? (
          <button
            onClick={() => setEditingOpp(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar Oportunidad
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (opp) { setOppForm({ nombre: opp.nombre, cedula: opp.cedula || '', mail: opp.mail || '', telefono: opp.telefono || '', sape: opp.sape || '', carrera_interes: opp.carrera_interes, fase_oportunidad: opp.fase_oportunidad, proceso_inicio: opp.proceso_inicio, liceo_tipo: opp.liceo_tipo, ras_agendada: opp.ras_agendada, comentario_extra: opp.comentario_extra || '' }); setFormDirty(false); } setEditingOpp(false); }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => { handleSaveOpp().then(() => setEditingOpp(false)); }}
              disabled={saving || !formDirty}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {/* =================== Two columns: inline editable =================== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ---- LEFT: Datos de la Oportunidad ---- */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Datos del Contacto</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <InlineField label="Nombre" value={oppForm.nombre || ''} onChange={v => updateField('nombre', v)} editing={editingOpp} />
              <InlineField label="Cédula" value={oppForm.cedula || ''} onChange={v => updateField('cedula', v)} editing={editingOpp} />
              <InlineField label="Teléfono" value={oppForm.telefono || ''} onChange={v => updateField('telefono', v)} editing={editingOpp} />
              <InlineField label="Mail" value={oppForm.mail || ''} onChange={v => updateField('mail', v)} type="email" editing={editingOpp} />
              <InlineField label="SAPE" value={oppForm.sape || ''} onChange={() => {}} highlight />
              <InlineSelect label="Carrera" value={oppForm.carrera_interes || ''} onChange={v => updateField('carrera_interes', v)} options={CARRERAS_OPTIONS.map(c => ({ value: c, label: c }))} editing={editingOpp} />
              <InlineSelect label="Fase" value={oppForm.fase_oportunidad || ''} onChange={v => updateField('fase_oportunidad', v)} options={Object.values(FaseOportunidad).map(f => ({ value: f, label: f }))} editing={editingOpp} />
              <InlineSelect label="Proceso Inicio" value={oppForm.proceso_inicio || ''} onChange={v => updateField('proceso_inicio', v)} options={[{ value: '', label: '—' }, ...PROCESO_OPTIONS.map(p => ({ value: p, label: p }))]} editing={editingOpp} />
              <InlineSelect label="Tipo Liceo" value={oppForm.liceo_tipo || ''} onChange={v => updateField('liceo_tipo', v)} options={Object.values(LiceoTipo).map(t => ({ value: t, label: t }))} editing={editingOpp} />
              <InlineField label="Fecha Lead" value={oppForm.fecha_lead || opp.fecha_lead || ''} onChange={v => updateField('fecha_lead', v)} type="date" editing={editingOpp} />
              <div className="flex items-center gap-4 px-6 py-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-28 shrink-0">RAS Agendada</span>
                {editingOpp ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={oppForm.ras_agendada || false} onChange={e => updateField('ras_agendada', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className={`text-sm font-bold ${oppForm.ras_agendada ? 'text-blue-600' : 'text-gray-300'}`}>{oppForm.ras_agendada ? 'SÍ' : 'NO'}</span>
                  </label>
                ) : (
                  <span className={`text-sm font-bold ${opp.ras_agendada ? 'text-blue-600' : 'text-gray-300'}`}>{opp.ras_agendada ? 'SÍ' : 'NO'}</span>
                )}
              </div>
              <div className="px-6 py-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comentarios</p>
                {editingOpp ? (
                  <textarea
                    rows={3}
                    value={oppForm.comentario_extra || ''}
                    onChange={e => updateField('comentario_extra', e.target.value)}
                    placeholder="Sin comentarios..."
                    className="text-sm font-medium text-gray-700 bg-gray-50 rounded-xl p-4 w-full min-h-[48px] border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4 min-h-[48px]">
                    {opp.comentario_extra || <span className="text-gray-300 italic">Sin comentarios</span>}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ---- RIGHT column ---- */}
          <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">RAS Vinculada</h3>
              </div>
              {!linkedRas && !creatingRas && (
                <button
                  onClick={() => setCreatingRas(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-green-700 transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agendar
                </button>
              )}
            </div>

            {/* --- Creating RAS Form --- */}
            {creatingRas && (
              <form onSubmit={handleCreateRas} className="p-6 space-y-4">
                <div>
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
                <div>
                  <label className={labelClass}>Fecha y Hora *</label>
                  <input required type="datetime-local" step="1800" value={rasForm.fecha_hora || ''} onChange={e => setRasForm(p => ({ ...p, fecha_hora: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCreatingRas(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Crear RAS'}
                  </button>
                </div>
              </form>
            )}

            {/* --- Editing RAS Form --- */}
            {editingRas && linkedRas && (
              <form onSubmit={handleSaveRas} className="p-6 space-y-4">
                <div>
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
                <div>
                  <label className={labelClass}>Fecha y Hora</label>
                  <input required type="datetime-local" step="1800" value={rasForm.fecha_hora || ''} onChange={e => setRasForm(p => ({ ...p, fecha_hora: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Resultado</label>
                  <select value={rasForm.resultado_ras || ResultadoRAS.Pendiente} onChange={e => setRasForm(p => ({ ...p, resultado_ras: e.target.value }))} className={selectClass}>
                    {Object.values(ResultadoRAS).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Comentario</label>
                  <textarea rows={2} value={rasForm.comentario || ''} onChange={e => setRasForm(p => ({ ...p, comentario: e.target.value }))} placeholder="Sin comentarios..." className={`${inputClass} resize-none`} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingRas(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            )}

            {/* --- Display RAS --- */}
            {linkedRas && !editingRas && (
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl px-4 py-3 text-white flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-white/20">{linkedRas.modalidad}</span>
                  <span className="text-xs font-bold opacity-90">
                    {new Date(linkedRas.fecha_hora).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    {' — '}
                    {new Date(linkedRas.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  <div className="flex items-center gap-4 py-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">Título</span>
                    <span className="text-sm font-bold text-gray-900 truncate">{linkedRas.titulo}</span>
                  </div>
                  <div className="flex items-center gap-4 py-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">Interesado</span>
                    <span className="text-sm font-bold text-gray-800">{linkedRas.nombre_interesado}</span>
                  </div>
                  <div className="flex items-center gap-4 py-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">Agente</span>
                    <span className="text-sm font-bold text-gray-800">{linkedRas.agente_nombre}</span>
                  </div>
                  {linkedRas.carrera && (
                    <div className="flex items-center gap-4 py-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">Carrera</span>
                      <span className="text-sm font-black text-purple-600">{linkedRas.carrera}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 py-1.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">Resultado</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded ${
                      linkedRas.resultado_ras === ResultadoRAS.Realizada ? 'bg-green-100 text-green-700' :
                      linkedRas.resultado_ras === ResultadoRAS.Frustrada ? 'bg-red-100 text-red-700' :
                      linkedRas.resultado_ras === ResultadoRAS.Cancelada ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{linkedRas.resultado_ras || 'Pendiente'}</span>
                  </div>
                </div>
                {linkedRas.comentario && (
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Comentario</p>
                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{linkedRas.comentario}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-4">
                  <button
                    onClick={() => setEditingRas(true)}
                    className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDeleteRas(true)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* --- No RAS --- */}
            {!linkedRas && !creatingRas && (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Sin RAS agendada</p>
                <p className="text-gray-300 text-xs mt-1">Usa "Agendar" para crear una.</p>
              </div>
            )}
          </div>

          {/* ---- Otras Oportunidades (below RAS) ---- */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Otras Oportunidades</h3>
                {otherOpps.length > 0 && (
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{otherOpps.length}</span>
                )}
              </div>
              {!showAddOpp && (
                <button
                  onClick={() => setShowAddOpp(true)}
                  className="bg-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] hover:bg-purple-700 transition-colors flex items-center gap-1 active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar
                </button>
              )}
            </div>
            {showAddOpp && (
              <div className="px-6 py-4 border-b border-gray-100 space-y-3">
                <div>
                  <label className={labelClass}>Carrera *</label>
                  <select value={newOppCarrera} onChange={e => setNewOppCarrera(e.target.value)} className={selectClass}>
                    <option value="">Seleccionar...</option>
                    {CARRERAS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Proceso Inicio</label>
                  <select value={newOppProceso} onChange={e => setNewOppProceso(e.target.value)} className={selectClass}>
                    <option value="">—</option>
                    {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setShowAddOpp(false); setNewOppCarrera(''); setNewOppProceso(''); }} className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                    Cancelar
                  </button>
                  <button type="button" onClick={handleAddOppForContact} disabled={!newOppCarrera || addingOpp} className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50">
                    {addingOpp ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            )}
            {otherOpps.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {otherOpps.map(o => (
                  <button
                    key={o.opp_id}
                    onClick={() => navigate(`/opportunities/${o.opp_id}`)}
                    className="w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{o.carrera_interes}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{o.proceso_inicio}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${FASE_STYLE[o.fase_oportunidad] || 'bg-gray-100 text-gray-600'}`}>
                      {o.fase_oportunidad}
                    </span>
                  </button>
                ))}
              </div>
            ) : !showAddOpp && (
              <div className="p-6 text-center">
                <p className="text-gray-400 text-sm font-medium">No hay otras oportunidades</p>
                <p className="text-gray-300 text-xs mt-1">Este contacto tiene una sola oportunidad.</p>
              </div>
            )}
          </div>
          </div>
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

// --- Helpers ---
const InlineField = ({ label, value, onChange, type = 'text', highlight, editing }: { label: string; value: string; onChange: (v: string) => void; type?: string; highlight?: boolean; editing?: boolean }) => (
  <div className="flex items-center gap-4 px-6 py-1.5">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-28 shrink-0">{label}</span>
    {editing ? (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="—"
        className={`text-sm font-bold bg-transparent border-b border-blue-200 focus:border-blue-400 outline-none py-1 flex-1 transition-colors ${highlight ? 'text-blue-600' : 'text-gray-800'}`}
      />
    ) : (
      <span className={`text-sm font-bold py-1 ${highlight ? 'text-blue-600' : value ? 'text-gray-800' : 'text-gray-300'}`}>{value || '—'}</span>
    )}
  </div>
);

const InlineSelect = ({ label, value, onChange, options, editing }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; editing?: boolean }) => (
  <div className="flex items-center gap-4 px-6 py-1.5">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-28 shrink-0">{label}</span>
    {editing ? (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-sm font-bold bg-transparent border-b border-blue-200 focus:border-blue-400 outline-none py-1 flex-1 cursor-pointer transition-colors text-gray-800"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <span className="text-sm font-bold py-1 text-gray-800">{options.find(o => o.value === value)?.label || value || '—'}</span>
    )}
  </div>
);

export default OportunidadDetalle;
