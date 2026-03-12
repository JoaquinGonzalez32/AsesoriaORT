import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ListaTrabajo {
  id: string;
  nombre: string;
  created_at: string;
  total_items: number;
  updated_at: string;
}

interface ListaItem {
  id: string;
  lista_id: string;
  nombre: string;
  cedula: string | null;
  mail: string | null;
  telefono: string | null;
  sape: string | null;
  carrera: string | null;
  fase_original: string | null;
  proceso_inicio: string | null;
  liceo_tipo: string | null;
  resultado: string;
  comentario: string | null;
  created_at: string;
}

const RESULTADOS = [
  'Sin gestionar',
  'Interesado',
  'Evaluando',
  'Contactado',
  'No interesado',
  'Promesa de Inscripcion',
  'Inscripto',
] as const;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
};

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
};

const resultadoStyle = (resultado: string) => {
  switch (resultado) {
    case 'Sin gestionar':          return 'border-gray-200 bg-gray-50 text-gray-500';
    case 'Interesado':             return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'Evaluando':              return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'Contactado':             return 'border-teal-200 bg-teal-50 text-teal-700';
    case 'No interesado':          return 'border-red-200 bg-red-50 text-red-600';
    case 'Promesa de Inscripcion': return 'border-purple-200 bg-purple-50 text-purple-700';
    case 'Inscripto':              return 'border-green-200 bg-green-50 text-green-700';
    default:                       return 'border-gray-200 bg-gray-50 text-gray-500';
  }
};

const resultadoCardStyle = (resultado: string) => {
  switch (resultado) {
    case 'Sin gestionar':          return 'border-gray-100 bg-white text-gray-900';
    case 'Interesado':             return 'border-blue-100 bg-blue-50/50 text-blue-900';
    case 'Evaluando':              return 'border-amber-100 bg-amber-50/50 text-amber-900';
    case 'Contactado':             return 'border-teal-100 bg-teal-50/50 text-teal-900';
    case 'No interesado':          return 'border-red-100 bg-red-50/50 text-red-900';
    case 'Promesa de Inscripcion': return 'border-purple-100 bg-purple-50/50 text-purple-900';
    case 'Inscripto':              return 'border-green-100 bg-green-50/50 text-green-900';
    default:                       return 'border-gray-100 bg-white text-gray-900';
  }
};

