export type Rol = 'admin' | 'coordinador' | 'asesor';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  avatar_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export const PERMISOS: Record<Rol, Record<string, boolean>> = {
  admin: {
    gestionarUsuarios: true,
  },
  coordinador: {
    gestionarUsuarios: false,
  },
  asesor: {
    gestionarUsuarios: false,
  },
};

export const tienePermiso = (rol: Rol | undefined, permiso: string): boolean => {
  if (!rol) return false;
  return PERMISOS[rol]?.[permiso] ?? false;
};
