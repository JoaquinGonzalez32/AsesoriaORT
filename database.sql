-- Asegurar que los tipos existan
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resultado_llamada_enum') THEN
        CREATE TYPE resultado_llamada_enum AS ENUM ('1er Contacto', 'Contactado', 'No interesado', 'Interesado', 'Número Incorrecto', 'Llamar más tarde');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'liceo_tipo_enum') THEN
        CREATE TYPE liceo_tipo_enum AS ENUM ('Publico', 'Privado', 'Interior');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proceso_inicio_enum') THEN
        CREATE TYPE proceso_inicio_enum AS ENUM ('Pendiente', 'Iniciado', 'Documentacion', 'Inscripto', 'Rechazado', 'En pausa');
    END IF;
END $$;

-- Tabla de Leads
CREATE TABLE IF NOT EXISTS leads (
  lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cedula TEXT,
  mail TEXT,
  carrera_interes TEXT,
  liceo TEXT,
  fecha_lead DATE NOT NULL DEFAULT CURRENT_DATE,
  resultado_llamada resultado_llamada_enum DEFAULT '1er Contacto',
  intentos_llamado INT DEFAULT 1,
  comentario TEXT,
  owner UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Tabla de Oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
  opp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cedula TEXT,
  mail TEXT,
  carrera_interes TEXT,
  otros_intereses TEXT[] DEFAULT '{}',
  liceo TEXT,
  fecha_lead DATE NOT NULL,
  ras_agendada BOOLEAN DEFAULT FALSE,
  ras_asistio BOOLEAN DEFAULT FALSE,
  multiple_interes BOOLEAN DEFAULT FALSE,
  liceo_tipo liceo_tipo_enum DEFAULT 'Publico',
  ras_hecha_por UUID REFERENCES auth.users(id),
  proceso_inicio proceso_inicio_enum DEFAULT 'Pendiente',
  comentario_extra TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Tabla de RASES (Agenda de Reuniones)
CREATE TABLE IF NOT EXISTS rases (
  ras_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opp_id UUID REFERENCES oportunidades(opp_id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  nombre_interesado TEXT NOT NULL,
  agente_nombre TEXT NOT NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  modalidad TEXT NOT NULL,
  carrera TEXT,
  estado_oportunidad TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE rases ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Políticas de LEADS — Solo usuarios autenticados
-- ============================================================
DROP POLICY IF EXISTS "Leads_Select_Policy" ON leads;
CREATE POLICY "Leads_Select_Policy" ON leads FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Leads_Insert_Policy" ON leads;
CREATE POLICY "Leads_Insert_Policy" ON leads FOR INSERT TO authenticated WITH CHECK (owner = auth.uid());

DROP POLICY IF EXISTS "Leads_Update_Policy" ON leads;
CREATE POLICY "Leads_Update_Policy" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leads_Delete_Policy" ON leads;
CREATE POLICY "Leads_Delete_Policy" ON leads FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Políticas de OPORTUNIDADES — Solo usuarios autenticados
-- ============================================================
DROP POLICY IF EXISTS "Opps_Select_Policy" ON oportunidades;
CREATE POLICY "Opps_Select_Policy" ON oportunidades FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Opps_Insert_Policy" ON oportunidades;
CREATE POLICY "Opps_Insert_Policy" ON oportunidades FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Opps_Update_Policy" ON oportunidades;
CREATE POLICY "Opps_Update_Policy" ON oportunidades FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Opps_Delete_Policy" ON oportunidades;
CREATE POLICY "Opps_Delete_Policy" ON oportunidades FOR DELETE TO authenticated USING (true);

-- ============================================================
-- Políticas de RASES — Solo usuarios autenticados
-- ============================================================
DROP POLICY IF EXISTS "Rases_Select_Policy" ON rases;
CREATE POLICY "Rases_Select_Policy" ON rases FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Rases_Insert_Policy" ON rases;
CREATE POLICY "Rases_Insert_Policy" ON rases FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Rases_Update_Policy" ON rases;
CREATE POLICY "Rases_Update_Policy" ON rases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Rases_Delete_Policy" ON rases;
CREATE POLICY "Rases_Delete_Policy" ON rases FOR DELETE TO authenticated USING (true);
