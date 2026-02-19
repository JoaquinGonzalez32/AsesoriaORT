-- ============================================================
-- RESET RÁPIDO - Elimina TODOS los datos de las 3 tablas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

DELETE FROM rases;
DELETE FROM oportunidades;
DELETE FROM leads;

-- Verificar que quedó vacío
SELECT 'leads' AS tabla, COUNT(*) AS total FROM leads
UNION ALL
SELECT 'oportunidades', COUNT(*) FROM oportunidades
UNION ALL
SELECT 'rases', COUNT(*) FROM rases;
