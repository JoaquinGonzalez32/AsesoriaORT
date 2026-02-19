/**
 * Script de carga masiva ejecutable desde la consola del navegador.
 *
 * USO:
 * 1. Abrí la app en el navegador
 * 2. Abrí la consola (F12 > Console)
 * 3. Copiá y pegá este archivo completo
 * 4. Ejecutá: await seedAll()
 *
 * Esto eliminará todos los datos existentes y cargará datos nuevos.
 */

import { createClient } from '@supabase/supabase-js';

// Usar las mismas variables de entorno que la app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== DATOS ====================

const CARRERAS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];
const RESULTADOS = ['1er Contacto', 'Contactado', 'No interesado', 'Interesado', 'Número Incorrecto', 'Llamar más tarde'];
const HORARIOS = ['Mañana', 'Tarde', 'Noche'];
const FASES = ['Interesado', 'Evaluando', 'No interesado', 'Contactado', 'Promesa de Inscripción', 'Inscripto'];
const LICEO_TIPOS = ['Publico', 'Privado', 'Interior'];
const MODALIDADES = ['Presencial', 'En línea'];
const PROCESOS = ['Marzo 2025', 'Agosto 2025', 'Marzo 2026', 'Agosto 2026'];
const AGENTES = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucia Nazur', 'Fabian Barros', 'Maria Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez'
];

const NOMBRES = [
  'Valentina García', 'Martín López', 'Camila Rodríguez', 'Santiago Fernández',
  'Lucía Martínez', 'Mateo González', 'Isabella Pérez', 'Joaquín Sánchez',
  'Sofía Ramírez', 'Nicolás Torres', 'Florencia Díaz', 'Tomás Álvarez',
  'Emilia Ruiz', 'Agustín Acosta', 'Martina Castro', 'Facundo Romero',
  'Victoria Silva', 'Lautaro Méndez', 'Catalina Flores', 'Bautista Herrera',
  'Renata Morales', 'Thiago Vargas', 'Antonella Giménez', 'Felipe Medina',
  'Alma Benítez', 'Benjamín Ríos', 'Delfina Suárez', 'Santino Luna',
  'Olivia Aguirre', 'Máximo Cabrera', 'Clara Gutiérrez', 'Lorenzo Navarro',
  'Emma Rojas', 'Ian Domínguez', 'Mía Peralta', 'Ciro Figueroa',
  'Bianca Molina', 'Gael Ortega', 'Ambar Sosa', 'Bruno Vega',
  'Pilar Acuña', 'Dante Correa', 'Jazmín Paredes', 'Rafael Ibarra',
  'Zoe Pereira', 'Elías Núñez', 'Luna Arce', 'Simón Cardozo',
  'Aurora Vera', 'León Duarte', 'Paz Bustos', 'Matías Ponce',
  'Renata Cáceres', 'Ignacio Leiva', 'Alma Velázquez', 'Franco Rivas',
  'Nina Delgado', 'Tobías Pinto', 'Abril Lagos', 'Dylan Espinoza',
  'Milagros Bravo', 'Lucas Quiroga', 'Candelaria Soto', 'Gonzalo Maldonado',
  'Violeta Ojeda', 'Augusto Salinas', 'Serena Miranda', 'Hugo Montiel',
  'Elena Villalba', 'Adrián Costa', 'Julia Cabral', 'Emiliano Otero',
  'Lola Pacheco', 'Pedro Salas', 'Amanda Arias', 'Rodrigo Blanco',
  'Celeste Mora', 'Ezequiel Paz', 'Mikaela Rey', 'Lisandro Franco',
  'Romina Escalante', 'Kevin Estrada', 'Agustina Campos', 'Axel Guzmán',
  'Candela Heredia', 'Ramiro Ledesma', 'Maite Pereyra', 'Iván Robledo',
  'Rocío Sandoval', 'Enzo Valdez', 'Daniela Berón', 'Maximiliano Godoy',
  'Julieta Coronel', 'Alan Escobar', 'Milagros Funes', 'Cristian Garay',
  'Tamara Herrera', 'Marcos Iraola', 'Priscila Juárez', 'Gastón Klein',
  'Carolina Leguizamón', 'Federico Mansilla', 'Valentina Neira', 'Esteban Olmos',
  'Guadalupe Pintos', 'Diego Quintana', 'Abril Ramos', 'Marcos Solano',
  'Constanza Toledo', 'Andrés Urrutia', 'Regina Vázquez', 'Pablo Wainstein',
  'Sofía Yamamoto', 'Tomás Zárate', 'Micaela Agüero', 'Fernando Barrios',
  'Josefina Cárdenas', 'Alejo Dutra', 'Mora Echeverría', 'Leandro Ferreyra',
  'Luciana Greco', 'Nahuel Iglesias', 'Camila Jara', 'Samuel Kramer',
  'Danna León', 'Tadeo Mansur', 'Sol Navas', 'Lucas Oviedo',
  'Valentina Prado', 'Mauro Quiroga', 'Agostina Roldán', 'Julián Salas',
  'Paloma Testa', 'Diego Uriarte', 'Camila Vidal', 'Martín Yáñez',
  'Florencia Zúñiga', 'Sebastián Almada', 'María Bustamante', 'Germán Castaño',
  'Ana Paula Silveira', 'Sebastián Melo', 'Camila Invernizzi', 'Facundo Techera',
  'Micaela Borges', 'Rodrigo Umpiérrez', 'Valentina Svirsky', 'Matías Piñeiro',
  'Lucía Teixeira', 'Tomás Bentancor', 'Isabella Noblía', 'Nicolás Strauch',
  'Martina Abal', 'Lautaro Brum', 'Sofía De León', 'Santiago Caorsi',
  'Emma Darnauchans', 'Joaquín Facello', 'Lucía Grompone', 'Mateo Hareau',
  'Pilar Irazábal', 'Dante Kechichian', 'Jazmín Larrosa', 'Rafael Magnone',
  'Zoe Negrín', 'Elías Olivera', 'Luna Puppo', 'Simón Ravera',
  'Aurora Stagnaro', 'León Tejera', 'Paz Umpiérrez', 'Matías Viera',
  'Renata Zaffaroni', 'Ignacio Aguiar', 'Alma Bermúdez', 'Franco Chiappara',
  'Nina Doglio', 'Tobías Echevarría', 'Abril Ferreira', 'Dylan Gadea',
  'Milagros Hernández', 'Lucas Iraeta', 'Candelaria Jauregui', 'Gonzalo Kotsias',
  'Violeta Legnani', 'Augusto Mautone', 'Serena Nario', 'Hugo Oxandabarat',
  'Elena Pastorino', 'Adrián Quartucci', 'Julia Raviolo', 'Emiliano Saravia',
  'Lola Tartaglia', 'Pedro Urruzola', 'Amanda Veloso', 'Rodrigo Wonsiak',
  'Celeste Ximenes', 'Ezequiel Yafalián', 'Mikaela Zorrilla', 'Lisandro Acuña',
];

