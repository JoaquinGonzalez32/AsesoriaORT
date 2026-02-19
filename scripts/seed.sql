-- ============================================================
-- SCRIPT DE CARGA MASIVA - CRM Admisiones ORT
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PASO 1: ELIMINAR TODOS LOS DATOS EXISTENTES
-- ============================================================
DELETE FROM rases;
DELETE FROM oportunidades;
DELETE FROM leads;

-- ============================================================
-- PASO 2: INSERTAR LEADS (200 registros)
-- ============================================================
INSERT INTO leads (nombre, carrera_interes, fecha_lead, resultado_llamada, horario_llamada, intentos_llamado, comentario, owner, convertido, created_at, updated_at)
VALUES
-- Enero 2026
('Valentina García', 'LV', '2026-01-05', '1er Contacto', 'Mañana', 1, 'Interesada en conocer plan de estudios', NULL, false, NOW(), NOW()),
('Martín López', 'WY', '2026-01-06', 'Contactado', 'Tarde', 2, 'Pidió información de becas', NULL, false, NOW(), NOW()),
('Camila Rodríguez', 'LT', '2026-01-07', 'Interesado', 'Mañana', 1, 'Muy motivada, viene de liceo público', NULL, true, NOW(), NOW()),
('Santiago Fernández', 'LD', '2026-01-08', 'No interesado', 'Noche', 3, 'Decidió ir a otra universidad', NULL, false, NOW(), NOW()),
('Lucía Martínez', 'YN', '2026-01-09', 'Llamar más tarde', 'Tarde', 1, 'Estaba ocupada, llamar la semana que viene', NULL, false, NOW(), NOW()),
('Mateo González', 'LG', '2026-01-10', 'Contactado', 'Mañana', 2, 'Quiere visitar el campus', NULL, true, NOW(), NOW()),
('Isabella Pérez', 'VD', '2026-01-11', 'Interesado', 'Tarde', 1, 'Preguntó por horarios nocturnos', NULL, true, NOW(), NOW()),
('Joaquín Sánchez', 'UI', '2026-01-12', '1er Contacto', 'Mañana', 1, 'Dejó datos en formulario web', NULL, false, NOW(), NOW()),
('Sofía Ramírez', 'GF', '2026-01-13', 'Número Incorrecto', NULL, 1, 'El número no corresponde', NULL, false, NOW(), NOW()),
('Nicolás Torres', 'WE', '2026-01-14', 'Contactado', 'Tarde', 2, 'Interesado pero evaluando opciones', NULL, false, NOW(), NOW()),
('Florencia Díaz', 'LV', '2026-01-15', 'Interesado', 'Mañana', 1, 'Viene del interior, necesita info de residencias', NULL, true, NOW(), NOW()),
('Tomás Álvarez', 'WY', '2026-01-16', '1er Contacto', 'Noche', 1, 'Contacto por Instagram', NULL, false, NOW(), NOW()),
('Emilia Ruiz', 'LT', '2026-01-17', 'Contactado', 'Mañana', 3, 'Madre llamó por ella, interesada en LT', NULL, false, NOW(), NOW()),
('Agustín Acosta', 'LD', '2026-01-18', 'Llamar más tarde', 'Tarde', 1, 'En período de exámenes', NULL, false, NOW(), NOW()),
('Martina Castro', 'YN', '2026-01-19', 'Interesado', 'Mañana', 2, 'Quiere agendar visita con padres', NULL, true, NOW(), NOW()),
('Facundo Romero', 'LG', '2026-01-20', 'No interesado', 'Tarde', 2, 'Prefiere carrera técnica', NULL, false, NOW(), NOW()),
('Victoria Silva', 'VD', '2026-01-21', 'Contactado', 'Noche', 1, 'Pidió folleto digital', NULL, false, NOW(), NOW()),
('Lautaro Méndez', 'UI', '2026-01-22', '1er Contacto', 'Mañana', 1, 'Viene de feria educativa', NULL, false, NOW(), NOW()),
('Catalina Flores', 'GF', '2026-01-23', 'Interesado', 'Tarde', 1, 'Muy entusiasmada con la carrera', NULL, true, NOW(), NOW()),
('Bautista Herrera', 'WE', '2026-01-24', 'Contactado', 'Mañana', 2, 'Consultó sobre financiamiento', NULL, false, NOW(), NOW()),
-- Febrero 2026
('Renata Morales', 'LV', '2026-02-01', '1er Contacto', 'Tarde', 1, 'Formulario web - charla informativa', NULL, false, NOW(), NOW()),
('Thiago Vargas', 'WY', '2026-02-02', 'Contactado', 'Mañana', 2, 'Llamó interesado por recomendación', NULL, true, NOW(), NOW()),
('Antonella Giménez', 'LT', '2026-02-03', 'Interesado', 'Tarde', 1, 'Quiere info detallada del plan', NULL, true, NOW(), NOW()),
('Felipe Medina', 'LD', '2026-02-04', 'Llamar más tarde', 'Noche', 1, 'No pudo atender, está trabajando', NULL, false, NOW(), NOW()),
('Alma Benítez', 'YN', '2026-02-05', '1er Contacto', 'Mañana', 1, 'Contacto por referido', NULL, false, NOW(), NOW()),
('Benjamín Ríos', 'LG', '2026-02-06', 'No interesado', 'Tarde', 3, 'Ya se inscribió en otra universidad', NULL, false, NOW(), NOW()),
('Delfina Suárez', 'VD', '2026-02-07', 'Contactado', 'Mañana', 2, 'Interesada, pidió reunión', NULL, true, NOW(), NOW()),
('Santino Luna', 'UI', '2026-02-08', 'Interesado', 'Tarde', 1, 'Muy interesado en lab de tecnología', NULL, true, NOW(), NOW()),
('Olivia Aguirre', 'GF', '2026-02-09', 'Número Incorrecto', NULL, 2, 'Buzón de voz, no se puede contactar', NULL, false, NOW(), NOW()),
('Máximo Cabrera', 'WE', '2026-02-10', 'Contactado', 'Noche', 1, 'Pidió información sobre pasantías', NULL, false, NOW(), NOW()),
('Clara Gutiérrez', 'LV', '2026-02-11', 'Interesado', 'Mañana', 1, 'Viene de liceo privado, muy motivada', NULL, true, NOW(), NOW()),
('Lorenzo Navarro', 'WY', '2026-02-12', '1er Contacto', 'Tarde', 1, 'Dejó datos en stand de shopping', NULL, false, NOW(), NOW()),
('Emma Rojas', 'LT', '2026-02-13', 'Llamar más tarde', 'Mañana', 1, 'Prefiere hablar después de las 18h', NULL, false, NOW(), NOW()),
('Ian Domínguez', 'LD', '2026-02-14', 'Contactado', 'Tarde', 2, 'Evaluando entre ORT y otra opción', NULL, false, NOW(), NOW()),
('Mía Peralta', 'YN', '2026-02-15', 'Interesado', 'Noche', 1, 'Padre muy interesado, hija también', NULL, true, NOW(), NOW()),
('Ciro Figueroa', 'LG', '2026-02-16', '1er Contacto', 'Mañana', 1, 'Contacto desde web institucional', NULL, false, NOW(), NOW()),
('Bianca Molina', 'VD', '2026-02-17', 'No interesado', 'Tarde', 2, 'Cambió de idea, quiere estudiar medicina', NULL, false, NOW(), NOW()),
('Gael Ortega', 'UI', '2026-02-18', 'Contactado', 'Mañana', 1, 'Interesado en doble titulación', NULL, false, NOW(), NOW()),
('Ambar Sosa', 'GF', '2026-02-18', 'Interesado', 'Tarde', 1, 'Viene de charla en su liceo', NULL, true, NOW(), NOW()),
('Bruno Vega', 'WE', '2026-02-18', '1er Contacto', 'Noche', 1, 'Contacto por WhatsApp Business', NULL, false, NOW(), NOW()),
-- Marzo 2025
('Pilar Acuña', 'LV', '2025-03-03', 'Contactado', 'Mañana', 2, 'Contactada, pidió folleto', NULL, true, NOW(), NOW()),
('Dante Correa', 'WY', '2025-03-05', 'Interesado', 'Tarde', 1, 'Viene de charla ORT en su liceo', NULL, true, NOW(), NOW()),
('Jazmín Paredes', 'LT', '2025-03-07', '1er Contacto', 'Mañana', 1, 'Formulario web', NULL, false, NOW(), NOW()),
('Rafael Ibarra', 'LD', '2025-03-09', 'Contactado', 'Noche', 3, 'Habló con padre, está evaluando', NULL, false, NOW(), NOW()),
('Zoe Pereira', 'YN', '2025-03-11', 'Interesado', 'Tarde', 1, 'Muy interesada, pidió RAS', NULL, true, NOW(), NOW()),
('Elías Núñez', 'LG', '2025-03-13', 'Llamar más tarde', 'Mañana', 1, 'Exámenes de liceo', NULL, false, NOW(), NOW()),
('Luna Arce', 'VD', '2025-03-15', 'No interesado', 'Tarde', 2, 'Se va al exterior', NULL, false, NOW(), NOW()),
('Simón Cardozo', 'UI', '2025-03-17', 'Contactado', 'Mañana', 2, 'Quiere visitar laboratorios', NULL, true, NOW(), NOW()),
('Aurora Vera', 'GF', '2025-03-19', '1er Contacto', 'Noche', 1, 'Instagram ads', NULL, false, NOW(), NOW()),
('León Duarte', 'WE', '2025-03-21', 'Interesado', 'Tarde', 1, 'Recomendado por ex alumno', NULL, true, NOW(), NOW()),
-- Abril 2025
('Paz Bustos', 'LV', '2025-04-02', 'Contactado', 'Mañana', 1, 'Pidió info de becas deportivas', NULL, false, NOW(), NOW()),
('Matías Ponce', 'WY', '2025-04-04', '1er Contacto', 'Tarde', 1, 'Feria Expo Educa', NULL, false, NOW(), NOW()),
('Renata Cáceres', 'LT', '2025-04-06', 'Interesado', 'Mañana', 2, 'Interesada, madre acompaña proceso', NULL, true, NOW(), NOW()),
('Ignacio Leiva', 'LD', '2025-04-08', 'Número Incorrecto', NULL, 1, 'Número equivocado', NULL, false, NOW(), NOW()),
('Alma Velázquez', 'YN', '2025-04-10', 'Contactado', 'Tarde', 2, 'Evaluando presencial vs online', NULL, false, NOW(), NOW()),
('Franco Rivas', 'LG', '2025-04-12', 'Llamar más tarde', 'Noche', 1, 'Viajando, llamar en 2 semanas', NULL, false, NOW(), NOW()),
('Nina Delgado', 'VD', '2025-04-14', 'Interesado', 'Mañana', 1, 'Viene del interior, muy decidida', NULL, true, NOW(), NOW()),
('Tobías Pinto', 'UI', '2025-04-16', 'No interesado', 'Tarde', 3, 'Prefiere UTU', NULL, false, NOW(), NOW()),
('Abril Lagos', 'GF', '2025-04-18', 'Contactado', 'Mañana', 2, 'Quiere conocer salida laboral', NULL, true, NOW(), NOW()),
('Dylan Espinoza', 'WE', '2025-04-20', '1er Contacto', 'Tarde', 1, 'Recomendación de amigo', NULL, false, NOW(), NOW()),
-- Mayo 2025
('Milagros Bravo', 'LV', '2025-05-02', 'Interesado', 'Mañana', 1, 'Interesada en intercambio', NULL, true, NOW(), NOW()),
('Lucas Quiroga', 'WY', '2025-05-04', 'Contactado', 'Tarde', 2, 'Necesita info financiamiento', NULL, true, NOW(), NOW()),
('Candelaria Soto', 'LT', '2025-05-06', '1er Contacto', 'Noche', 1, 'Contacto por referido', NULL, false, NOW(), NOW()),
('Gonzalo Maldonado', 'LD', '2025-05-08', 'Llamar más tarde', 'Mañana', 1, 'En clase, llamar después de 17h', NULL, false, NOW(), NOW()),
('Violeta Ojeda', 'YN', '2025-05-10', 'Contactado', 'Tarde', 1, 'Pidió info por mail', NULL, false, NOW(), NOW()),
('Augusto Salinas', 'LG', '2025-05-12', 'No interesado', 'Mañana', 2, 'Eligió carrera diferente', NULL, false, NOW(), NOW()),
('Serena Miranda', 'VD', '2025-05-14', 'Interesado', 'Tarde', 1, 'Muy motivada por el programa', NULL, true, NOW(), NOW()),
('Hugo Montiel', 'UI', '2025-05-16', '1er Contacto', 'Mañana', 1, 'Charla en liceo Nro 7', NULL, false, NOW(), NOW()),
('Elena Villalba', 'GF', '2025-05-18', 'Contactado', 'Noche', 2, 'Evaluando con la familia', NULL, false, NOW(), NOW()),
('Adrián Costa', 'WE', '2025-05-20', 'Número Incorrecto', NULL, 2, 'No existe el número', NULL, false, NOW(), NOW()),
-- Junio 2025
('Julia Cabral', 'LV', '2025-06-01', 'Interesado', 'Mañana', 1, 'Quiere RAS presencial', NULL, true, NOW(), NOW()),
('Emiliano Otero', 'WY', '2025-06-03', 'Contactado', 'Tarde', 2, 'Padre consultó por él', NULL, false, NOW(), NOW()),
('Lola Pacheco', 'LT', '2025-06-05', '1er Contacto', 'Mañana', 1, 'Formulario Open House', NULL, false, NOW(), NOW()),
('Pedro Salas', 'LD', '2025-06-07', 'Llamar más tarde', 'Noche', 1, 'En viaje', NULL, false, NOW(), NOW()),
('Amanda Arias', 'YN', '2025-06-09', 'Interesado', 'Tarde', 1, 'Decidida por YN, quiere inscribirse', NULL, true, NOW(), NOW()),
('Rodrigo Blanco', 'LG', '2025-06-11', 'Contactado', 'Mañana', 3, 'Dudando entre LG y LD', NULL, false, NOW(), NOW()),
('Celeste Mora', 'VD', '2025-06-13', 'No interesado', 'Tarde', 2, 'Elige UdelaR', NULL, false, NOW(), NOW()),
('Ezequiel Paz', 'UI', '2025-06-15', 'Interesado', 'Mañana', 1, 'Entusiasmado por laboratorio', NULL, true, NOW(), NOW()),
('Mikaela Rey', 'GF', '2025-06-17', '1er Contacto', 'Tarde', 1, 'Google Ads', NULL, false, NOW(), NOW()),
('Lisandro Franco', 'WE', '2025-06-19', 'Contactado', 'Noche', 1, 'Pidió información de carreras', NULL, false, NOW(), NOW()),
-- Julio 2025
('Romina Escalante', 'LV', '2025-07-01', 'Contactado', 'Mañana', 2, 'Interesada, pero viaja en agosto', NULL, false, NOW(), NOW()),
('Kevin Estrada', 'WY', '2025-07-03', 'Interesado', 'Tarde', 1, 'Quiere empezar en marzo 2026', NULL, true, NOW(), NOW()),
('Agustina Campos', 'LT', '2025-07-05', '1er Contacto', 'Mañana', 1, 'Referida por alumna actual', NULL, false, NOW(), NOW()),
('Axel Guzmán', 'LD', '2025-07-07', 'Contactado', 'Tarde', 2, 'Quiere conocer egresados', NULL, true, NOW(), NOW()),
('Candela Heredia', 'YN', '2025-07-09', 'Llamar más tarde', 'Noche', 1, 'Pidió llamar en setiembre', NULL, false, NOW(), NOW()),
('Ramiro Ledesma', 'LG', '2025-07-11', 'No interesado', 'Mañana', 3, 'No le interesa más', NULL, false, NOW(), NOW()),
('Maite Pereyra', 'VD', '2025-07-13', 'Interesado', 'Tarde', 1, 'Viene de Open Day', NULL, true, NOW(), NOW()),
('Iván Robledo', 'UI', '2025-07-15', 'Contactado', 'Mañana', 1, 'Consultó sobre doble titulación', NULL, false, NOW(), NOW()),
('Rocío Sandoval', 'GF', '2025-07-17', '1er Contacto', 'Tarde', 1, 'Stand shopping Montevideo', NULL, false, NOW(), NOW()),
('Enzo Valdez', 'WE', '2025-07-19', 'Interesado', 'Noche', 2, 'Quiere RAS online', NULL, true, NOW(), NOW()),
-- Agosto 2025
('Daniela Berón', 'LV', '2025-08-01', 'Contactado', 'Mañana', 2, 'Evaluando con familia', NULL, true, NOW(), NOW()),
('Maximiliano Godoy', 'WY', '2025-08-03', '1er Contacto', 'Tarde', 1, 'Facebook ads', NULL, false, NOW(), NOW()),
('Julieta Coronel', 'LT', '2025-08-05', 'Interesado', 'Mañana', 1, 'Decidida, quiere agenda de RAS', NULL, true, NOW(), NOW()),
('Alan Escobar', 'LD', '2025-08-07', 'Número Incorrecto', NULL, 1, 'Buzón permanente', NULL, false, NOW(), NOW()),
('Milagros Funes', 'YN', '2025-08-09', 'Contactado', 'Tarde', 2, 'Consultó precios', NULL, false, NOW(), NOW()),
('Cristian Garay', 'LG', '2025-08-11', 'Llamar más tarde', 'Noche', 1, 'Está de viaje', NULL, false, NOW(), NOW()),
('Tamara Herrera', 'VD', '2025-08-13', 'Interesado', 'Mañana', 1, 'Muy interesada en pasantías', NULL, true, NOW(), NOW()),
('Marcos Iraola', 'UI', '2025-08-15', 'No interesado', 'Tarde', 2, 'Elige ingeniería en UdelaR', NULL, false, NOW(), NOW()),
('Priscila Juárez', 'GF', '2025-08-17', 'Contactado', 'Mañana', 1, 'Pidió reunión con coordinador', NULL, true, NOW(), NOW()),
('Gastón Klein', 'WE', '2025-08-19', '1er Contacto', 'Tarde', 1, 'Referido por familiar', NULL, false, NOW(), NOW()),
-- Septiembre 2025
('Carolina Leguizamón', 'LV', '2025-09-02', 'Interesado', 'Mañana', 1, 'Viene de charla en colegio', NULL, true, NOW(), NOW()),
('Federico Mansilla', 'WY', '2025-09-04', 'Contactado', 'Tarde', 3, 'Dudando entre WY y LT', NULL, false, NOW(), NOW()),
('Valentina Neira', 'LT', '2025-09-06', '1er Contacto', 'Noche', 1, 'Formulario landing de campaña', NULL, false, NOW(), NOW()),
('Esteban Olmos', 'LD', '2025-09-08', 'Llamar más tarde', 'Mañana', 1, 'Pidió llamar después de las 19h', NULL, false, NOW(), NOW()),
('Guadalupe Pintos', 'YN', '2025-09-10', 'Interesado', 'Tarde', 1, 'Quiere info sobre intercambio', NULL, true, NOW(), NOW()),
('Diego Quintana', 'LG', '2025-09-12', 'Contactado', 'Mañana', 2, 'Interesado, viene del interior', NULL, true, NOW(), NOW()),
('Abril Ramos', 'VD', '2025-09-14', 'No interesado', 'Tarde', 2, 'Decidió no estudiar este año', NULL, false, NOW(), NOW()),
('Marcos Solano', 'UI', '2025-09-16', 'Interesado', 'Mañana', 1, 'Quiere RAS con padres', NULL, true, NOW(), NOW()),
('Constanza Toledo', 'GF', '2025-09-18', 'Contactado', 'Noche', 1, 'Pidió info por email', NULL, false, NOW(), NOW()),
('Andrés Urrutia', 'WE', '2025-09-20', '1er Contacto', 'Tarde', 1, 'TikTok ads', NULL, false, NOW(), NOW()),
-- Octubre 2025
('Regina Vázquez', 'LV', '2025-10-01', 'Contactado', 'Mañana', 2, 'Madre consultó por hija', NULL, true, NOW(), NOW()),
('Pablo Wainstein', 'WY', '2025-10-03', 'Interesado', 'Tarde', 1, 'Ex alumno de ORT Belgrano', NULL, true, NOW(), NOW()),
('Sofía Yamamoto', 'LT', '2025-10-05', '1er Contacto', 'Mañana', 1, 'Open House octubre', NULL, false, NOW(), NOW()),
('Tomás Zárate', 'LD', '2025-10-07', 'Contactado', 'Noche', 2, 'Quiere hablar con director de carrera', NULL, false, NOW(), NOW()),
('Micaela Agüero', 'YN', '2025-10-09', 'Llamar más tarde', 'Tarde', 1, 'En clase', NULL, false, NOW(), NOW()),
('Fernando Barrios', 'LG', '2025-10-11', 'Interesado', 'Mañana', 1, 'Decidido, quiere inscribirse', NULL, true, NOW(), NOW()),
('Josefina Cárdenas', 'VD', '2025-10-13', 'No interesado', 'Tarde', 3, 'Eligió otra carrera', NULL, false, NOW(), NOW()),
('Alejo Dutra', 'UI', '2025-10-15', 'Contactado', 'Mañana', 1, 'Quiere conocer campus', NULL, true, NOW(), NOW()),
('Mora Echeverría', 'GF', '2025-10-17', 'Interesado', 'Tarde', 2, 'Viene de feria vocacional', NULL, true, NOW(), NOW()),
('Leandro Ferreyra', 'WE', '2025-10-19', '1er Contacto', 'Noche', 1, 'Referido por docente', NULL, false, NOW(), NOW()),
-- Noviembre 2025
('Luciana Greco', 'LV', '2025-11-01', 'Interesado', 'Mañana', 1, 'Quiere RAS para diciembre', NULL, true, NOW(), NOW()),
('Nahuel Iglesias', 'WY', '2025-11-03', 'Contactado', 'Tarde', 2, 'Evaluando carreras tecnológicas', NULL, false, NOW(), NOW()),
('Camila Jara', 'LT', '2025-11-05', '1er Contacto', 'Mañana', 1, 'Instagram story swipe-up', NULL, false, NOW(), NOW()),
('Samuel Kramer', 'LD', '2025-11-07', 'Llamar más tarde', 'Tarde', 1, 'En exámenes finales', NULL, false, NOW(), NOW()),
('Danna León', 'YN', '2025-11-09', 'Contactado', 'Noche', 1, 'Pidió info de plan de estudios', NULL, false, NOW(), NOW()),
('Tadeo Mansur', 'LG', '2025-11-11', 'Interesado', 'Mañana', 1, 'Viene de charla en su colegio', NULL, true, NOW(), NOW()),
('Sol Navas', 'VD', '2025-11-13', 'Contactado', 'Tarde', 2, 'Evaluando opciones en el exterior', NULL, false, NOW(), NOW()),
('Lucas Oviedo', 'UI', '2025-11-15', 'Número Incorrecto', NULL, 1, 'No existe', NULL, false, NOW(), NOW()),
('Valentina Prado', 'GF', '2025-11-17', 'Interesado', 'Mañana', 1, 'Muy interesada, agenda RAS', NULL, true, NOW(), NOW()),
('Mauro Quiroga', 'WE', '2025-11-19', 'No interesado', 'Tarde', 2, 'No aplica para esta carrera', NULL, false, NOW(), NOW()),
-- Diciembre 2025
('Agostina Roldán', 'LV', '2025-12-01', 'Contactado', 'Mañana', 1, 'Quiere inscripción para marzo', NULL, true, NOW(), NOW()),
('Julián Salas', 'WY', '2025-12-03', 'Interesado', 'Tarde', 1, 'Muy decidido, padres apoyan', NULL, true, NOW(), NOW()),
('Paloma Testa', 'LT', '2025-12-05', '1er Contacto', 'Mañana', 1, 'Última charla del año', NULL, false, NOW(), NOW()),
('Diego Uriarte', 'LD', '2025-12-07', 'Contactado', 'Noche', 2, 'Quiere empezar en agosto 2026', NULL, false, NOW(), NOW()),
('Camila Vidal', 'YN', '2025-12-09', 'Interesado', 'Tarde', 1, 'Inscripción temprana', NULL, true, NOW(), NOW()),
('Martín Yáñez', 'LG', '2025-12-11', 'Llamar más tarde', 'Mañana', 1, 'De vacaciones, llamar en enero', NULL, false, NOW(), NOW()),
('Florencia Zúñiga', 'VD', '2025-12-13', 'Contactado', 'Tarde', 2, 'Pidió reunión para enero', NULL, true, NOW(), NOW()),
('Sebastián Almada', 'UI', '2025-12-15', 'No interesado', 'Mañana', 3, 'Eligió Udelar', NULL, false, NOW(), NOW()),
('María Bustamante', 'GF', '2025-12-17', 'Interesado', 'Tarde', 1, 'Último contacto del año', NULL, true, NOW(), NOW()),
('Germán Castaño', 'WE', '2025-12-19', '1er Contacto', 'Noche', 1, 'WhatsApp', NULL, false, NOW(), NOW()),
-- Más leads variados para diversidad
('Ana Paula Silveira', 'LV', '2025-07-22', 'Interesado', 'Mañana', 1, 'Referida por profesora de liceo', NULL, true, NOW(), NOW()),
('Sebastián Melo', 'LV', '2025-08-25', 'Contactado', 'Tarde', 2, 'Pidió visita guiada', NULL, true, NOW(), NOW()),
('Camila Invernizzi', 'WY', '2025-09-15', '1er Contacto', 'Mañana', 1, 'Expo educativa Maldonado', NULL, false, NOW(), NOW()),
('Facundo Techera', 'WY', '2025-10-20', 'Interesado', 'Noche', 1, 'Quiere info sobre prácticas', NULL, true, NOW(), NOW()),
('Micaela Borges', 'LT', '2025-11-25', 'Contactado', 'Tarde', 2, 'Llamó el padre, muy interesados', NULL, true, NOW(), NOW()),
('Rodrigo Umpiérrez', 'LT', '2025-12-20', 'Llamar más tarde', 'Mañana', 1, 'Viajó a Brasil', NULL, false, NOW(), NOW()),
('Valentina Svirsky', 'LD', '2025-06-25', 'Interesado', 'Tarde', 1, 'Entusiasmada con la carrera', NULL, true, NOW(), NOW()),
('Matías Piñeiro', 'LD', '2025-08-30', 'No interesado', 'Noche', 2, 'Se va a estudiar al exterior', NULL, false, NOW(), NOW()),
('Lucía Teixeira', 'YN', '2025-04-25', 'Contactado', 'Mañana', 1, 'Madre llamó para consultar', NULL, false, NOW(), NOW()),
('Tomás Bentancor', 'YN', '2025-07-28', 'Interesado', 'Tarde', 2, 'Quiere empezar en marzo 2026', NULL, true, NOW(), NOW()),
('Isabella Noblía', 'LG', '2025-05-25', '1er Contacto', 'Mañana', 1, 'Formulario web general', NULL, false, NOW(), NOW()),
('Nicolás Strauch', 'LG', '2025-09-28', 'Contactado', 'Tarde', 3, 'Habló con 3 asesores', NULL, true, NOW(), NOW()),
('Martina Abal', 'VD', '2025-03-25', 'Interesado', 'Noche', 1, 'Viene de Open House marzo', NULL, true, NOW(), NOW()),
('Lautaro Brum', 'VD', '2025-06-28', 'Llamar más tarde', 'Mañana', 1, 'Trabajando, llamar de noche', NULL, false, NOW(), NOW()),
('Sofía De León', 'UI', '2025-04-28', 'Contactado', 'Tarde', 2, 'Quiere conocer docentes', NULL, true, NOW(), NOW()),
('Santiago Caorsi', 'UI', '2025-10-25', 'Interesado', 'Mañana', 1, 'Decidido por UI, quiere inscribirse', NULL, true, NOW(), NOW()),
('Emma Darnauchans', 'GF', '2025-05-28', 'No interesado', 'Tarde', 2, 'Prefiere otra universidad', NULL, false, NOW(), NOW()),
('Joaquín Facello', 'GF', '2025-11-28', '1er Contacto', 'Noche', 1, 'LinkedIn ads', NULL, false, NOW(), NOW()),
('Lucía Grompone', 'WE', '2025-03-28', 'Contactado', 'Mañana', 2, 'Pidió cuotas y financiamiento', NULL, false, NOW(), NOW()),
('Mateo Hareau', 'WE', '2025-08-28', 'Interesado', 'Tarde', 1, 'Referido por amigo estudiante', NULL, true, NOW(), NOW()),
-- 10 más para llegar a 160+
('Pilar Irazábal', 'LV', '2025-05-01', '1er Contacto', 'Mañana', 1, 'Stand en Expo', NULL, false, NOW(), NOW()),
('Dante Kechichian', 'WY', '2025-06-15', 'Contactado', 'Tarde', 1, 'Consulta por teléfono', NULL, false, NOW(), NOW()),
('Jazmín Larrosa', 'LT', '2025-07-10', 'Interesado', 'Noche', 1, 'Open House julio', NULL, true, NOW(), NOW()),
('Rafael Magnone', 'LD', '2025-08-20', 'Número Incorrecto', NULL, 2, 'Número no válido', NULL, false, NOW(), NOW()),
('Zoe Negrín', 'YN', '2025-09-25', 'Contactado', 'Mañana', 1, 'Info completa enviada', NULL, false, NOW(), NOW()),
('Elías Olivera', 'LG', '2025-10-30', 'Llamar más tarde', 'Tarde', 1, 'Ocupado esta semana', NULL, false, NOW(), NOW()),
('Luna Puppo', 'VD', '2025-11-05', 'Interesado', 'Mañana', 2, 'Quiere visitar sede', NULL, true, NOW(), NOW()),
('Simón Ravera', 'UI', '2025-12-10', 'Contactado', 'Tarde', 1, 'Pidió reunión enero', NULL, true, NOW(), NOW()),
('Aurora Stagnaro', 'GF', '2026-01-25', '1er Contacto', 'Noche', 1, 'Campaña enero 2026', NULL, false, NOW(), NOW()),
('León Tejera', 'WE', '2026-02-05', 'Interesado', 'Mañana', 1, 'Viene de charla virtual', NULL, true, NOW(), NOW()),
-- 10 más
('Paz Umpiérrez', 'LV', '2026-01-28', 'Contactado', 'Tarde', 2, 'Quiere RAS para febrero', NULL, true, NOW(), NOW()),
('Matías Viera', 'WY', '2026-02-08', '1er Contacto', 'Mañana', 1, 'Campaña redes sociales', NULL, false, NOW(), NOW()),
('Renata Zaffaroni', 'LT', '2026-02-10', 'Interesado', 'Tarde', 1, 'Decidida por LT', NULL, true, NOW(), NOW()),
('Ignacio Aguiar', 'LD', '2025-04-15', 'Contactado', 'Noche', 2, 'Padre muy involucrado', NULL, false, NOW(), NOW()),
('Alma Bermúdez', 'YN', '2025-05-15', 'Interesado', 'Mañana', 1, 'Charla liceo departamental', NULL, true, NOW(), NOW()),
('Franco Chiappara', 'LG', '2025-06-20', '1er Contacto', 'Tarde', 1, 'Contacto espontáneo', NULL, false, NOW(), NOW()),
('Nina Doglio', 'VD', '2025-07-25', 'Contactado', 'Mañana', 2, 'Pidió info completa por mail', NULL, false, NOW(), NOW()),
('Tobías Echevarría', 'UI', '2025-08-10', 'Llamar más tarde', 'Tarde', 1, 'En parciales', NULL, false, NOW(), NOW()),
('Abril Ferreira', 'GF', '2025-09-05', 'No interesado', 'Noche', 2, 'Cambió de opinión', NULL, false, NOW(), NOW()),
('Dylan Gadea', 'WE', '2025-10-10', 'Interesado', 'Mañana', 1, 'Quiere inscripción para marzo', NULL, true, NOW(), NOW()),
-- 10 más
('Milagros Hernández', 'LV', '2025-11-20', 'Contactado', 'Tarde', 1, 'Pidió hablar con egresado', NULL, true, NOW(), NOW()),
('Lucas Iraeta', 'WY', '2025-12-22', 'Interesado', 'Mañana', 1, 'Último del año, muy decidido', NULL, true, NOW(), NOW()),
('Candelaria Jauregui', 'LT', '2026-01-30', '1er Contacto', 'Tarde', 1, 'Viene de campaña digital', NULL, false, NOW(), NOW()),
('Gonzalo Kotsias', 'LD', '2025-03-30', 'Contactado', 'Noche', 2, 'Quiere conocer sede y docentes', NULL, true, NOW(), NOW()),
('Violeta Legnani', 'YN', '2025-04-22', 'Interesado', 'Mañana', 1, 'Referida por coordinador', NULL, true, NOW(), NOW()),
('Augusto Mautone', 'LG', '2025-05-22', 'Número Incorrecto', NULL, 1, 'Sin tono', NULL, false, NOW(), NOW()),
('Serena Nario', 'VD', '2025-06-22', 'Contactado', 'Tarde', 2, 'Info enviada, esperando respuesta', NULL, false, NOW(), NOW()),
('Hugo Oxandabarat', 'UI', '2025-07-22', '1er Contacto', 'Mañana', 1, 'Evento presencial', NULL, false, NOW(), NOW()),
('Elena Pastorino', 'GF', '2025-08-22', 'Llamar más tarde', 'Tarde', 1, 'Está de vacaciones', NULL, false, NOW(), NOW()),
('Adrián Quartucci', 'WE', '2025-09-22', 'Interesado', 'Noche', 1, 'Quiere info sobre egresados', NULL, true, NOW(), NOW()),
-- 10 finales
('Julia Raviolo', 'LV', '2025-10-22', 'Contactado', 'Mañana', 1, 'Habló con asesor', NULL, false, NOW(), NOW()),
('Emiliano Saravia', 'WY', '2025-11-22', 'Interesado', 'Tarde', 2, 'Interesado en beca por mérito', NULL, true, NOW(), NOW()),
('Lola Tartaglia', 'LT', '2025-12-15', '1er Contacto', 'Noche', 1, 'WhatsApp empresa', NULL, false, NOW(), NOW()),
('Pedro Urruzola', 'LD', '2026-01-15', 'Contactado', 'Mañana', 2, 'Pidió reunión con director', NULL, false, NOW(), NOW()),
('Amanda Veloso', 'YN', '2026-02-12', 'Interesado', 'Tarde', 1, 'Viene de evento de febrero', NULL, true, NOW(), NOW()),
('Rodrigo Wonsiak', 'LG', '2025-03-15', 'Contactado', 'Mañana', 3, 'Muchas consultas, interesado', NULL, true, NOW(), NOW()),
('Celeste Ximenes', 'VD', '2025-04-05', 'No interesado', 'Tarde', 2, 'Eligió otra carrera', NULL, false, NOW(), NOW()),
('Ezequiel Yafalián', 'UI', '2025-05-05', 'Interesado', 'Mañana', 1, 'Muy motivado por tecnología', NULL, true, NOW(), NOW()),
('Mikaela Zorrilla', 'GF', '2025-06-05', '1er Contacto', 'Tarde', 1, 'Contacto por charla', NULL, false, NOW(), NOW()),
('Lisandro Acuña', 'WE', '2025-07-05', 'Contactado', 'Noche', 2, 'Pidió info completa', NULL, false, NOW(), NOW());

