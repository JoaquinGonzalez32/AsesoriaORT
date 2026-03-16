import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ListaDeTrabajoItem {
  id: string;
  nombre_trato: string;
  nombre: string;
  fase: string | null;
  carrera_interes: string | null;
  codigo_sape: string | null;
  proceso: string | null;
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

const FASES = [
  'Interesado', 'Evaluando', 'Contactado',
  'No interesado', 'Promesa de Inscripcion', 'Inscripto',
];

const CODIGOS = ['GF', 'WE', 'LV', 'LD', 'LT', 'WY', 'LG', 'VD', 'UI', 'YN'];

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const mapCarrera = (producto: string): string | null => {
  const key = normalize(producto);
  for (const [raw, code] of CARRERA_RAW) {
    if (normalize(raw) === key) return code;
  }
  return null;
};

const extractNombre = (nombreTrato: string): string =>
  (nombreTrato.split(' - ')[0] || nombreTrato).trim();

// ─── CSV parser (preserva mayúsculas en headers) ──────────────────────────────

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

  // Edit
  const [editingItem, setEditingItem] = useState<ListaDeTrabajoItem | null>(null);
  const [editNombreTrato, setEditNombreTrato] = useState('');
  const [editFase, setEditFase] = useState('');
  const [editCarrera, setEditCarrera] = useState('');
  const [editSape, setEditSape] = useState('');
  const [editProceso, setEditProceso] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete
  const [deletingItem, setDeletingItem] = useState<ListaDeTrabajoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('listas_de_trabajo')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError('Error al cargar los registros: ' + error.message);
    } else {
      setItems(data as ListaDeTrabajoItem[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  // ─── Import ───────────────────────────────────────────────────────────────

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
      const itemsToInsert = rows
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
          };
        });

      const { error: insertError } = await supabase
        .from('listas_de_trabajo')
        .insert(itemsToInsert);
      if (insertError) throw insertError;

      setImportWarnings(warnings);
      setSuccess(`${itemsToInsert.length} registro${itemsToInsert.length !== 1 ? 's' : ''} importado${itemsToInsert.length !== 1 ? 's' : ''} correctamente`);
      setShowImportModal(false);
      setCsvFile(null);
      await fetchItems();
    } catch (err: any) {
      setImportError(err.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  // ─── Edit ────────────────────────────────────────────────────────────────

  const openEdit = (item: ListaDeTrabajoItem) => {
    setEditingItem(item);
    setEditNombreTrato(item.nombre_trato);
    setEditFase(item.fase || '');
    setEditCarrera(item.carrera_interes || '');
    setEditSape(item.codigo_sape || '');
    setEditProceso(item.proceso || '');
    setEditError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    setEditError(null);
    try {
      const { error } = await supabase
        .from('listas_de_trabajo')
        .update({
          nombre_trato: editNombreTrato.trim(),
          nombre: extractNombre(editNombreTrato.trim()),
          fase: editFase || null,
          carrera_interes: editCarrera || null,
          codigo_sape: editSape.trim() || null,
          proceso: editProceso.trim() || null,
        })
        .eq('id', editingItem.id);
      if (error) throw error;
      setSuccess('Registro actualizado correctamente');
      setEditingItem(null);
      await fetchItems();
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingItem) return;
    setDeleting(true);
    const { error } = await supabase
      .from('listas_de_trabajo')
      .delete()
      .eq('id', deletingItem.id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Registro eliminado');
      await fetchItems();
    }
    setDeletingItem(null);
    setDeleting(false);
  };

  // ─── Computed ────────────────────────────────────────────────────────────

  const filteredItems = buscar
    ? items.filter(i => i.nombre_trato.toLowerCase().includes(buscar.toLowerCase()))
    : items;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listas de Trabajo</h2>
        <button
          onClick={() => { setShowImportModal(true); setImportError(null); setCsvFile(null); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
        >
          + Importar CSV
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">{success}</div>
      )}
      {importWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-4">
          <p className="font-bold mb-1">Productos no reconocidos — se importaron con carrera vacía:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {importWarnings.map(w => <li key={w}>{w}</li>)}
          </ul>
          <button
            onClick={() => setImportWarnings([])}
            className="mt-2 text-amber-700 hover:text-amber-900 text-xs font-bold underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de trato..."
          value={buscar}
          onChange={e => setBuscar(e.target.value)}
          className={`border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm ${buscar ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
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
                  <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <p className="text-gray-400 font-medium">{buscar ? 'No hay registros que coincidan' : 'No hay registros importados'}</p>
                      {!buscar && <p className="text-gray-300 text-sm mt-1">Importa un CSV para comenzar</p>}
                    </td>
                  </tr>
                ) : filteredItems.map(item => (
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
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-400 text-right">
              {filteredItems.length} de {items.length} registros
            </div>
          )}
        </div>
      )}

      {/* Modal importar CSV */}
      {showImportModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !importing && setShowImportModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleImport}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Importar CSV</h3>
                    <p className="text-sm opacity-80">Importa oportunidades desde un CSV de Zoho CRM</p>
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
                        onChange={e => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Columnas obligatorias: <span className="font-semibold">Nombre de Trato</span>, <span className="font-semibold">Producto</span>. Opcionales: Fase, Codigo SAPE, Proceso.
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
                      ) : 'Importar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal editar */}
      {editingItem && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setEditingItem(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleEdit}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Editar Registro</h3>
                    <p className="text-sm opacity-80 truncate">{editingItem.nombre_trato}</p>
                  </div>
                  <div className="p-8 space-y-4">
                    {editError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                        {editError}
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre de Trato</label>
                      <input
                        value={editNombreTrato}
                        onChange={e => setEditNombreTrato(e.target.value)}
                        required
                        className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      {editNombreTrato && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          Nombre extraído: <span className="font-semibold text-gray-600">{extractNombre(editNombreTrato)}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Fase</label>
                      <select
                        value={editFase}
                        onChange={e => setEditFase(e.target.value)}
                        className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">— Sin fase —</option>
                        {FASES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Carrera</label>
                      <select
                        value={editCarrera}
                        onChange={e => setEditCarrera(e.target.value)}
                        className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="">— Sin carrera —</option>
                        {CODIGOS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Código SAPE</label>
                        <input
                          value={editSape}
                          onChange={e => setEditSape(e.target.value)}
                          className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Proceso</label>
                        <input
                          value={editProceso}
                          onChange={e => setEditProceso(e.target.value)}
                          placeholder="ej: Marzo 2026"
                          className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal eliminar */}
      {deletingItem && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeletingItem(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-center justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 duration-200">
                <div className="p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar registro</h3>
                  <p className="text-gray-500 text-sm">¿Confirmas que querés eliminar este registro? La acción no se puede deshacer.</p>
                  <p className="mt-3 font-bold text-gray-800 text-sm bg-gray-50 rounded-lg px-3 py-2 truncate">{deletingItem.nombre_trato}</p>
                </div>
                <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                  <button
                    onClick={() => setDeletingItem(null)}
                    disabled={deleting}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50"
                  >
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
