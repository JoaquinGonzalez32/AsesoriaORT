import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { syncListaItemsWithOportunidades } from '../lib/syncListaOportunidades';

interface Lista {
  id: string;
  nombre: string;
  completada: boolean;
  created_at: string;
  count?: number;
}

// ─── Mapeo de carreras ────────────────────────────────────────────────────────

const CARRERA_RAW: [string, string][] = [
  ['Diseñador Gráfico',                       'GF'],
  ['Diseñador Digital',                       'WE'],
  ['Licenciatura en Animación y Videojuegos', 'LV'],
  ['Licenciatura en Diseño Multimedia',       'LD'],
  ['Licenciatura en Diseño, Arte y Tecnología','LT'],
  ['Licenciatura en Diseño de Modas',         'WY'],
  ['Licenciatura en Diseño Gráfico',          'LG'],
  ['Desarrollo y Producción de Videojuegos',  'VD'],
  ['Diseño de Interfaces',                    'UI'],
  ['Licenciatura en Diseño Industrial',       'YN'],
];

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const mapCarrera = (producto: string): string | null => {
  const key = normalize(producto);
  for (const [raw, code] of CARRERA_RAW) {
    if (normalize(raw) === key) return code;
  }
  return null;
};

const extractNombre = (nombreTrato: string): string =>
  (nombreTrato.split(' - ')[0] || nombreTrato).trim();

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
};

// ─────────────────────────────────────────────────────────────────────────────