-- ============================================================
-- PASO 3: INSERTAR OPORTUNIDADES (150 registros)
-- ============================================================
INSERT INTO oportunidades (nombre, cedula, telefono, mail, sape, carrera_interes, otros_intereses, liceo, fecha_lead, ras_agendada, ras_asistio, multiple_interes, liceo_tipo, ras_hecha_por, proceso_inicio, fase_oportunidad, comentario_extra, created_at, updated_at)
VALUES
-- Grupo 1: Inscriptos (30)
('Camila Rodríguez', '4.567.890-1', '099 111 222', 'camila.r@gmail.com', 'SAPE001', 'LT', NULL, 'Liceo 1 Montevideo', '2026-01-07', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Alumna inscripta exitosamente', NOW(), NOW()),
('Mateo González', '3.456.789-2', '098 222 333', 'mateo.g@gmail.com', 'SAPE002', 'LG', NULL, 'Colegio Santa María', '2026-01-10', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'Inscripto con beca parcial', NOW(), NOW()),
('Isabella Pérez', '5.678.901-3', '097 333 444', 'isabella.p@gmail.com', 'SAPE003', 'VD', NULL, 'Liceo Dep. Salto', '2026-01-11', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Inscripto', 'Se mudó a Montevideo para estudiar', NOW(), NOW()),
('Florencia Díaz', '4.321.098-4', '099 444 555', 'flor.diaz@gmail.com', 'SAPE004', 'LV', NULL, 'Liceo Rivera', '2026-01-15', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Inscripto', 'Del interior, ya tiene residencia', NOW(), NOW()),
('Martina Castro', '5.432.109-5', '098 555 666', 'martina.c@gmail.com', 'SAPE005', 'YN', NULL, 'Colegio Pallotti', '2026-01-19', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'Familia muy comprometida', NOW(), NOW()),
('Catalina Flores', '3.210.987-6', '097 666 777', 'cata.flores@gmail.com', 'SAPE006', 'GF', NULL, 'Liceo 12 Montevideo', '2026-01-23', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Excelente perfil académico', NOW(), NOW()),
('Thiago Vargas', '4.109.876-7', '099 777 888', 'thiago.v@gmail.com', 'SAPE007', 'WY', NULL, 'British Schools', '2026-02-02', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'Inscripto, pago al día', NOW(), NOW()),
('Antonella Giménez', '5.098.765-8', '098 888 999', 'antonella.g@gmail.com', 'SAPE008', 'LT', NULL, 'Liceo 7 Montevideo', '2026-02-03', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Contenta con la elección', NOW(), NOW()),
('Delfina Suárez', '3.987.654-9', '097 999 000', 'delfina.s@gmail.com', 'SAPE009', 'VD', '["LV","LT"]', 'Liceo Paysandú', '2026-02-07', true, true, true, 'Interior', NULL, 'Marzo 2026', 'Inscripto', 'Inscripta en VD, interés múltiple', NOW(), NOW()),
('Santino Luna', '4.876.543-0', '099 010 020', 'santino.l@gmail.com', 'SAPE010', 'UI', NULL, 'Liceo 3 Montevideo', '2026-02-08', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Fanático de la tecnología', NOW(), NOW()),
('Clara Gutiérrez', '5.765.432-1', '098 030 040', 'clara.g@gmail.com', 'SAPE011', 'LV', NULL, 'Colegio Sagrado Corazón', '2026-02-11', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'Perfil excelente', NOW(), NOW()),
('Mía Peralta', '3.654.321-2', '097 050 060', 'mia.peralta@gmail.com', 'SAPE012', 'YN', NULL, 'Liceo 4 Montevideo', '2026-02-15', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Padres acompañaron todo el proceso', NOW(), NOW()),
('Ambar Sosa', '4.543.210-3', '099 070 080', 'ambar.sosa@gmail.com', 'SAPE013', 'GF', NULL, 'Colegio Crandon', '2026-02-18', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'Inscripta satisfactoriamente', NOW(), NOW()),
('Pilar Acuña', '5.432.109-4', '098 090 100', 'pilar.a@gmail.com', 'SAPE014', 'LV', NULL, 'Liceo Maldonado', '2025-03-03', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Inscripto', 'Inscripta agosto 2025', NOW(), NOW()),
('Dante Correa', '3.321.098-5', '097 110 120', 'dante.c@gmail.com', 'SAPE015', 'WY', NULL, 'Liceo 9 Montevideo', '2025-03-05', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Inscripto', 'Proceso exitoso', NOW(), NOW()),
('Zoe Pereira', '4.210.987-6', '099 130 140', 'zoe.p@gmail.com', 'SAPE016', 'YN', '["LG"]', 'Colegio San Fernando', '2025-03-11', true, true, true, 'Privado', NULL, 'Agosto 2025', 'Inscripto', 'Inscripta en YN', NOW(), NOW()),
('Simón Cardozo', '5.109.876-7', '098 150 160', 'simon.c@gmail.com', 'SAPE017', 'UI', NULL, 'Liceo 15 Montevideo', '2025-03-17', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Inscripto', 'Alumno estrella', NOW(), NOW()),
('León Duarte', '3.098.765-8', '097 170 180', 'leon.d@gmail.com', 'SAPE018', 'WE', NULL, 'Liceo Durazno', '2025-03-21', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Inscripto', 'Se trasladó a Montevideo', NOW(), NOW()),
('Renata Cáceres', '4.987.654-9', '099 190 200', 'renata.c@gmail.com', 'SAPE019', 'LT', NULL, 'Colegio Stella Maris', '2025-04-06', true, true, false, 'Privado', NULL, 'Agosto 2025', 'Inscripto', 'Madre muy contenta', NOW(), NOW()),
('Nina Delgado', '5.876.543-0', '098 210 220', 'nina.d@gmail.com', 'SAPE020', 'VD', NULL, 'Liceo Artigas', '2025-04-14', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Inscripto', 'Interior, beca aprobada', NOW(), NOW()),
('Milagros Bravo', '3.765.432-1', '097 230 240', 'mili.b@gmail.com', 'SAPE021', 'LV', NULL, 'Liceo 2 Montevideo', '2025-05-02', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Inscripto', 'Proceso completo', NOW(), NOW()),
('Lucas Quiroga', '4.654.321-2', '099 250 260', 'lucas.q@gmail.com', 'SAPE022', 'WY', NULL, 'Colegio Woodside', '2025-05-04', true, true, false, 'Privado', NULL, 'Agosto 2025', 'Inscripto', 'Con financiamiento aprobado', NOW(), NOW()),
('Serena Miranda', '5.543.210-3', '098 270 280', 'serena.m@gmail.com', 'SAPE023', 'VD', NULL, 'Liceo Tacuarembó', '2025-05-14', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Inscripto', 'Del interior, muy comprometida', NOW(), NOW()),
('Julia Cabral', '3.432.109-4', '097 290 300', 'julia.cab@gmail.com', 'SAPE024', 'LV', NULL, 'Liceo 6 Montevideo', '2025-06-01', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Inscripto', 'RAS presencial exitosa', NOW(), NOW()),
('Amanda Arias', '4.321.098-5', '099 310 320', 'amanda.a@gmail.com', 'SAPE025', 'YN', NULL, 'Colegio Seminario', '2025-06-09', true, true, false, 'Privado', NULL, 'Agosto 2025', 'Inscripto', 'Decidida desde el primer contacto', NOW(), NOW()),
('Ezequiel Paz', '5.210.987-6', '098 330 340', 'eze.paz@gmail.com', 'SAPE026', 'UI', NULL, 'Liceo 10 Montevideo', '2025-06-15', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Inscripto', 'Apasionado por IT', NOW(), NOW()),
('Kevin Estrada', '3.109.876-7', '097 350 360', 'kevin.e@gmail.com', 'SAPE027', 'WY', NULL, 'Liceo Canelones', '2025-07-03', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Inscripto', 'Inscripto para marzo 2026', NOW(), NOW()),
('Maite Pereyra', '4.098.765-8', '099 370 380', 'maite.p@gmail.com', 'SAPE028', 'VD', NULL, 'Liceo 14 Montevideo', '2025-07-13', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Inscripto', 'Muy decidida', NOW(), NOW()),
('Enzo Valdez', '5.987.654-9', '098 390 400', 'enzo.v@gmail.com', 'SAPE029', 'WE', NULL, 'Colegio San José', '2025-07-19', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Inscripto', 'RAS online, proceso rápido', NOW(), NOW()),
('Daniela Berón', '3.876.543-0', '097 410 420', 'daniela.b@gmail.com', 'SAPE030', 'LV', '["WY","GF"]', 'Liceo Colonia', '2025-08-01', true, true, true, 'Interior', NULL, 'Marzo 2026', 'Inscripto', 'Inscripta con múltiple interés', NOW(), NOW()),

-- Grupo 2: Promesa de Inscripción (25)
('Julieta Coronel', '4.765.432-1', '099 430 440', 'julieta.c@gmail.com', 'SAPE031', 'LT', NULL, 'Liceo 5 Montevideo', '2025-08-05', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Prometió inscribirse en enero', NOW(), NOW()),
('Tamara Herrera', '5.654.321-2', '098 450 460', 'tamara.h@gmail.com', 'SAPE032', 'VD', NULL, 'Colegio Ivy Thomas', '2025-08-13', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Esperando confirmación de beca', NOW(), NOW()),
('Priscila Juárez', '3.543.210-3', '097 470 480', 'priscila.j@gmail.com', 'SAPE033', 'GF', NULL, 'Liceo Mercedes', '2025-08-17', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Reunión con coordinador exitosa', NOW(), NOW()),
('Carolina Leguizamón', '4.432.109-4', '099 490 500', 'carol.l@gmail.com', 'SAPE034', 'LV', NULL, 'Liceo 8 Montevideo', '2025-09-02', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Decidida, falta papeleo', NOW(), NOW()),
('Guadalupe Pintos', '5.321.098-5', '098 510 520', 'guada.p@gmail.com', 'SAPE035', 'YN', NULL, 'Colegio del Huerto', '2025-09-10', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Esperando resultado de examen final', NOW(), NOW()),
('Diego Quintana', '3.210.987-6', '097 530 540', 'diego.q@gmail.com', 'SAPE036', 'LG', NULL, 'Liceo Florida', '2025-09-12', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Prometió inscripción para febrero', NOW(), NOW()),
('Marcos Solano', '4.109.876-7', '099 550 560', 'marcos.s@gmail.com', 'SAPE037', 'UI', NULL, 'Liceo 11 Montevideo', '2025-09-16', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Padres dieron el OK', NOW(), NOW()),
('Regina Vázquez', '5.098.765-8', '098 570 580', 'regina.v@gmail.com', 'SAPE038', 'LV', NULL, 'Liceo Minas', '2025-10-01', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Confirmó inscripción para febrero', NOW(), NOW()),
('Pablo Wainstein', '3.987.654-9', '097 590 600', 'pablo.w@gmail.com', 'SAPE039', 'WY', NULL, 'Colegio Elbio Fernández', '2025-10-03', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Esperando transferencia de pago', NOW(), NOW()),
('Fernando Barrios', '4.876.543-0', '099 610 620', 'fernando.b@gmail.com', 'SAPE040', 'LG', NULL, 'Liceo 13 Montevideo', '2025-10-11', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Proceso casi completo', NOW(), NOW()),
('Alejo Dutra', '5.765.432-1', '098 630 640', 'alejo.d@gmail.com', 'SAPE041', 'UI', NULL, 'Colegio y Liceo Impulso', '2025-10-15', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Confirmó inscripción', NOW(), NOW()),
('Mora Echeverría', '3.654.321-2', '097 650 660', 'mora.e@gmail.com', 'SAPE042', 'GF', '["LV"]', 'Liceo Rocha', '2025-10-17', true, true, true, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Interés múltiple, prioriza GF', NOW(), NOW()),
('Luciana Greco', '4.543.210-3', '099 670 680', 'luciana.g@gmail.com', 'SAPE043', 'LV', NULL, 'Liceo 16 Montevideo', '2025-11-01', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'RAS exitosa en diciembre', NOW(), NOW()),
('Tadeo Mansur', '5.432.109-4', '098 690 700', 'tadeo.m@gmail.com', 'SAPE044', 'LG', NULL, 'Colegio José Artigas', '2025-11-11', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Esperando documentación', NOW(), NOW()),
('Valentina Prado', '3.321.098-5', '097 710 720', 'vale.prado@gmail.com', 'SAPE045', 'GF', NULL, 'Liceo Treinta y Tres', '2025-11-17', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Prometió inscripción', NOW(), NOW()),
('Agostina Roldán', '4.210.987-6', '099 730 740', 'agos.r@gmail.com', 'SAPE046', 'LV', NULL, 'Liceo 18 Montevideo', '2025-12-01', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Inscripción para marzo', NOW(), NOW()),
('Julián Salas', '5.109.876-7', '098 750 760', 'julian.s@gmail.com', 'SAPE047', 'WY', NULL, 'Colegio San Pablo', '2025-12-03', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Padres ya pagaron matrícula', NOW(), NOW()),
('Camila Vidal', '3.098.765-8', '097 770 780', 'camila.v@gmail.com', 'SAPE048', 'YN', NULL, 'Liceo Piriápolis', '2025-12-09', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Promesa firme', NOW(), NOW()),
('Florencia Zúñiga', '4.987.654-9', '099 790 800', 'flor.z@gmail.com', 'SAPE049', 'VD', NULL, 'Liceo 20 Montevideo', '2025-12-13', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Reunión exitosa', NOW(), NOW()),
('María Bustamante', '5.876.543-0', '098 810 820', 'maria.b@gmail.com', 'SAPE050', 'GF', NULL, 'Colegio Misericordistas', '2025-12-17', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Última del año', NOW(), NOW()),
('Ana Paula Silveira', '3.765.432-1', '097 830 840', 'anapaula.s@gmail.com', 'SAPE051', 'LV', NULL, 'Liceo Fray Bentos', '2025-07-22', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Referida, muy comprometida', NOW(), NOW()),
('Sebastián Melo', '4.654.321-2', '099 850 860', 'seba.m@gmail.com', 'SAPE052', 'LV', NULL, 'Liceo 22 Montevideo', '2025-08-25', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Prometió inscripción', NOW(), NOW()),
('Facundo Techera', '5.543.210-3', '098 870 880', 'facu.t@gmail.com', 'SAPE053', 'WY', NULL, 'Colegio Bretagne', '2025-10-20', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Interesado en prácticas', NOW(), NOW()),
('Micaela Borges', '3.432.109-4', '097 890 900', 'mica.b@gmail.com', 'SAPE054', 'LT', NULL, 'Liceo San José', '2025-11-25', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Padre gestionó todo', NOW(), NOW()),
('Valentina Svirsky', '4.321.098-5', '099 910 920', 'vale.sv@gmail.com', 'SAPE055', 'LD', NULL, 'Liceo 24 Montevideo', '2025-06-25', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Promesa de Inscripción', 'Decidida por LD', NOW(), NOW()),

-- Grupo 3: Evaluando (30)
('Tomás Bentancor', '5.210.987-6', '098 930 940', 'tomas.b@gmail.com', 'SAPE056', 'YN', NULL, 'Colegio Pocitos Day School', '2025-07-28', true, false, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Evaluando entre ORT y UCU', NOW(), NOW()),
('Nicolás Strauch', '3.109.876-7', '097 950 960', 'nico.s@gmail.com', 'SAPE057', 'LG', '["WY","LD"]', 'Liceo Flores', '2025-09-28', true, true, true, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Múltiples intereses, evaluando carrera', NOW(), NOW()),
('Martina Abal', '4.098.765-8', '099 970 980', 'martina.a@gmail.com', 'SAPE058', 'VD', NULL, 'Liceo 25 Montevideo', '2025-03-25', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Evaluando', 'Evaluó en agosto, sigue decidiendo', NOW(), NOW()),
('Sofía De León', '5.987.654-9', '098 990 010', 'sofia.dl@gmail.com', 'SAPE059', 'UI', NULL, 'Colegio IPOLL', '2025-04-28', true, true, false, 'Privado', NULL, 'Agosto 2025', 'Evaluando', 'Conoció docentes, evaluando', NOW(), NOW()),
('Santiago Caorsi', '3.876.543-0', '097 020 030', 'santi.c@gmail.com', 'SAPE060', 'UI', NULL, 'Liceo Salto', '2025-10-25', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Evaluando mudanza a Montevideo', NOW(), NOW()),
('Mateo Hareau', '4.765.432-1', '099 040 050', 'mateo.h@gmail.com', 'SAPE061', 'WE', NULL, 'Liceo 26 Montevideo', '2025-08-28', true, false, false, 'Publico', NULL, 'Marzo 2026', 'Evaluando', 'Referido, evaluando opciones', NOW(), NOW()),
('Jazmín Larrosa', '5.654.321-2', '098 060 070', 'jazmin.l@gmail.com', 'SAPE062', 'LT', NULL, 'Colegio María Auxiliadora', '2025-07-10', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Open House, evaluando', NOW(), NOW()),
('Luna Puppo', '3.543.210-3', '097 080 090', 'luna.p@gmail.com', 'SAPE063', 'VD', NULL, 'Liceo Tacuarembó', '2025-11-05', true, false, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Quiere visitar sede antes', NOW(), NOW()),
('Simón Ravera', '4.432.109-4', '099 100 110', 'simon.r@gmail.com', 'SAPE064', 'UI', NULL, 'Liceo 28 Montevideo', '2025-12-10', true, false, false, 'Publico', NULL, 'Marzo 2026', 'Evaluando', 'Pidió reunión enero', NOW(), NOW()),
('León Tejera', '5.321.098-5', '098 120 130', 'leon.t@gmail.com', 'SAPE065', 'WE', NULL, 'Colegio Jesús María', '2026-02-05', false, false, false, 'Privado', NULL, 'Agosto 2026', 'Evaluando', 'Recién contactado, evaluando', NOW(), NOW()),
('Paz Umpiérrez', '3.210.987-6', '097 140 150', 'paz.u@gmail.com', 'SAPE066', 'LV', NULL, 'Liceo Rivera', '2026-01-28', true, false, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'RAS agendada, evaluando opciones', NOW(), NOW()),
('Renata Zaffaroni', '4.109.876-7', '099 160 170', 'renata.z@gmail.com', 'SAPE067', 'LT', NULL, 'Liceo 30 Montevideo', '2026-02-10', false, false, false, 'Publico', NULL, 'Agosto 2026', 'Evaluando', 'Decidida por LT pero evaluando semestre', NOW(), NOW()),
('Alma Bermúdez', '5.098.765-8', '098 180 190', 'alma.b@gmail.com', 'SAPE068', 'YN', NULL, 'Colegio San Ignacio', '2025-05-15', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Charla liceo, evaluando', NOW(), NOW()),
('Gonzalo Kotsias', '3.987.654-9', '097 200 210', 'gonzalo.k@gmail.com', 'SAPE069', 'LD', NULL, 'Liceo Cerro Largo', '2025-03-30', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Evaluando', 'Evaluando entre 2 carreras', NOW(), NOW()),
('Violeta Legnani', '4.876.543-0', '099 220 230', 'violeta.l@gmail.com', 'SAPE070', 'YN', NULL, 'Liceo 32 Montevideo', '2025-04-22', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Evaluando', 'Referida, evaluando opciones', NOW(), NOW()),
('Adrián Quartucci', '5.765.432-1', '098 240 250', 'adrian.q@gmail.com', 'SAPE071', 'WE', NULL, 'Colegio Instituto Crandon', '2025-09-22', true, false, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Quiere info egresados', NOW(), NOW()),
('Emiliano Saravia', '3.654.321-2', '097 260 270', 'emiliano.s@gmail.com', 'SAPE072', 'WY', NULL, 'Liceo Lavalleja', '2025-11-22', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Evaluando beca', NOW(), NOW()),
('Milagros Hernández', '4.543.210-3', '099 280 290', 'mili.h@gmail.com', 'SAPE073', 'LV', NULL, 'Liceo 33 Montevideo', '2025-11-20', true, true, false, 'Publico', NULL, 'Marzo 2026', 'Evaluando', 'Habló con egresado', NOW(), NOW()),
('Lucas Iraeta', '5.432.109-4', '098 300 310', 'lucas.i@gmail.com', 'SAPE074', 'WY', '["UI"]', 'Colegio José Benito Lamas', '2025-12-22', true, false, true, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Múltiple interés WY/UI', NOW(), NOW()),
('Dylan Gadea', '3.321.098-5', '097 320 330', 'dylan.g@gmail.com', 'SAPE075', 'WE', NULL, 'Liceo Colonia', '2025-10-10', true, true, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Quiere marzo 2026', NOW(), NOW()),
('Amanda Veloso', '4.210.987-6', '099 340 350', 'amanda.v@gmail.com', 'SAPE076', 'YN', NULL, 'Liceo 35 Montevideo', '2026-02-12', false, false, false, 'Publico', NULL, 'Agosto 2026', 'Evaluando', 'Evento febrero, evaluando', NOW(), NOW()),
('Rodrigo Wonsiak', '5.109.876-7', '098 360 370', 'rodrigo.w@gmail.com', 'SAPE077', 'LG', NULL, 'Colegio Saint George', '2025-03-15', true, true, false, 'Privado', NULL, 'Agosto 2025', 'Evaluando', 'Muchas consultas, evaluando', NOW(), NOW()),
('Ezequiel Yafalián', '3.098.765-8', '097 380 390', 'eze.y@gmail.com', 'SAPE078', 'UI', NULL, 'Liceo San Carlos', '2025-05-05', true, true, false, 'Interior', NULL, 'Agosto 2025', 'Evaluando', 'Apasionado pero evaluando mudanza', NOW(), NOW()),
('Abril Lagos', '4.987.654-9', '099 400 410', 'abril.l@gmail.com', 'SAPE079', 'GF', NULL, 'Liceo 36 Montevideo', '2025-04-18', true, true, false, 'Publico', NULL, 'Agosto 2025', 'Evaluando', 'Conocer salida laboral', NOW(), NOW()),
('Axel Guzmán', '5.876.543-0', '098 420 430', 'axel.g@gmail.com', 'SAPE080', 'LD', NULL, 'Colegio Biarritz', '2025-07-07', true, true, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Quiere conocer egresados', NOW(), NOW()),
('Agustina Campos', '3.765.432-1', '097 440 450', 'agus.c@gmail.com', 'SAPE081', 'LT', NULL, 'Liceo Melo', '2025-07-05', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Referida, evaluando', NOW(), NOW()),
('Romina Escalante', '4.654.321-2', '099 460 470', 'romina.e@gmail.com', 'SAPE082', 'LV', NULL, 'Liceo 37 Montevideo', '2025-07-01', true, false, false, 'Publico', NULL, 'Marzo 2026', 'Evaluando', 'Interesada pero viaja', NOW(), NOW()),
('Iván Robledo', '5.543.210-3', '098 480 490', 'ivan.r@gmail.com', 'SAPE083', 'UI', NULL, 'Colegio del Sol', '2025-07-15', true, false, false, 'Privado', NULL, 'Marzo 2026', 'Evaluando', 'Doble titulación', NOW(), NOW()),
('Constanza Toledo', '3.432.109-4', '097 500 510', 'consti.t@gmail.com', 'SAPE084', 'GF', NULL, 'Liceo Soriano', '2025-09-18', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Evaluando', 'Pidió info por email', NOW(), NOW()),
('Candela Heredia', '4.321.098-5', '099 520 530', 'candela.h@gmail.com', 'SAPE085', 'YN', NULL, 'Liceo 38 Montevideo', '2025-07-09', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Evaluando', 'Pidió llamar en setiembre', NOW(), NOW()),

-- Grupo 4: Interesado (30)
('Abril Ferreira', '5.210.987-6', '098 540 550', 'abril.f@gmail.com', 'SAPE086', 'GF', NULL, 'Colegio Nuestra Señora', '2025-09-05', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Interesado', 'Interesada pero cambió de opinión', NOW(), NOW()),
('Lautaro Brum', '3.109.876-7', '097 560 570', 'lauti.b@gmail.com', 'SAPE087', 'VD', NULL, 'Liceo Paysandú', '2025-06-28', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'Interesado, llamar de noche', NOW(), NOW()),
('Hugo Oxandabarat', '4.098.765-8', '099 580 590', 'hugo.o@gmail.com', 'SAPE088', 'UI', NULL, 'Liceo 39 Montevideo', '2025-07-22', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'Evento presencial', NOW(), NOW()),
('Franco Chiappara', '5.987.654-9', '098 600 610', 'franco.ch@gmail.com', 'SAPE089', 'LG', NULL, 'Colegio Alemán', '2025-06-20', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Interesado', 'Contacto espontáneo', NOW(), NOW()),
('Nina Doglio', '3.876.543-0', '097 620 630', 'nina.dog@gmail.com', 'SAPE090', 'VD', NULL, 'Liceo Durazno', '2025-07-25', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'Pidió info por mail', NOW(), NOW()),
('Tobías Echevarría', '4.765.432-1', '099 640 650', 'tobias.e@gmail.com', 'SAPE091', 'UI', NULL, 'Liceo 40 Montevideo', '2025-08-10', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'En parciales, retomar contacto', NOW(), NOW()),
('Serena Nario', '5.654.321-2', '098 660 670', 'serena.n@gmail.com', 'SAPE092', 'VD', NULL, 'Colegio San Patricio', '2025-06-22', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Interesado', 'Info enviada, esperando', NOW(), NOW()),
('Elena Pastorino', '3.543.210-3', '097 680 690', 'elena.p@gmail.com', 'SAPE093', 'GF', NULL, 'Liceo Rocha', '2025-08-22', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'De vacaciones, retomar', NOW(), NOW()),
('Julia Raviolo', '4.432.109-4', '099 700 710', 'julia.r@gmail.com', 'SAPE094', 'LV', NULL, 'Liceo 41 Montevideo', '2025-10-22', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'Habló con asesor', NOW(), NOW()),
('Pedro Urruzola', '5.321.098-5', '098 720 730', 'pedro.u@gmail.com', 'SAPE095', 'LD', NULL, 'Colegio y Liceo Maturana', '2026-01-15', false, false, false, 'Privado', NULL, 'Agosto 2026', 'Interesado', 'Pidió reunión con director', NOW(), NOW()),
('Candelaria Jauregui', '3.210.987-6', '097 740 750', 'cande.j@gmail.com', 'SAPE096', 'LT', NULL, 'Liceo Artigas', '2026-01-30', false, false, false, 'Interior', NULL, 'Agosto 2026', 'Interesado', 'Campaña digital', NOW(), NOW()),
('Pilar Irazábal', '4.109.876-7', '099 760 770', 'pilar.ir@gmail.com', 'SAPE097', 'LV', NULL, 'Liceo 42 Montevideo', '2025-05-01', false, false, false, 'Publico', NULL, 'Agosto 2025', 'Interesado', 'Stand en Expo', NOW(), NOW()),
('Dante Kechichian', '5.098.765-8', '098 780 790', 'dante.k@gmail.com', 'SAPE098', 'WY', NULL, 'Colegio Preuniversitario', '2025-06-15', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Interesado', 'Consulta telefónica', NOW(), NOW()),
('Zoe Negrín', '3.987.654-9', '097 800 810', 'zoe.n@gmail.com', 'SAPE099', 'YN', NULL, 'Liceo Maldonado', '2025-09-25', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'Info completa enviada', NOW(), NOW()),
('Elías Olivera', '4.876.543-0', '099 820 830', 'elias.o@gmail.com', 'SAPE100', 'LG', NULL, 'Liceo 43 Montevideo', '2025-10-30', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'Ocupado, retomar', NOW(), NOW()),
('Aurora Stagnaro', '5.765.432-1', '098 840 850', 'aurora.s@gmail.com', 'SAPE101', 'GF', NULL, 'Colegio Habilitado Euskalerria', '2026-01-25', false, false, false, 'Privado', NULL, 'Agosto 2026', 'Interesado', 'Campaña enero 2026', NOW(), NOW()),
('Matías Viera', '3.654.321-2', '097 860 870', 'matias.v@gmail.com', 'SAPE102', 'WY', NULL, 'Liceo Treinta y Tres', '2026-02-08', false, false, false, 'Interior', NULL, 'Agosto 2026', 'Interesado', 'Campaña redes sociales', NOW(), NOW()),
('Ignacio Aguiar', '4.543.210-3', '099 880 890', 'ignacio.ag@gmail.com', 'SAPE103', 'LD', NULL, 'Liceo 44 Montevideo', '2025-04-15', false, false, false, 'Publico', NULL, 'Agosto 2025', 'Interesado', 'Padre involucrado', NOW(), NOW()),
('Isabella Noblía', '5.432.109-4', '098 900 910', 'isabella.n@gmail.com', 'SAPE104', 'LG', NULL, 'Colegio del Sur', '2025-05-25', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Interesado', 'Formulario web', NOW(), NOW()),
('Lucía Teixeira', '3.321.098-5', '097 920 930', 'lucia.te@gmail.com', 'SAPE105', 'YN', NULL, 'Liceo Carmelo', '2025-04-25', false, false, false, 'Interior', NULL, 'Agosto 2025', 'Interesado', 'Madre consultó', NOW(), NOW()),
('Sofía Yamamoto', '4.210.987-6', '099 940 950', 'sofia.y@gmail.com', 'SAPE106', 'LT', NULL, 'Liceo 45 Montevideo', '2025-10-05', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'Open House octubre', NOW(), NOW()),
('Germán Castaño', '5.109.876-7', '098 960 970', 'german.c@gmail.com', 'SAPE107', 'WE', NULL, 'Colegio Pedro de Mendoza', '2025-12-19', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Interesado', 'WhatsApp contacto', NOW(), NOW()),
('Lola Tartaglia', '3.098.765-8', '097 980 990', 'lola.t@gmail.com', 'SAPE108', 'LT', NULL, 'Liceo Bella Unión', '2025-12-15', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'WhatsApp empresa', NOW(), NOW()),
('Joaquín Facello', '4.987.654-9', '099 001 011', 'joaquin.f@gmail.com', 'SAPE109', 'GF', NULL, 'Liceo 46 Montevideo', '2025-11-28', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'LinkedIn ads', NOW(), NOW()),
('Camila Invernizzi', '5.876.543-0', '098 021 031', 'camila.i@gmail.com', 'SAPE110', 'WY', NULL, 'Colegio Santa Elena', '2025-09-15', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Interesado', 'Expo Maldonado', NOW(), NOW()),
('Rodrigo Umpiérrez', '3.765.432-1', '097 041 051', 'rodrigo.um@gmail.com', 'SAPE111', 'LT', NULL, 'Liceo Rivera', '2025-12-20', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Interesado', 'Viajó, retomar', NOW(), NOW()),
('Matías Piñeiro', '4.654.321-2', '099 061 071', 'matias.p@gmail.com', 'SAPE112', 'LD', NULL, 'Liceo 47 Montevideo', '2025-08-30', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Interesado', 'Evaluaba exterior', NOW(), NOW()),
('Rocío Sandoval', '5.543.210-3', '098 081 091', 'rocio.s@gmail.com', 'SAPE113', 'GF', NULL, 'Colegio del Pilar', '2025-07-17', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Interesado', 'Stand shopping', NOW(), NOW()),
('Bruno Vega', '3.432.109-4', '097 101 111', 'bruno.v@gmail.com', 'SAPE114', 'WE', NULL, 'Liceo Young', '2026-02-18', false, false, false, 'Interior', NULL, 'Agosto 2026', 'Interesado', 'WhatsApp Business', NOW(), NOW()),
('Gael Ortega', '4.321.098-5', '099 121 131', 'gael.o@gmail.com', 'SAPE115', 'UI', NULL, 'Liceo 48 Montevideo', '2026-02-18', false, false, false, 'Publico', NULL, 'Agosto 2026', 'Interesado', 'Doble titulación', NOW(), NOW()),

-- Grupo 5: Contactado (20)
('Emilia Ruiz', '5.210.987-2', '098 131 141', 'emilia.r@gmail.com', 'SAPE116', 'LT', NULL, 'Liceo 49 Montevideo', '2026-01-17', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Contactado', 'Madre llamó por ella', NOW(), NOW()),
('Ian Domínguez', '3.109.876-3', '097 151 161', 'ian.d@gmail.com', 'SAPE117', 'LD', NULL, 'Colegio Santa Clara', '2026-02-14', false, false, false, 'Privado', NULL, 'Agosto 2026', 'Contactado', 'Evaluando ORT vs otra opción', NOW(), NOW()),
('Victoria Silva', '4.098.765-4', '099 171 181', 'victoria.s@gmail.com', 'SAPE118', 'VD', NULL, 'Liceo Artigas', '2026-01-21', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Contactado', 'Pidió folleto digital', NOW(), NOW()),
('Nicolás Torres', '5.987.654-5', '098 191 201', 'nico.t@gmail.com', 'SAPE119', 'WE', NULL, 'Liceo 50 Montevideo', '2026-01-14', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Contactado', 'Evaluando opciones', NOW(), NOW()),
('Bautista Herrera', '3.876.543-6', '097 211 221', 'bautista.h@gmail.com', 'SAPE120', 'WE', NULL, 'Colegio San Agustín', '2026-01-24', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Contactado', 'Consultó financiamiento', NOW(), NOW()),
('Máximo Cabrera', '4.765.432-7', '099 231 241', 'maximo.c@gmail.com', 'SAPE121', 'WE', NULL, 'Liceo Canelones', '2026-02-10', false, false, false, 'Interior', NULL, 'Agosto 2026', 'Contactado', 'Pidió info pasantías', NOW(), NOW()),
('Lorenzo Navarro', '5.654.321-8', '098 251 261', 'lorenzo.n@gmail.com', 'SAPE122', 'WY', NULL, 'Liceo 51 Montevideo', '2026-02-12', false, false, false, 'Publico', NULL, 'Agosto 2026', 'Contactado', 'Stand shopping', NOW(), NOW()),
('Emiliano Otero', '3.543.210-9', '097 271 281', 'emiliano.o@gmail.com', 'SAPE123', 'WY', NULL, 'Colegio Providencia', '2025-06-03', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Contactado', 'Padre consultó', NOW(), NOW()),
('Rodrigo Blanco', '4.432.109-0', '099 291 301', 'rodrigo.b@gmail.com', 'SAPE124', 'LG', NULL, 'Liceo Mercedes', '2025-06-11', false, false, false, 'Interior', NULL, 'Agosto 2025', 'Contactado', 'Dudando entre LG y LD', NOW(), NOW()),
('Lisandro Franco', '5.321.098-1', '098 311 321', 'lisandro.f@gmail.com', 'SAPE125', 'WE', NULL, 'Liceo 52 Montevideo', '2025-06-19', false, false, false, 'Publico', NULL, 'Agosto 2025', 'Contactado', 'Info de carreras', NOW(), NOW()),
('Federico Mansilla', '3.210.987-2', '097 331 341', 'fede.m@gmail.com', 'SAPE126', 'WY', NULL, 'Colegio José Pedro Varela', '2025-09-04', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Contactado', 'Dudando WY vs LT', NOW(), NOW()),
('Tomás Zárate', '4.109.876-3', '099 351 361', 'tomas.z@gmail.com', 'SAPE127', 'LD', NULL, 'Liceo Salto', '2025-10-07', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Contactado', 'Quiere hablar con director', NOW(), NOW()),
('Nahuel Iglesias', '5.098.765-4', '098 371 381', 'nahuel.i@gmail.com', 'SAPE128', 'WY', NULL, 'Liceo 53 Montevideo', '2025-11-03', false, false, false, 'Publico', NULL, 'Marzo 2026', 'Contactado', 'Evaluando carreras tech', NOW(), NOW()),
('Danna León', '3.987.654-5', '097 391 401', 'danna.l@gmail.com', 'SAPE129', 'YN', NULL, 'Colegio San Juan', '2025-11-09', false, false, false, 'Privado', NULL, 'Marzo 2026', 'Contactado', 'Info plan de estudios', NOW(), NOW()),
('Sol Navas', '4.876.543-6', '099 411 421', 'sol.n@gmail.com', 'SAPE130', 'VD', NULL, 'Liceo Paysandú', '2025-11-13', false, false, false, 'Interior', NULL, 'Marzo 2026', 'Contactado', 'Evaluando exterior', NOW(), NOW()),
('Diego Uriarte', '5.765.432-7', '098 431 441', 'diego.u@gmail.com', 'SAPE131', 'LD', NULL, 'Liceo 54 Montevideo', '2025-12-07', false, false, false, 'Publico', NULL, 'Agosto 2026', 'Contactado', 'Quiere agosto 2026', NOW(), NOW()),
('Lucía Grompone', '3.654.321-8', '097 451 461', 'lucia.g@gmail.com', 'SAPE132', 'WE', NULL, 'Colegio Pocitos', '2025-03-28', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Contactado', 'Info cuotas', NOW(), NOW()),
('Alma Velázquez', '4.543.210-9', '099 471 481', 'alma.v@gmail.com', 'SAPE133', 'YN', NULL, 'Liceo Florida', '2025-04-10', false, false, false, 'Interior', NULL, 'Agosto 2025', 'Contactado', 'Evaluando presencial vs online', NOW(), NOW()),
('Paz Bustos', '5.432.109-0', '098 491 501', 'paz.b@gmail.com', 'SAPE134', 'LV', NULL, 'Liceo 55 Montevideo', '2025-04-02', false, false, false, 'Publico', NULL, 'Agosto 2025', 'Contactado', 'Becas deportivas', NOW(), NOW()),
('Violeta Ojeda', '3.321.098-1', '097 511 521', 'violeta.o@gmail.com', 'SAPE135', 'YN', NULL, 'Colegio Monseñor Lasagna', '2025-05-10', false, false, false, 'Privado', NULL, 'Agosto 2025', 'Contactado', 'Info por mail', NOW(), NOW()),

-- Grupo 6: No Interesado (15)
('Santiago Fernández', '5.210.987-8', '098 531 541', NULL, NULL, 'LD', NULL, 'Liceo 56 Montevideo', '2026-01-08', false, false, false, 'Publico', NULL, 'Marzo 2026', 'No interesado', 'Decidió otra universidad', NOW(), NOW()),
('Facundo Romero', '3.109.876-9', '097 551 561', NULL, NULL, 'LG', NULL, 'Colegio Don Bosco', '2026-01-20', false, false, false, 'Privado', NULL, 'Marzo 2026', 'No interesado', 'Prefiere técnica', NOW(), NOW()),
('Bianca Molina', '4.098.765-0', '099 571 581', NULL, NULL, 'VD', NULL, 'Liceo Flores', '2026-02-17', false, false, false, 'Interior', NULL, 'Agosto 2026', 'No interesado', 'Quiere estudiar medicina', NOW(), NOW()),
('Luna Arce', '5.987.654-1', '098 591 601', NULL, NULL, 'VD', NULL, 'Liceo 57 Montevideo', '2025-03-15', false, false, false, 'Publico', NULL, 'Agosto 2025', 'No interesado', 'Se va al exterior', NOW(), NOW()),
('Tobías Pinto', '3.876.543-2', '097 611 621', NULL, NULL, 'UI', NULL, 'Colegio Preuniversitario', '2025-04-16', false, false, false, 'Privado', NULL, 'Agosto 2025', 'No interesado', 'Prefiere UTU', NOW(), NOW()),
('Augusto Salinas', '4.765.432-3', '099 631 641', NULL, NULL, 'LG', NULL, 'Liceo Cerro Largo', '2025-05-12', false, false, false, 'Interior', NULL, 'Agosto 2025', 'No interesado', 'Carrera diferente', NOW(), NOW()),
('Celeste Mora', '5.654.321-4', '098 651 661', NULL, NULL, 'VD', NULL, 'Liceo 58 Montevideo', '2025-06-13', false, false, false, 'Publico', NULL, 'Agosto 2025', 'No interesado', 'Elige UdelaR', NOW(), NOW()),
('Ramiro Ledesma', '3.543.210-5', '097 671 681', NULL, NULL, 'LG', NULL, 'Colegio San Felipe', '2025-07-11', false, false, false, 'Privado', NULL, 'Marzo 2026', 'No interesado', 'No le interesa más', NOW(), NOW()),
('Abril Ramos', '4.432.109-6', '099 691 701', NULL, NULL, 'VD', NULL, 'Liceo Soriano', '2025-09-14', false, false, false, 'Interior', NULL, 'Marzo 2026', 'No interesado', 'No estudia este año', NOW(), NOW()),
('Josefina Cárdenas', '5.321.098-7', '098 711 721', NULL, NULL, 'VD', NULL, 'Liceo 59 Montevideo', '2025-10-13', false, false, false, 'Publico', NULL, 'Marzo 2026', 'No interesado', 'Otra carrera', NOW(), NOW()),
('Sebastián Almada', '3.210.987-8', '097 731 741', NULL, NULL, 'UI', NULL, 'Colegio Juan XXIII', '2025-12-15', false, false, false, 'Privado', NULL, 'Marzo 2026', 'No interesado', 'Eligió Udelar', NOW(), NOW()),
('Marcos Iraola', '4.109.876-9', '099 751 761', NULL, NULL, 'UI', NULL, 'Liceo Rivera', '2025-08-15', false, false, false, 'Interior', NULL, 'Marzo 2026', 'No interesado', 'Ingeniería UdelaR', NOW(), NOW()),
('Mauro Quiroga', '5.098.765-0', '098 771 781', NULL, NULL, 'WE', NULL, 'Liceo 60 Montevideo', '2025-11-19', false, false, false, 'Publico', NULL, 'Marzo 2026', 'No interesado', 'No aplica', NOW(), NOW()),
('Celeste Ximenes', '3.987.654-1', '097 791 801', NULL, NULL, 'VD', NULL, 'Colegio San Andrés', '2025-04-05', false, false, false, 'Privado', NULL, 'Agosto 2025', 'No interesado', 'Otra carrera', NOW(), NOW()),
('Emma Darnauchans', '4.876.543-2', '099 811 821', NULL, NULL, 'GF', NULL, 'Liceo Pan de Azúcar', '2025-05-28', false, false, false, 'Interior', NULL, 'Agosto 2025', 'No interesado', 'Otra universidad', NOW(), NOW());


-- ============================================================
-- PASO 4: INSERTAR RASES (80 registros)
-- Vinculadas a oportunidades con ras_agendada = true
-- ============================================================
INSERT INTO rases (opp_id, titulo, nombre_interesado, agente_nombre, fecha_hora, modalidad, carrera, estado_oportunidad, created_at, updated_at)
SELECT
  o.opp_id,
  'Reunión de Asesoramiento - ' || o.nombre || ' - ' ||
    CASE (ROW_NUMBER() OVER (ORDER BY o.created_at) % 11)
      WHEN 0 THEN 'Natalia Benarducci'
      WHEN 1 THEN 'Mariana Muzi'
      WHEN 2 THEN 'Bruno Arce'
      WHEN 3 THEN 'Diego Miranda'
      WHEN 4 THEN 'Alejandro Erramun'
      WHEN 5 THEN 'Lucia Nazur'
      WHEN 6 THEN 'Fabian Barros'
      WHEN 7 THEN 'Maria Podesta'
      WHEN 8 THEN 'Fernanda Nuñez'
      WHEN 9 THEN 'Pablo Pirotto'
      WHEN 10 THEN 'Daniel Dominguez'
    END,
  o.nombre,
  CASE (ROW_NUMBER() OVER (ORDER BY o.created_at) % 11)
    WHEN 0 THEN 'Natalia Benarducci'
    WHEN 1 THEN 'Mariana Muzi'
    WHEN 2 THEN 'Bruno Arce'
    WHEN 3 THEN 'Diego Miranda'
    WHEN 4 THEN 'Alejandro Erramun'
    WHEN 5 THEN 'Lucia Nazur'
    WHEN 6 THEN 'Fabian Barros'
    WHEN 7 THEN 'Maria Podesta'
    WHEN 8 THEN 'Fernanda Nuñez'
    WHEN 9 THEN 'Pablo Pirotto'
    WHEN 10 THEN 'Daniel Dominguez'
  END,
  o.fecha_lead::timestamp + INTERVAL '7 days' + (RANDOM() * INTERVAL '14 days'),
  CASE WHEN RANDOM() > 0.4 THEN 'Presencial' ELSE 'En línea' END,
  o.carrera_interes,
  o.proceso_inicio,
  NOW(),
  NOW()
FROM oportunidades o
WHERE o.ras_agendada = true
  AND o.deleted_at IS NULL
ORDER BY o.created_at;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'leads' AS tabla, COUNT(*) AS total FROM leads WHERE deleted_at IS NULL
UNION ALL
SELECT 'oportunidades', COUNT(*) FROM oportunidades WHERE deleted_at IS NULL
UNION ALL
SELECT 'rases', COUNT(*) FROM rases WHERE deleted_at IS NULL;
