// Traduce errores técnicos (Supabase, fetch, JS) a mensajes amigables
// y prepara reportes para soporte por WhatsApp.

export interface ErrorTraducido {
  friendly: string;
  technical: string;
  code?: string;
}

const SUPPORT_PHONE = '59891770513';
const SUPPORT_EMAIL = 'joaquin.felipe46@gmail.com';

export function traducirErrorSupabase(err: any): ErrorTraducido {
  if (!err) {
    return { friendly: 'Ocurrió un error inesperado.', technical: 'unknown' };
  }

  const message = err?.message || String(err);
  const code = err?.code || err?.status;
  const technical = code ? `[${code}] ${message}` : message;

  // Postgres / Supabase errors
  if (code === '23505' || /duplicate key/i.test(message)) {
    return { friendly: 'Ya existe un registro con esos datos.', technical, code };
  }
  if (code === '23503' || /foreign key/i.test(message)) {
    return { friendly: 'No se puede completar la acción porque el registro está vinculado a otros datos.', technical, code };
  }
  if (code === '23502' || /not-null/i.test(message)) {
    return { friendly: 'Faltan datos obligatorios para guardar.', technical, code };
  }
  if (code === '42501' || /row-level security|permission denied/i.test(message)) {
    return { friendly: 'No tenés permisos para realizar esta acción.', technical, code };
  }
  if (code === 'PGRST116' || /not found|no rows/i.test(message)) {
    return { friendly: 'No se encontró el registro solicitado.', technical, code };
  }

  // Auth
  if (/invalid login|invalid credentials/i.test(message)) {
    return { friendly: 'Email o contraseña incorrectos.', technical, code };
  }
  if (/jwt|token|session/i.test(message) && /expired|invalid/i.test(message)) {
    return { friendly: 'Tu sesión expiró. Volvé a iniciar sesión.', technical, code };
  }

  // Network
  if (/failed to fetch|network|networkerror/i.test(message)) {
    return { friendly: 'Sin conexión con el servidor. Verificá tu internet.', technical, code };
  }
  if (/timeout/i.test(message)) {
    return { friendly: 'La operación tardó demasiado. Intentá de nuevo.', technical, code };
  }

  // Genérico
  return {
    friendly: 'Ocurrió un error inesperado. Si persiste, contactá a soporte.',
    technical,
    code,
  };
}

function buildReportBody(context: string, technical: string, format: 'whatsapp' | 'email'): string {
  const userInfo = `Página: ${window.location.hash || '/'}\nFecha: ${new Date().toLocaleString('es-UY')}`;
  if (format === 'whatsapp') {
    return `Hola Joaquín, tengo un error en el CRM:\n\n*Acción:* ${context}\n*Detalle técnico:* ${technical}\n\n${userInfo}`;
  }
  return `Hola Joaquín,\n\nTengo un error en el CRM:\n\nAcción: ${context}\nDetalle técnico: ${technical}\n\n${userInfo}`;
}

export function buildSupportUrl(context: string, technical: string): string {
  return `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(buildReportBody(context, technical, 'whatsapp'))}`;
}

export function buildSupportEmailUrl(context: string, technical: string): string {
  const subject = `Error en CRM: ${context}`;
  const body = buildReportBody(context, technical, 'email');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