const COMENTARIOS_LEAD = [
  'Interesado en conocer plan de estudios',
  'Pidió información de becas',
  'Muy motivado, viene de liceo público',
  'Decidió ir a otra universidad',
  'Estaba ocupado, llamar la semana que viene',
  'Quiere visitar el campus',
  'Preguntó por horarios nocturnos',
  'Dejó datos en formulario web',
  'El número no corresponde',
  'Interesado pero evaluando opciones',
  'Viene del interior, necesita info de residencias',
  'Contacto por Instagram',
  'Madre llamó por él/ella',
  'En período de exámenes',
  'Quiere agendar visita con padres',
  'Prefiere carrera técnica',
  'Pidió folleto digital',
  'Viene de feria educativa',
  'Muy entusiasmado con la carrera',
  'Consultó sobre financiamiento',
  'Formulario web - charla informativa',
  'Llamó interesado por recomendación',
  'Quiere info detallada del plan',
  'No pudo atender, está trabajando',
  'Contacto por referido',
  'Ya se inscribió en otra universidad',
  'Interesada, pidió reunión',
  'Muy interesado en lab de tecnología',
  'Buzón de voz, no se puede contactar',
  'Pidió información sobre pasantías',
];

// ==================== HELPERS ====================

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random() * (e - s)).toISOString().split('T')[0];
}

function randomCI(): string {
  const n = Math.floor(1000000 + Math.random() * 9000000);
  const s = n.toString();
  return `${s[0]}.${s.slice(1, 4)}.${s.slice(4)}-${Math.floor(Math.random() * 10)}`;
}

function randomPhone(): string {
  const prefix = pick(['099', '098', '097']);
  const n1 = String(Math.floor(100 + Math.random() * 900));
  const n2 = String(Math.floor(100 + Math.random() * 900));
  return `${prefix} ${n1} ${n2}`;
}

function randomSAPE(i: number): string {
  return `SAPE${String(i).padStart(3, '0')}`;
}

// ==================== SEED FUNCTIONS ====================

