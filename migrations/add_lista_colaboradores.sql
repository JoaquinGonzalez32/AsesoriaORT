-- ================================================================
-- COLABORADORES EN LISTAS DE TRABAJO
-- ================================================================
-- Ejecutar en Supabase Dashboard → SQL Editor.
-- Agrega owner a listas + tabla de colaboradores + RLS.
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Agregar columna owner a listas
-- ----------------------------------------------------------------
ALTER TABLE listas ADD COLUMN IF NOT EXISTS owner UUID REFERENCES auth.users(id);

-- Backfill: asignar todas las listas existentes al admin
-- (reemplazar con el UUID real del admin antes de ejecutar)
-- UPDATE listas SET owner = '<ADMIN_USER_UUID>' WHERE owner IS NULL;

-- Hacer NOT NULL despues del backfill
-- ALTER TABLE listas ALTER COLUMN owner SET NOT NULL;

-- Default para nuevas filas
ALTER TABLE listas ALTER COLUMN owner SET DEFAULT auth.uid();

-- ----------------------------------------------------------------
-- 2. Tabla de colaboradores
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lista_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lista_id UUID NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lista_id, user_id)
);

-- ----------------------------------------------------------------
-- 3. RLS para lista_colaboradores
-- ----------------------------------------------------------------
ALTER TABLE lista_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ListaColab_Select" ON lista_colaboradores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ListaColab_Insert" ON lista_colaboradores
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM listas WHERE id = lista_id AND owner = auth.uid())
  );

CREATE POLICY "ListaColab_Delete" ON lista_colaboradores
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM listas WHERE id = lista_id AND owner = auth.uid())
  );

-- ----------------------------------------------------------------
-- 4. RLS para listas (actualizar politicas existentes)
-- ----------------------------------------------------------------
-- Primero eliminar politicas existentes
DROP POLICY IF EXISTS "Listas_Select" ON listas;
DROP POLICY IF EXISTS "Listas_Insert" ON listas;
DROP POLICY IF EXISTS "Listas_Update" ON listas;
DROP POLICY IF EXISTS "Listas_Delete" ON listas;
-- Nombres alternativos que puedan existir
DROP POLICY IF EXISTS "Listas visibles para usuarios autenticados" ON listas;
DROP POLICY IF EXISTS "Enable read access for all users" ON listas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON listas;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON listas;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON listas;

ALTER TABLE listas ENABLE ROW LEVEL SECURITY;

-- SELECT: owner o colaborador
CREATE POLICY "Listas_Select" ON listas
  FOR SELECT TO authenticated
  USING (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM lista_colaboradores WHERE lista_id = id AND user_id = auth.uid())
  );

-- INSERT: owner debe ser el usuario actual
CREATE POLICY "Listas_Insert" ON listas
  FOR INSERT TO authenticated
  WITH CHECK (owner = auth.uid());

-- UPDATE: owner o colaborador
CREATE POLICY "Listas_Update" ON listas
  FOR UPDATE TO authenticated
  USING (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM lista_colaboradores WHERE lista_id = id AND user_id = auth.uid())
  );

-- DELETE: solo owner
CREATE POLICY "Listas_Delete" ON listas
  FOR DELETE TO authenticated
  USING (owner = auth.uid());
