
# CRM Admisiones Pro

Este es un sistema robusto diseñado para equipos de admisiones y ventas universitarias/escolares, optimizado para la gestión de leads y su conversión a oportunidades de matriculación.

## Arquitectura
- **Frontend**: React 18 con TypeScript y Tailwind CSS para una interfaz moderna y rápida.
- **Visualización**: Recharts para el dashboard de KPIs.
- **Persistencia**: Implementado con un sistema de estado reactivo para demostración, preparado para conexión inmediata con Supabase.
- **Estilo**: Mobile-first, responsive y con animaciones suaves.

## Características Principales
- **Dashboards**: KPIs en tiempo real (Nuevos leads, contactados, % de conversión).
- **Leads**: CRUD completo con estados de llamada e intentos.
- **Conversión**: Flujo de un solo clic para pasar leads calificados a oportunidades con transferencia de datos.
- **Oportunidades**: Pipeline de gestión de RAS (Reunión de Asesoramiento) y seguimiento de documentación.
- **Soft Delete**: Los registros nunca se borran físicamente de la base, se marcan como inactivos.

## Instalación

1. Clona el repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Configuración de Base de Datos (Supabase)
Copia el contenido de `database.sql` en el SQL Editor de tu proyecto de Supabase para crear las tablas, enums, índices y políticas de seguridad RLS.

## Variables de Entorno (.env)
```
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
```