const ListasTrabajo: React.FC = () => {
  // ─── Vista activa ─────────────────────────────────────────────────────────
  const [selectedLista, setSelectedLista] = useState<ListaTrabajo | null>(null);

  // ─── Vista 1: listado ─────────────────────────────────────────────────────
  const [listas, setListas] = useState<ListaTrabajo[]>([]);
  const [gestionadosCounts, setGestionadosCounts] = useState<Record<string, number>>({});
  const [loadingListas, setLoadingListas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Modal nueva lista
  const [showModal, setShowModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ─── Vista 2: detalle ─────────────────────────────────────────────────────
  const [items, setItems] = useState<ListaItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [filterBuscar, setFilterBuscar] = useState('');
  const [filterResultado, setFilterResultado] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [editingComentario, setEditingComentario] = useState<string | null>(null);
  const [comentarioValue, setComentarioValue] = useState('');

  // Modal importar mas CSV (Vista 2)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvFile, setImportCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchListas = async () => {
    setLoadingListas(true);
    const [listasRes, countsRes] = await Promise.all([
      supabase.from('listas_trabajo').select('*').order('created_at', { ascending: false }),
      supabase.from('lista_items').select('lista_id').neq('resultado', 'Sin gestionar'),
    ]);
    if (listasRes.error) {
      setError('Error al cargar las listas');
    } else {
      setListas(listasRes.data as ListaTrabajo[]);
      const counts: Record<string, number> = {};
      (countsRes.data || []).forEach((row: { lista_id: string }) => {
        counts[row.lista_id] = (counts[row.lista_id] || 0) + 1;
      });
      setGestionadosCounts(counts);
    }
    setLoadingListas(false);
  };

  const fetchItems = async (listaId: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('lista_items')
      .select('*')
      .eq('lista_id', listaId)
      .order('created_at', { ascending: true });
    if (!error) setItems(data as ListaItem[]);
    setLoadingItems(false);
  };

  useEffect(() => { fetchListas(); }, []);

  // ─── Acciones Vista 1 ────────────────────────────────────────────────────
  const handleCreateLista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) { setCreateError('Selecciona un archivo CSV'); return; }
    setCreating(true);
    setCreateError(null);
    try {
      const text = await csvFile.text();
      const rows = parseCSV(text);
      if (rows.length === 0 || !('nombre' in rows[0])) {
        setCreateError('El CSV debe tener al menos una fila con la columna "nombre"');
        setCreating(false);
        return;
      }
      const { data: listaData, error: listaError } = await supabase
        .from('listas_trabajo')
        .insert({ nombre: newNombre.trim(), total_items: rows.length })
        .select()
        .single();
      if (listaError) throw listaError;
      const itemsToInsert = rows.map(row => ({
        lista_id: listaData.id,
        nombre: row.nombre || '',
        cedula: row.cedula || null,
        mail: row.mail || null,
        telefono: row.telefono || null,
        sape: row.sape || null,
        carrera: row.carrera || null,
        fase_original: row.fase || null,
        proceso_inicio: row.proceso_inicio || null,
        liceo_tipo: row.liceo_tipo || null,
        resultado: 'Sin gestionar',
        comentario: null,
      }));
      const { error: itemsError } = await supabase.from('lista_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      setSuccess(`Lista "${newNombre.trim()}" creada con ${rows.length} items`);
      setShowModal(false);
      setNewNombre('');
      setCsvFile(null);
      await fetchListas();
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear la lista');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLista = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from('listas_trabajo').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Lista eliminada correctamente');
      await fetchListas();
    }
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  // ─── Acciones Vista 2 ────────────────────────────────────────────────────
  const handleVerDetalle = (lista: ListaTrabajo) => {
    setSelectedLista(lista);
    setFilterBuscar(''); setFilterResultado(''); setFilterCarrera('');
    setEditingComentario(null);
    fetchItems(lista.id);
  };

  const handleUpdateResultado = async (item: ListaItem, resultado: string) => {
    const { error } = await supabase.from('lista_items').update({ resultado }).eq('id', item.id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, resultado } : i));
    }
  };

  const handleStartEditComentario = (item: ListaItem) => {
    setEditingComentario(item.id);
    setComentarioValue(item.comentario || '');
  };

  const handleSaveComentario = async (item: ListaItem) => {
    const newVal = comentarioValue.trim() || null;
    const { error } = await supabase.from('lista_items').update({ comentario: newVal }).eq('id', item.id);
    if (!error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, comentario: newVal } : i));
    }
    setEditingComentario(null);
  };

  const handleImportMas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCsvFile || !selectedLista) { setImportError('Selecciona un archivo CSV'); return; }
    setImporting(true);
    setImportError(null);
    try {
      const text = await importCsvFile.text();
      const rows = parseCSV(text);
      if (rows.length === 0 || !('nombre' in rows[0])) {
        setImportError('El CSV debe tener al menos una fila con la columna "nombre"');
        setImporting(false);
        return;
      }
      const itemsToInsert = rows.map(row => ({
        lista_id: selectedLista.id,
        nombre: row.nombre || '',
        cedula: row.cedula || null,
        mail: row.mail || null,
        telefono: row.telefono || null,
        sape: row.sape || null,
        carrera: row.carrera || null,
        fase_original: row.fase || null,
        proceso_inicio: row.proceso_inicio || null,
        liceo_tipo: row.liceo_tipo || null,
        resultado: 'Sin gestionar',
        comentario: null,
      }));
      const { error: itemsError } = await supabase.from('lista_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      const newTotal = selectedLista.total_items + rows.length;
      const { error: updateError } = await supabase
        .from('listas_trabajo')
        .update({ total_items: newTotal })
        .eq('id', selectedLista.id);
      if (updateError) throw updateError;
      setSelectedLista({ ...selectedLista, total_items: newTotal });
      setShowImportModal(false);
      setImportCsvFile(null);
      await fetchItems(selectedLista.id);
    } catch (err: any) {
      setImportError(err.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  const exportCSV = () => {
    if (!selectedLista) return;
    const BOM = '\uFEFF';
    const headers = ['Nombre', 'Cedula', 'Mail', 'Telefono', 'SAPE', 'Carrera', 'Fase Original', 'Resultado', 'Comentario'];
    const csvRows = items.map(item =>
      [item.nombre, item.cedula, item.mail, item.telefono, item.sape, item.carrera, item.fase_original, item.resultado, item.comentario]
        .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = BOM + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLista.nombre.replace(/[^a-zA-Z0-9_\-]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Computed (Vista 2) ──────────────────────────────────────────────────
  const filteredItems = items.filter(item => {
    if (filterBuscar) {
      const q = filterBuscar.toLowerCase();
      if (
        !(item.nombre || '').toLowerCase().includes(q) &&
        !(item.cedula || '').toLowerCase().includes(q) &&
        !(item.mail || '').toLowerCase().includes(q)
      ) return false;
    }
    if (filterResultado && item.resultado !== filterResultado) return false;
    if (filterCarrera && item.carrera !== filterCarrera) return false;
    return true;
  });

  const countByResultado: Record<string, number> = {};
  RESULTADOS.forEach(r => { countByResultado[r] = items.filter(i => i.resultado === r).length; });
  const carreras = [...new Set(items.map(i => i.carrera).filter(Boolean))].sort() as string[];
  const hasFilters = filterBuscar || filterResultado || filterCarrera;

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA 2: DETALLE DE LISTA
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedLista) {
    return (
      <div>
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedLista(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Volver
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedLista.nombre}</h2>
              <p className="text-sm text-gray-400">{formatDate(selectedLista.created_at)} &middot; {selectedLista.total_items} items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowImportModal(true); setImportError(null); setImportCsvFile(null); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Importar CSV
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Resumen por resultado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {RESULTADOS.map(r => (
            <button
              key={r}
              onClick={() => setFilterResultado(filterResultado === r ? '' : r)}
              className={`rounded-xl border shadow-sm p-3 text-center transition-all hover:shadow-md ${
                filterResultado === r
                  ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300'
                  : resultadoCardStyle(r)
              }`}
            >
              <p className="text-2xl font-black">{countByResultado[r] || 0}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5 leading-tight">{r}</p>
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input
            type="text"
            placeholder="Buscar nombre, cédula o mail..."
            value={filterBuscar}
            onChange={e => setFilterBuscar(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[220px] ${filterBuscar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          />
          <select
            value={filterResultado}
            onChange={e => setFilterResultado(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${filterResultado ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 bg-white text-gray-700'}`}
          >
            <option value="">Todos los resultados</option>
            {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterCarrera}
            onChange={e => setFilterCarrera(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${filterCarrera ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 bg-white text-gray-700'}`}
          >
            <option value="">Todas las carreras</option>
            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setFilterBuscar(''); setFilterResultado(''); setFilterCarrera(''); }}
              className="text-sm text-red-500 hover:text-red-700 font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Limpiar
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filteredItems.length} de {items.length}</span>
        </div>

        {/* Tabla */}
        {loadingItems ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Nombre</th>
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Cédula</th>
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Carrera</th>
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Fase Original</th>
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Resultado</th>
                    <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Comentario</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-400 py-12">
                        {hasFilters ? 'No hay items que coincidan con los filtros' : 'No hay items en esta lista'}
                      </td>
                    </tr>
                  ) : filteredItems.map(item => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900 max-w-[200px]">{item.nombre}</td>
                      <td className="p-4 text-gray-500">{item.cedula || '—'}</td>
                      <td className="p-4 text-gray-500">{item.carrera || '—'}</td>
                      <td className="p-4 text-gray-400 italic text-xs">{item.fase_original || '—'}</td>
                      <td className="p-4">
                        <select
                          value={item.resultado}
                          onChange={e => handleUpdateResultado(item, e.target.value)}
                          className={`border rounded-lg px-2 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${resultadoStyle(item.resultado)}`}
                        >
                          {RESULTADOS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="p-4 min-w-[180px]">
                        {editingComentario === item.id ? (
                          <input
                            autoFocus
                            value={comentarioValue}
                            onChange={e => setComentarioValue(e.target.value)}
                            onBlur={() => handleSaveComentario(item)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveComentario(item);
                              if (e.key === 'Escape') setEditingComentario(null);
                            }}
                            className="w-full border border-blue-400 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <span
                            onClick={() => handleStartEditComentario(item)}
                            className={`cursor-pointer rounded px-1 py-0.5 hover:bg-blue-50 transition-colors text-sm ${item.comentario ? 'text-gray-700' : 'text-gray-300 italic'}`}
                          >
                            {item.comentario || 'Agregar...'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal importar mas CSV */}
        {showImportModal && (
          <>
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !importing && setShowImportModal(false)} />
            <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
              <div className="min-h-full flex items-start justify-center py-8 px-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                  <form onSubmit={handleImportMas}>
                    <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                      <h3 className="text-xl font-bold">Importar CSV adicional</h3>
                      <p className="text-sm opacity-80">{selectedLista.nombre}</p>
                    </div>
                    <div className="p-8 space-y-5">
                      {importError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                          {importError}
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Archivo CSV</label>
                        <input
                          type="file"
                          accept=".csv"
                          required
                          onChange={e => setImportCsvFile(e.target.files?.[0] || null)}
                          className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">
                          Los nuevos items se agregan al final de la lista con resultado <span className="font-semibold">Sin gestionar</span>.
                        </p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowImportModal(false)}
                        disabled={importing}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={importing}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {importing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Importando...
                          </>
                        ) : 'Agregar items'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISTA 1: LISTADO DE LISTAS
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listas de Trabajo</h2>
        <button
          onClick={() => { setShowModal(true); setCreateError(null); setNewNombre(''); setCsvFile(null); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
        >
          + Nueva Lista
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">{success}</div>
      )}

      {loadingListas ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Nombre</th>
                  <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Fecha Creación</th>
                  <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Items</th>
                  <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Progreso</th>
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <p className="text-gray-400 font-medium">No hay listas creadas aún</p>
                      <p className="text-gray-300 text-sm mt-1">Crea tu primera lista importando un CSV</p>
                    </td>
                  </tr>
                ) : listas.map(lista => {
                  const g = gestionadosCounts[lista.id] || 0;
                  const pct = lista.total_items > 0 ? Math.round((g / lista.total_items) * 100) : 0;
                  return (
                    <tr key={lista.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{lista.nombre}</td>
                      <td className="p-4 text-gray-500 text-sm">{formatDate(lista.created_at)}</td>
                      <td className="p-4 text-gray-500 text-sm">{lista.total_items}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px] max-w-[100px]">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{g} de {lista.total_items}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {confirmDeleteId === lista.id ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="text-xs text-gray-500">¿Eliminar?</span>
                            <button
                              onClick={() => handleDeleteLista(lista.id)}
                              disabled={deleting}
                              className="text-xs text-red-600 hover:text-red-800 font-bold"
                            >
                              {deleting ? '...' : 'Sí'}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <span className="space-x-3">
                            <button
                              onClick={() => handleVerDetalle(lista)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(lista.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-bold"
                            >
                              Eliminar
                            </button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal nueva lista */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !creating && setShowModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleCreateLista}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Nueva Lista de Trabajo</h3>
                    <p className="text-sm opacity-80">Importa un snapshot de oportunidades desde CSV</p>
                  </div>
                  <div className="p-8 space-y-5">
                    {createError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                        {createError}
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre de la lista</label>
                      <input
                        value={newNombre}
                        onChange={e => setNewNombre(e.target.value)}
                        required
                        placeholder="ej: evaluacion oportunidades con ras - 3/3/2026"
                        className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Archivo CSV</label>
                      <input
                        type="file"
                        accept=".csv"
                        required
                        onChange={e => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Columnas esperadas: <span className="font-semibold">nombre</span> (obligatorio), cedula, mail, telefono, sape, carrera, fase, proceso_inicio, liceo_tipo
                      </p>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={creating}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Importando...
                        </>
                      ) : 'Crear Lista'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListasTrabajo;