async function deleteAll() {
  console.log('Eliminando datos existentes...');
  await supabase.from('rases').delete().neq('ras_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('oportunidades').delete().neq('opp_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leads').delete().neq('lead_id', '00000000-0000-0000-0000-000000000000');
  console.log('Datos eliminados.');
}

async function seedLeads(count = 200) {
  console.log(`Insertando ${count} leads...`);
  const leads = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let nombre = NOMBRES[i % NOMBRES.length];
    if (usedNames.has(nombre)) {
      nombre = nombre + ' ' + (i + 1);
    }
    usedNames.add(nombre);

    const resultado = pick(RESULTADOS);
    leads.push({
      nombre,
      carrera_interes: pick(CARRERAS),
      fecha_lead: randomDate('2025-03-01', '2026-02-18'),
      resultado_llamada: resultado,
      horario_llamada: resultado === 'Número Incorrecto' ? null : pick(HORARIOS),
      intentos_llamado: Math.floor(1 + Math.random() * 3),
      comentario: pick(COMENTARIOS_LEAD),
      owner: null,
      convertido: Math.random() > 0.55,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Insertar en batches de 50
  for (let i = 0; i < leads.length; i += 50) {
    const batch = leads.slice(i, i + 50);
    const { error } = await supabase.from('leads').insert(batch);
    if (error) {
      console.error(`Error insertando leads batch ${i}:`, error);
      throw error;
    }
  }
  console.log(`${count} leads insertados.`);
}

async function seedOportunidades(count = 150) {
  console.log(`Insertando ${count} oportunidades...`);
  const opps = [];

  const faseDistribution = [
    ...Array(30).fill('Inscripto'),
    ...Array(25).fill('Promesa de Inscripción'),
    ...Array(30).fill('Evaluando'),
    ...Array(30).fill('Interesado'),
    ...Array(20).fill('Contactado'),
    ...Array(15).fill('No interesado'),
  ];

  for (let i = 0; i < count; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const fase = faseDistribution[i % faseDistribution.length];
    const hasRAS = fase === 'Inscripto' || fase === 'Promesa de Inscripción' || (fase === 'Evaluando' && Math.random() > 0.3);
    const rasAsistio = hasRAS && (fase === 'Inscripto' || fase === 'Promesa de Inscripción' || Math.random() > 0.4);
    const isNoInteresado = fase === 'No interesado';

    opps.push({
      nombre,
      cedula: isNoInteresado ? null : randomCI(),
      telefono: randomPhone(),
      mail: isNoInteresado ? null : `${nombre.split(' ')[0].toLowerCase()}.${nombre.split(' ')[1]?.toLowerCase()?.charAt(0) || 'x'}@gmail.com`,
      sape: isNoInteresado ? null : randomSAPE(i + 1),
      carrera_interes: pick(CARRERAS),
      otros_intereses: Math.random() > 0.85 ? JSON.stringify([pick(CARRERAS)]) : null,
      liceo: `Liceo ${Math.floor(1 + Math.random() * 60)} Montevideo`,
      fecha_lead: randomDate('2025-03-01', '2026-02-18'),
      ras_agendada: hasRAS,
      ras_asistio: rasAsistio,
      multiple_interes: Math.random() > 0.85,
      liceo_tipo: pick(LICEO_TIPOS),
      ras_hecha_por: null,
      proceso_inicio: pick(PROCESOS),
      fase_oportunidad: fase,
      comentario_extra: `Seguimiento de ${nombre} - ${fase}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  for (let i = 0; i < opps.length; i += 50) {
    const batch = opps.slice(i, i + 50);
    const { error } = await supabase.from('oportunidades').insert(batch);
    if (error) {
      console.error(`Error insertando opps batch ${i}:`, error);
      throw error;
    }
  }
  console.log(`${count} oportunidades insertadas.`);
}

async function seedRases() {
  console.log('Insertando RASES desde oportunidades con RAS agendada...');

  const { data: opps, error: fetchError } = await supabase
    .from('oportunidades')
    .select('*')
    .eq('ras_agendada', true)
    .is('deleted_at', null);

  if (fetchError) { console.error('Error obteniendo opps:', fetchError); throw fetchError; }
  if (!opps || opps.length === 0) { console.log('No hay oportunidades con RAS agendada.'); return; }

  const rases = opps.map((o, i) => {
    const agente = AGENTES[i % AGENTES.length];
    const fechaBase = new Date(o.fecha_lead);
    fechaBase.setDate(fechaBase.getDate() + 7 + Math.floor(Math.random() * 14));

    return {
      opp_id: o.opp_id,
      titulo: `Reunión de Asesoramiento - ${o.nombre} - ${agente}`,
      nombre_interesado: o.nombre,
      agente_nombre: agente,
      fecha_hora: fechaBase.toISOString(),
      modalidad: pick(MODALIDADES),
      carrera: o.carrera_interes,
      estado_oportunidad: o.proceso_inicio,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  for (let i = 0; i < rases.length; i += 50) {
    const batch = rases.slice(i, i + 50);
    const { error } = await supabase.from('rases').insert(batch);
    if (error) {
      console.error(`Error insertando rases batch ${i}:`, error);
      throw error;
    }
  }
  console.log(`${rases.length} RASES insertadas.`);
}

// ==================== MAIN ====================

export async function seedAll() {
  const start = Date.now();
  try {
    await deleteAll();
    await seedLeads(200);
    await seedOportunidades(150);
    await seedRases();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\nSeed completado en ${elapsed}s`);
    console.log('Recargá la página para ver los datos nuevos.');
  } catch (err) {
    console.error('Error en seed:', err);
  }
}

// Para ejecutar directamente:
// seedAll();
