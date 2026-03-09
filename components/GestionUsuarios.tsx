import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { tienePermiso, type Profile, type Rol } from '../lib/permisos';

const ROLES: Rol[] = ['admin', 'coordinador', 'asesor'];

const rolBadge = (rol: Rol) => {
  const colors: Record<Rol, string> = {
    admin: 'bg-red-100 text-red-700',
    coordinador: 'bg-amber-100 text-amber-700',
    asesor: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${colors[rol]}`}>
      {rol}
    </span>
  );
};

const GestionUsuarios: React.FC = () => {
  const { profile: myProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Create user form state
  const [newNombre, setNewNombre] = useState('');
  const [newApellido, setNewApellido] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRol, setNewRol] = useState<Rol>('asesor');

  // Edit form state
  const [editNombre, setEditNombre] = useState('');
  const [editApellido, setEditApellido] = useState('');
  const [editRol, setEditRol] = useState<Rol>('asesor');

  const canManage = tienePermiso(myProfile?.rol, 'gestionarUsuarios');

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (!canManage) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-bold text-lg">Acceso denegado</p>
        <p className="text-gray-500 text-sm mt-2">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newEmail,
          password: newPassword,
          nombre: newNombre,
          apellido: newApellido,
          rol: newRol,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuccess(`Usuario ${newEmail} creado correctamente`);
      setShowModal(false);
      resetCreateForm();
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ nombre: editNombre, apellido: editApellido, rol: editRol })
        .eq('id', editingProfile.id);
      if (error) throw error;
      setSuccess(`Perfil de ${editNombre} actualizado`);
      setEditingProfile(null);
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActivo = async (p: Profile) => {
    setError(null);
    setSuccess(null);
    const newActivo = !p.activo;
    const { error } = await supabase
      .from('profiles')
      .update({ activo: newActivo })
      .eq('id', p.id);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(`${p.nombre} ${newActivo ? 'activado' : 'desactivado'}`);
      await fetchProfiles();
    }
  };

  const openEdit = (p: Profile) => {
    setEditNombre(p.nombre);
    setEditApellido(p.apellido);
    setEditRol(p.rol);
    setEditingProfile(p);
    setError(null);
    setSuccess(null);
  };

  const resetCreateForm = () => {
    setNewNombre('');
    setNewApellido('');
    setNewEmail('');
    setNewPassword('');
    setNewRol('asesor');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h2>
        <button
          onClick={() => { setShowModal(true); setError(null); setSuccess(null); }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98]"
        >
          + Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 font-medium mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Nombre</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Email</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Rol</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Estado</th>
                <th className="text-left p-4 text-[10px] font-black text-gray-400 uppercase">Creado</th>
                <th className="text-right p-4 text-[10px] font-black text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{p.nombre} {p.apellido}</td>
                  <td className="p-4 text-gray-500 text-sm">{p.email}</td>
                  <td className="p-4">{rolBadge(p.rol)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                    >
                      Editar
                    </button>
                    {p.id !== myProfile?.id && (
                      <button
                        onClick={() => toggleActivo(p)}
                        className={`text-sm font-bold ${p.activo ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear usuario */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleCreateUser}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Nuevo Usuario</h3>
                    <p className="text-sm opacity-80">Crear una nueva cuenta en el sistema</p>
                  </div>
                  <div className="p-8 space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre</label>
                        <input value={newNombre} onChange={(e) => setNewNombre(e.target.value)} required className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Apellido</label>
                        <input value={newApellido} onChange={(e) => setNewApellido(e.target.value)} required className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Email</label>
                      <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Contrasena temporal</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Rol</label>
                      <select value={newRol} onChange={(e) => setNewRol(e.target.value as Rol)} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={() => { setShowModal(false); resetCreateForm(); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50">
                      {submitting ? 'Creando...' : 'Crear Usuario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal editar perfil */}
      {editingProfile && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setEditingProfile(null)} />
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="min-h-full flex items-start justify-center py-8 px-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto animate-in zoom-in-95 duration-200">
                <form onSubmit={handleEditProfile}>
                  <div className="px-8 py-6 bg-blue-600 text-white rounded-t-2xl">
                    <h3 className="text-xl font-bold">Editar Usuario</h3>
                    <p className="text-sm opacity-80">{editingProfile.email}</p>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Nombre</label>
                        <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} required className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Apellido</label>
                        <input value={editApellido} onChange={(e) => setEditApellido(e.target.value)} required className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Rol</label>
                      <select value={editRol} onChange={(e) => setEditRol(e.target.value as Rol)} className="w-full border-gray-200 border rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button type="button" onClick={() => setEditingProfile(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50">
                      {submitting ? 'Guardando...' : 'Guardar Cambios'}
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

export default GestionUsuarios;
