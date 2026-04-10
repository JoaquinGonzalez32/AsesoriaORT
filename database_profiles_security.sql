-- ================================================================
-- SEGURIDAD RLS PARA TABLA `profiles`
-- ================================================================
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- Antes de correr: revisá las políticas existentes con
--   SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- y eliminá manualmente las que se solapen con las de abajo.
-- ================================================================

-- Habilitar RLS (no-op si ya está activo)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Dropear políticas existentes que se solapan con las nuevas.
-- (descubiertas con: SELECT policyname FROM pg_policies WHERE tablename='profiles')
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Usuario edita su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Admin edita cualquier perfil" ON profiles;
DROP POLICY IF EXISTS "Admin crea perfiles" ON profiles;
DROP POLICY IF EXISTS "Perfiles visibles para usuarios autenticados" ON profiles;

-- ----------------------------------------------------------------
-- Helper: función SECURITY DEFINER que devuelve el rol del usuario
-- actual sin disparar recursión RLS sobre la propia tabla profiles.
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_rol()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rol FROM profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- SELECT: todos los autenticados ven todos los perfiles
-- (necesario para mostrar nombres de owners en leads/oportunidades)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles_Select_Policy" ON profiles;
CREATE POLICY "Profiles_Select_Policy" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- ----------------------------------------------------------------
-- UPDATE propio: un usuario puede editar su propio perfil
-- PERO NO puede cambiar su rol ni su flag activo.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles_Update_Self_Policy" ON profiles;
CREATE POLICY "Profiles_Update_Self_Policy" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND rol = (SELECT rol FROM profiles WHERE id = auth.uid())
    AND activo = (SELECT activo FROM profiles WHERE id = auth.uid())
  );

-- ----------------------------------------------------------------
-- UPDATE admin: solo admin puede editar cualquier perfil,
-- incluyendo cambiar rol y activar/desactivar.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles_Update_Admin_Policy" ON profiles;
CREATE POLICY "Profiles_Update_Admin_Policy" ON profiles
  FOR UPDATE TO authenticated
  USING (current_user_rol() = 'admin')
  WITH CHECK (current_user_rol() = 'admin');

-- ----------------------------------------------------------------
-- INSERT: bloqueado a todos. La creación de usuarios se hace
-- únicamente vía la Edge Function `create-user` que usa
-- service_role key, la cual bypassa RLS.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles_Insert_Policy" ON profiles;
CREATE POLICY "Profiles_Insert_Policy" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- ----------------------------------------------------------------
-- DELETE: bloqueado para todos. Para "borrar" un usuario,
-- se usa el flag `activo = false`.
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles_Delete_Policy" ON profiles;
CREATE POLICY "Profiles_Delete_Policy" ON profiles
  FOR DELETE TO authenticated
  USING (false);

-- ================================================================
-- VERIFICACIÓN POST-EJECUCIÓN
-- ================================================================
-- Después de correr el script, verificá:
--   SELECT policyname, cmd, qual, with_check FROM pg_policies
--   WHERE tablename = 'profiles';
--
-- Deberían aparecer 5 políticas: Select, Update_Self, Update_Admin,
-- Insert, Delete.
--
-- Probá manualmente desde la app:
-- 1. Como asesor: editar tu propio nombre → debe funcionar.
-- 2. Como asesor: ir a /usuarios → debe redirigir a /.
-- 3. Como asesor en consola del browser:
--    supabase.from('profiles').update({ rol: 'admin' }).eq('id', '<tu_id>')
--    → debe fallar con "row-level security".
-- 4. Como admin: editar otro usuario y cambiarle el rol → debe funcionar.
-- ================================================================
