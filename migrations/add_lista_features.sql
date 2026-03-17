-- Mejoras a Listas de Trabajo
-- Ejecutar en Supabase SQL Editor

-- Feature 1: Status completada en listas
ALTER TABLE listas ADD COLUMN completada BOOLEAN NOT NULL DEFAULT FALSE;

-- Feature 2: Tag de estado de contacto en items
ALTER TABLE listas_de_trabajo ADD COLUMN tag TEXT DEFAULT NULL;

-- Feature 3: Vinculo con oportunidades
ALTER TABLE listas_de_trabajo ADD COLUMN opp_id UUID REFERENCES oportunidades(opp_id) ON DELETE SET NULL;
