import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { syncListaItemsWithOportunidades } from '../lib/syncListaOportunidades';
import InfoTooltip from './InfoTooltip';
import Breadcrumbs from './ui/Breadcrumbs';
import { ROUTES } from '../constants';

interface ListaDeTrabajoItem {
  id: string;
  nombre_trato: string;
  nombre: string;
  fase: string | null;
  carrera_interes: string | null;
  codigo_sape: string | null;
  proceso: string | null;
  lista_id: string | null;
  tag: string | null;
  opp_id: string | null;
  created_at: string;
}

interface Lista {
  id: string;
  nombre: string;
  completada: boolean;
  created_at: string;
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

// ─── Tag options ──────────────────────────────────────────────────────────────

const TAG_OPTIONS = ['SIN CONTACTAR', 'AGUARDANDO RESPUESTA', 'DESINTERESADO'] as const;

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'SIN CONTACTAR':        { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200' },
  'AGUARDANDO RESPUESTA': { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  'DESINTERESADO':        { bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200' },
};

// ─────────────────────────────────────────────────────────────────────────────

const ListaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lista, setLista] = useState<Lista | null>(null);
  const [items, setItems] = useState<ListaDeTrabajoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [buscar, setBuscar] = useState('');

  // Import
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setLoading(true);
    const { data: listaData, error: listaErr } = await supabase
      .from('listas')
      .select('*')
      .eq('id', id)
      .single();
    if (listaErr) {
      setError('Lista no encontrada');
      setLoading(false);
      return;
    }
    setLista(listaData);

    const { data, error: itemsErr } = await supabase
      .from('listas_de_trabajo')
      .select('*')
      .eq('lista_id', id)
      .order('created_at', { ascending: false });
    if (itemsErr) {
      setError('Error al cargar los registros: ' + itemsErr.message);
    } else {
      setItems(data as ListaDeTrabajoItem[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  // ─── Toggle completada ──────────────────────────────────────────────────

  const toggleCompletada = async () => {
    if (!lista) return;
    const newVal = !lista.completada;
    const { error: err } = await supabase
      .from('listas')
      .update({ completada: newVal })
      .eq('id', lista.id);
    if (err) {
      setError(err.message);
    } else {
      setLista({ ...lista, completada: newVal });
    }
  };

  // ─── Tag change ─────────────────────────────────────────────────────────

  const handleTagChange = async (itemId: string, newTag: string | null) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.opp_id) {
      // Actualizar todos los items que comparten la misma oportunidad (en todas las listas)
      const { error: err } = await supabase
        .from('listas_de_trabajo')
        .update({ tag: newTag })
        .eq('opp_id', item.opp_id);
      if (err) {
        setError(err.message);
      } else {
        setItems(prev => prev.map(i => i.opp_id === item.opp_id ? { ...i, tag: newTag } : i));
      }
    } else {
      // Sin opp_id: solo actualizar este item específico
      const { error: err } = await supabase
        .from('listas_de_trabajo')
        .update({ tag: newTag })
        .eq('id', itemId);
      if (err) {
        setError(err.message);
      } else {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, tag: newTag } : i));
      }
    }
  };

  // ─── Import (agregar más items a esta lista) ───────────────────────────────

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) { setImportError('Selecciona un archivo CSV'); return; }
    setImporting(true);
    setImportError(null);
    try {
      const text = await csvFile.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        setImportError('El archivo CSV está vacío o no tiene el formato correcto');
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
            lista_id: id!,
          };
        });

      // Dedup: skip items whose nombre_trato already exists in this lista
      const existingNombres = new Set(items.map(i => i.nombre_trato.toLowerCase()));
      const deduped = rawItems.filter(i => !existingNombres.has(i.nombre_trato.toLowerCase()));
      const skipped = rawItems.length - deduped.length;

      if (deduped.length === 0) {
        setImportError(`Todos los registros (${rawItems.length}) ya existen en esta lista`);
        setImporting(false);
        return;
      }

      // Sync with oportunidades
      const syncResult = await syncListaItemsWithOportunidades(deduped, user?.id || '');

      const itemsToInsert = syncResult.items.map(({ opp_id, tag, ...rest }) => ({
        ...rest,
        opp_id,
        tag,
      }));

      const { error: insertError } = await supabase
        .from('listas_de_trabajo')
        .insert(itemsToInsert);
      if (insertError) throw insertError;

      const parts: string[] = [`${itemsToInsert.length} registro${itemsToInsert.length !== 1 ? 's' : ''} agregado${itemsToInsert.length !== 1 ? 's' : ''}`];
      if (skipped > 0) parts.push(`${skipped} duplicado${skipped !== 1 ? 's' : ''} omitido${skipped !== 1 ? 's' : ''}`);
      if (syncResult.vinculadas > 0) parts.push(`${syncResult.vinculadas} vinculadas a oportunidades existentes`);
      if (syncResult.creadas > 0) parts.push(`${syncResult.creadas} oportunidades creadas`);
      if (syncResult.sinSape > 0) parts.push(`${syncResult.sinSape} sin SAPE (no vinculadas)`);
      setSuccess(parts.join(' · '));

      const allWarnings = [...warnings];
      if (syncResult.creadasSinRas > 0) {
        allWarnings.push(`${syncResult.creadasSinRas} oportunidad${syncResult.creadasSinRas !== 1 ? 'es tienen' : ' tiene'} RAS agendada marcada pero no hay RAS creada — agendar manualmente`);
      }
      setImportWarnings(allWarnings);

      if (syncResult.errors.length > 0) {
        setError(syncResult.errors.join('; '));
      }

      setShowImportModal(false);
      setCsvFile(null);
      await fetchData();
    } catch (err: any) {
      setImportError(err.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  // ─── Computed ────────────────────────────────────────────────────────────

  const filteredItems = buscar
    ? items.filter(i => i.nombre_trato.toLowerCase().includes(buscar.toLowerCase()))
    : items;

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lista) return (
    <div className="text-center py-20">
      <p className="text-gray-400 font-medium mb-4">Lista no encontrada</p>
      <button onClick={() => navigate('/listas-de-trabajo')} className="text-blue-600 font-bold text-sm hover:underline">Volver a listas</button>
    </div>
  );

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'Listas de Trabajo', to: ROUTES.LISTAS_TRABAJO },
        { label: lista?.nombre || 'Cargando...' },
      ]} />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/listas-de-trabajo')} aria-label="Volver a listas de trabajo" className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{lista.nombre}</h2>
              <InfoTooltip text="Detalle de la lista importada. Cada fila es una oportunidad del CSV. Usá los tags para marcar el estado de contacto. Si la oportunidad tiene SAPE, podés hacer clic en 'Ver' para ir al detalle completo. Los cambios de tag se sincronizan en todas las listas que compartan la misma oportunidad." />
              {lista.completada && (
                <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">Completada</span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {items.length} registro{items.length !== 1 ? 's' : ''} · Creada {new Date(lista.created_at).toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleCompletada}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              lista.completada
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {lista.completada ? <path d="M20 6L9 17l-5-5"/> : <path d="M12 5v14M5 12h14"/>}
              </svg>
              {lista.completada ? 'Completada' : 'Marcar completada'}
            </span>
          </button>
          <button
            onClick={() => { setShowImportModal(true); setImportError(null); setCsvFile(null); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
          >
            + Agregar desde CSV
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="relative bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">
          {error}
          <button onClick={() => setError(null)} aria-label="Cerrar mensaje de error" className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}
      {success && (
        <div className="relative bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">
          {success}
          <button onClick={() => setSuccess(null)} aria-label="Cerrar mensaje de éxito" className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}
      {importWarnings.length > 0 && (
        <div className="relative bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-4">
          <button onClick={() => setImportWarnings([])} aria-label="Cerrar advertencias" className="absolute top-2.5 right-3 opacity-50 hover:opacity-100 text-lg leading-none">&times;</button>
          <p className="font-bold mb-1 pr-6">Productos no reconocidos — se importaron con carrera vacía:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {importWarnings.map(w => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de trato..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className={`border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm ${buscar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Nombre de Trato</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Fase</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Carrera</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">SAPE</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Proceso</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase"><span className="flex items-center gap-1">Tag <InfoTooltip text="Sin Contactar: aún no se intentó comunicación. Aguardando Respuesta: se contactó y se espera respuesta. Desinteresado: el prospecto no tiene interés." /></span></th>
                <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <p className="text-gray-400 font-medium">{buscar ? 'No hay registros que coincidan' : 'Esta lista está vacía'}</p>
                    {!buscar && <p className="text-gray-300 text-sm mt-1">Agregá registros desde un CSV</p>}
                  </td>
                </tr>
              ) : filteredItems.map(item => {
                const tagStyle = item.tag ? TAG_COLORS[item.tag] || TAG_COLORS['SIN CONTACTAR'] : null;
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-900 max-w-[280px]">
                      <span className="block truncate" title={item.nombre_trato}>{item.nombre_trato}</span>
                    </td>
                    <td className="p-4 text-gray-500">{item.fase || '—'}</td>
                    <td className="p-4">
                      {item.carrera_interes
                        ? <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold text-xs">{item.carrera_interes}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                    <td className="p-4 text-gray-500">{item.codigo_sape || '—'}</td>
                    <td className="p-4 text-gray-500">{item.proceso || '—'}</td>
                    <td className="p-4">
                      <select
                        value={item.tag || ''}
                        onChange={e => handleTagChange(item.id, e.target.value || null)}
                        className={`text-xs font-bold rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${
                          tagStyle
                            ? `${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                        }`}
                      >
                        <option value="">— Sin tag —</option>
                        {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      {item.opp_id ? (
                        <button
                          onClick={() => navigate(`/opportunities/${item.opp_id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                        >
                          Ver
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">Sin vincular</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredItems.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400 text-right">
            {filteredItems.length} de {items.length} registros
          </div>
        )}
      </div>

      {/* Modal importar CSV */}
      {showImportModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !importing && setShowImportModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleImport}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Agregar registros</h3>
                    <p className="text-sm opacity-80">Importá más registros a esta lista desde un CSV</p>
                  </div>
                  <div className="p-8 space-y-5">
                    {importError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">{importError}</div>
                    )}
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
                        Columnas obligatorias: <span className="font-semibold">Nombre de Trato</span>, <span className="font-semibold">Producto</span>.
                      </p>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={() => setShowImportModal(false)} disabled={importing} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={importing} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
                      {importing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Importando...</>) : 'Importar'}
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

export default ListaDetalle;