const ListasTrabajo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listas, setListas] = useState<Lista[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nueva lista
  const [showNewModal, setShowNewModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ type: 'success' | 'warning'; title: string; details?: string[] } | null>(null);

  // Delete lista
  const [deletingLista, setDeletingLista] = useState<Lista | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchListas = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('listas')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Error al cargar las listas: ' + err.message);
      setLoading(false);
      return;
    }

    // Contar items por lista
    const { data: counts } = await supabase
      .from('listas_de_trabajo')
      .select('lista_id');
    const countMap: Record<string, number> = {};
    (counts || []).forEach((row: any) => {
      if (row.lista_id) countMap[row.lista_id] = (countMap[row.lista_id] || 0) + 1;
    });

    setListas((data || []).map(l => ({ ...l, count: countMap[l.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchListas(); }, []);

  // ─── Crear nueva lista ──────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) { setImportError('Ingresá un nombre para la lista'); return; }
    setImporting(true);
    setImportError(null);
    try {
      // Crear la lista
      const { data: newLista, error: listaErr } = await supabase
        .from('listas')
        .insert([{ nombre: newNombre.trim() }])
        .select()
        .single();
      if (listaErr) throw listaErr;

      // Si hay CSV, importar items
      if (csvFile) {
        const text = await csvFile.text();
        const rows = parseCSV(text);

        if (rows.length === 0) {
          setImportError('El archivo CSV está vacío');
          setImporting(false);
          return;
        }
        if (!('Nombre de Trato' in rows[0])) {
          setImportError('El CSV debe tener la columna "Nombre de Trato"');
          setImporting(false);
          return;
        }
        if (!('Producto' in rows[0])) {
          setImportError('El CSV debe tener la columna "Producto"');
          setImporting(false);
          return;
        }

        const warnings: string[] = [];
        const rawItems = rows
          .filter(row => row['Nombre de Trato'])
          .map(row => {
            const nombreTrato = row['Nombre de Trato'];
            const producto = row['Producto'] || '';
            const carrera = producto ? mapCarrera(producto) : null;
            if (producto && !carrera && !warnings.includes(producto)) {
              warnings.push(producto);
            }
            return {
              nombre_trato: nombreTrato,
              nombre: extractNombre(nombreTrato),
              fase: row['Fase'] || null,
              carrera_interes: carrera,
              codigo_sape: row['Codigo SAPE'] || null,
              proceso: row['Proceso'] || null,
              lista_id: newLista.id,
            };
          });

        // Sync with oportunidades
        const syncResult = await syncListaItemsWithOportunidades(rawItems, user?.id || '');

        const itemsToInsert = syncResult.items.map(({ opp_id, tag, ...rest }) => ({
          ...rest,
          opp_id,
          tag,
        }));

        const { error: insertErr } = await supabase
          .from('listas_de_trabajo')
          .insert(itemsToInsert);
        if (insertErr) throw insertErr;

        const syncDetails: string[] = [];
        if (syncResult.vinculadas > 0) syncDetails.push(`${syncResult.vinculadas} vinculadas a oportunidades existentes`);
        if (syncResult.creadas > 0) syncDetails.push(`${syncResult.creadas} oportunidades creadas`);
        if (syncResult.sinSape > 0) syncDetails.push(`${syncResult.sinSape} sin SAPE (no vinculadas)`);
        if (syncResult.creadasSinRas > 0) syncDetails.push(`${syncResult.creadasSinRas} oportunidad${syncResult.creadasSinRas !== 1 ? 'es tienen' : ' tiene'} RAS agendada marcada pero no hay RAS creada — agendar manualmente`);
        if (syncResult.errors.length > 0) syncDetails.push(...syncResult.errors);

        const hasWarnings = warnings.length > 0 || syncResult.creadasSinRas > 0;

        if (hasWarnings) {
          setImportResult({
            type: 'warning',
            title: `Lista creada con ${itemsToInsert.length} registros`,
            details: [
              ...warnings.map(w => `Producto "${w}" no reconocido, se importó sin carrera`),
              ...syncDetails,
            ],
          });
        } else {
          setImportResult({
            type: 'success',
            title: `Lista creada con ${itemsToInsert.length} registros`,
            details: syncDetails.length > 0 ? syncDetails : undefined,
          });
        }
      } else {
        setImportResult({ type: 'success', title: 'Lista creada (vacía)' });
      }

      setShowNewModal(false);
      setNewNombre('');
      setCsvFile(null);
      await fetchListas();
    } catch (err: any) {
      setImportError(err.message || 'Error al crear la lista');
    } finally {
      setImporting(false);
    }
  };

  // ─── Delete lista ──────────────────────────────────────────────────────

  const handleDeleteLista = async () => {
    if (!deletingLista) return;
    setDeleting(true);
    // ON DELETE CASCADE borra los items automaticamente
    const { error } = await supabase.from('listas').delete().eq('id', deletingLista.id);
    if (error) {
      setError(error.message);
    } else {
      await fetchListas();
    }
    setDeletingLista(null);
    setDeleting(false);
  };

  // ─── Toggle completada ──────────────────────────────────────────────────

  const toggleCompletada = async (lista: Lista, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !lista.completada;
    const { error: err } = await supabase
      .from('listas')
      .update({ completada: newVal })
      .eq('id', lista.id);
    if (err) {
      setError(err.message);
    } else {
      setListas(prev => prev.map(l => l.id === lista.id ? { ...l, completada: newVal } : l));
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Listas de Trabajo</h2>
          <p className="text-sm text-gray-500">Importaciones de oportunidades desde Zoho CRM</p>
        </div>
        <button
          onClick={() => { setShowNewModal(true); setImportError(null); setCsvFile(null); setNewNombre(''); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
        >
          + Nueva Lista
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="relative bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">
          {error}
          <button onClick={() => setError(null)} className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}
      {importResult && (
        <div className={`relative border rounded-xl px-4 py-3 text-sm mb-4 ${
          importResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <button onClick={() => setImportResult(null)} className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
          <div className="flex items-center gap-2 font-bold pr-6">
            {importResult.type === 'success' && <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
            {importResult.type === 'warning' && <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            {importResult.title}
          </div>
          {importResult.details && importResult.details.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs opacity-80">
              {importResult.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
          <p className="text-gray-400 font-medium">No hay listas creadas</p>
          <p className="text-gray-300 text-sm mt-1">Creá una nueva lista importando un CSV</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listas.map(lista => (
            <div
              key={lista.id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${lista.completada ? 'opacity-60' : ''}`}
              onClick={() => navigate(`/listas-de-trabajo/${lista.id}`)}
            >
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{lista.nombre}</h3>
                      {lista.completada && (
                        <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Completada</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {lista.count} registro{lista.count !== 1 ? 's' : ''} · {new Date(lista.created_at).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleCompletada(lista, e)}
                    className={`p-2 rounded-lg transition-colors ${
                      lista.completada
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-300 hover:text-green-600 hover:bg-green-50 opacity-0 group-hover:opacity-100'
                    }`}
                    title={lista.completada ? 'Desmarcar completada' : 'Marcar completada'}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletingLista(lista); }}
                    className="text-gray-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar lista"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nueva lista */}
      {showNewModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !importing && setShowNewModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleCreate}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Nueva Lista de Trabajo</h3>
                    <p className="text-sm opacity-80">Creá una nueva lista e importá registros desde un CSV</p>
                  </div>
                  <div className="p-8 space-y-5">
                    {importError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">{importError}</div>
                    )}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre de la lista *</label>
                      <input
                        value={newNombre}
                        onChange={e => setNewNombre(e.target.value)}
                        required
                        placeholder="ej: Zoho Marzo 2026"
                        className="w-full border-gray-200 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Archivo CSV (opcional)</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={e => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Columnas obligatorias: <span className="font-semibold">Nombre de Trato</span>, <span className="font-semibold">Producto</span>. Podés importar después si preferís.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={() => setShowNewModal(false)} disabled={importing} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={importing} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
                      {importing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creando...</>) : 'Crear Lista'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal eliminar lista */}
      {deletingLista && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeletingLista(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 duration-200">
                <div className="p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar lista</h3>
                  <p className="text-gray-500 text-sm">¿Confirmas que querés eliminar esta lista y todos sus registros? La acción no se puede deshacer.</p>
                  <p className="mt-3 font-bold text-gray-800 text-sm bg-gray-50 rounded-lg px-3 py-2">{deletingLista.nombre} ({deletingLista.count} registros)</p>
                </div>
                <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                  <button onClick={() => setDeletingLista(null)} disabled={deleting} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50">Cancelar</button>
                  <button onClick={handleDeleteLista} disabled={deleting} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50">
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListasTrabajo;
