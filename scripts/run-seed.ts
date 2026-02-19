import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Leer variables desde .env.local
const envPath = resolve(import.meta.dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx > 0) env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

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

const LICEOS = [
  'Liceo 1 Montevideo', 'Liceo 2 Montevideo', 'Liceo 3 Montevideo', 'Liceo 4 Montevideo',
  'Liceo 5 Montevideo', 'Liceo 6 Montevideo', 'Liceo 7 Montevideo', 'Liceo 8 Montevideo',
  'Liceo 9 Montevideo', 'Liceo 10 Montevideo', 'Liceo 11 Montevideo', 'Liceo 12 Montevideo',
  'Liceo 13 Montevideo', 'Liceo 14 Montevideo', 'Liceo 15 Montevideo', 'Liceo 16 Montevideo',
  'Colegio Santa María', 'Colegio Crandon', 'Colegio San José', 'British Schools',
  'Colegio Sagrado Corazón', 'Colegio Pallotti', 'Colegio Seminario', 'Colegio Elbio Fernández',
  'Liceo Rivera', 'Liceo Salto', 'Liceo Paysandú', 'Liceo Maldonado',
  'Liceo Tacuarembó', 'Liceo Colonia', 'Liceo Florida', 'Liceo Durazno',
  'Liceo Mercedes', 'Liceo Canelones', 'Liceo Minas', 'Liceo Rocha',
];

const COMENTARIOS_LEAD = [
  'Interesado en conocer plan de estudios', 'Pidió información de becas',
  'Muy motivado, viene de liceo público', 'Decidió ir a otra universidad',
  'Estaba ocupado, llamar la semana que viene', 'Quiere visitar el campus',
  'Preguntó por horarios nocturnos', 'Dejó datos en formulario web',
  'El número no corresponde', 'Interesado pero evaluando opciones',
  'Viene del interior, necesita info de residencias', 'Contacto por Instagram',
  'Madre llamó por él/ella', 'En período de exámenes',
  'Quiere agendar visita con padres', 'Pidió folleto digital',
  'Viene de feria educativa', 'Muy entusiasmado con la carrera',
  'Consultó sobre financiamiento', 'Formulario web - charla informativa',
  'Llamó interesado por recomendación', 'Quiere info detallada del plan',
  'No pudo atender, está trabajando', 'Contacto por referido',
  'Interesada, pidió reunión', 'Muy interesado en lab de tecnología',
  'Pidió información sobre pasantías', 'Referido por ex alumno',
  'Contacto por WhatsApp Business', 'Open House',
];

const COMENTARIOS_OPP: Record<string, string[]> = {
  'Inscripto': ['Alumno inscripto exitosamente', 'Inscripto con beca parcial', 'Proceso exitoso', 'Inscripto, pago al día', 'Contento con la elección', 'Familia muy comprometida', 'Excelente perfil académico'],
  'Promesa de Inscripción': ['Prometió inscribirse en enero', 'Esperando confirmación de beca', 'Decidida, falta papeleo', 'Esperando resultado examen final', 'Prometió inscripción para febrero', 'Padres dieron el OK', 'Esperando transferencia de pago', 'Proceso casi completo'],
  'Evaluando': ['Evaluando entre ORT y UCU', 'Evaluando carrera', 'Evaluando mudanza a Montevideo', 'Evaluando opciones', 'Evaluando con la familia', 'Conoció docentes, evaluando', 'Quiere visitar sede antes', 'Evaluando beca'],
  'Interesado': ['Interesado en la carrera', 'Pidió info por mail', 'Evento presencial', 'Contacto espontáneo', 'Stand en Expo', 'Campaña redes sociales', 'Info completa enviada', 'Referido por coordinador'],
  'Contactado': ['Madre llamó por ella', 'Evaluando ORT vs otra opción', 'Pidió folleto digital', 'Evaluando opciones', 'Consultó financiamiento', 'Dudando entre carreras', 'Info de carreras', 'Evaluando presencial vs online'],
  'No interesado': ['Decidió otra universidad', 'Prefiere carrera técnica', 'Quiere estudiar medicina', 'Se va al exterior', 'Prefiere UTU', 'Eligió otra carrera', 'Elige UdelaR', 'No estudia este año'],
};

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

function randomSAPE(i: number): number {
  return 100000 + i;
}

// ==================== DELETE ALL ====================

async function deleteAll() {
  console.log('🗑️  Eliminando datos existentes...');

  // Fetch and delete rases
  const { data: allRases } = await supabase.from('rases').select('ras_id');
  if (allRases && allRases.length > 0) {
    for (let i = 0; i < allRases.length; i += 100) {
      const ids = allRases.slice(i, i + 100).map(r => r.ras_id);
      const { error } = await supabase.from('rases').delete().in('ras_id', ids);
      if (error) console.error('Error deleting rases:', error.message);
    }
    console.log(`   Eliminadas ${allRases.length} rases`);
  } else {
    console.log('   No había rases');
  }

  // Fetch and delete oportunidades
  const { data: allOpps } = await supabase.from('oportunidades').select('opp_id');
  if (allOpps && allOpps.length > 0) {
    for (let i = 0; i < allOpps.length; i += 100) {
      const ids = allOpps.slice(i, i + 100).map(o => o.opp_id);
      const { error } = await supabase.from('oportunidades').delete().in('opp_id', ids);
      if (error) console.error('Error deleting opps:', error.message);
    }
    console.log(`   Eliminadas ${allOpps.length} oportunidades`);
  } else {
    console.log('   No había oportunidades');
  }

  // Fetch and delete leads
  const { data: allLeads } = await supabase.from('leads').select('lead_id');
  if (allLeads && allLeads.length > 0) {
    for (let i = 0; i < allLeads.length; i += 100) {
      const ids = allLeads.slice(i, i + 100).map(l => l.lead_id);
      const { error } = await supabase.from('leads').delete().in('lead_id', ids);
      if (error) console.error('Error deleting leads:', error.message);
    }
    console.log(`   Eliminados ${allLeads.length} leads`);
  } else {
    console.log('   No había leads');
  }

  console.log('✅ Datos eliminados.\n');
}

// ==================== SEED LEADS ====================

async function seedLeads() {
  const count = 200;
  console.log(`📋 Insertando ${count} leads...`);
  const leads: any[] = [];

  for (let i = 0; i < count; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const resultado = pick(RESULTADOS);
    const isConvertido = ['Contactado', 'Interesado'].includes(resultado) && Math.random() > 0.4;

    leads.push({
      nombre,
      carrera_interes: pick(CARRERAS),
      fecha_lead: randomDate('2025-03-01', '2026-02-18'),
      resultado_llamada: resultado,
      horario_llamada: resultado === 'Número Incorrecto' ? null : pick(HORARIOS),
      intentos_llamado: Math.floor(1 + Math.random() * 3),
      comentario: pick(COMENTARIOS_LEAD),
      owner: null,
      convertido: isConvertido,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  let inserted = 0;
  for (let i = 0; i < leads.length; i += 50) {
    const batch = leads.slice(i, i + 50);
    const { error } = await supabase.from('leads').insert(batch);
    if (error) {
      console.error(`   ❌ Error batch ${i}: ${error.message}`);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`   ${inserted}/${count}\r`);
  }
  console.log(`✅ ${count} leads insertados.                \n`);
}

// ==================== SEED OPORTUNIDADES ====================

async function seedOportunidades() {
  const count = 150;
  console.log(`🎯 Insertando ${count} oportunidades...`);
  const opps: any[] = [];

  // Distribución realista del pipeline
  const fasePool: string[] = [];
  const distribution: [string, number][] = [
    ['Inscripto', 30],
    ['Promesa de Inscripción', 25],
    ['Evaluando', 30],
    ['Interesado', 30],
    ['Contactado', 20],
    ['No interesado', 15],
  ];
  for (const [fase, qty] of distribution) {
    for (let j = 0; j < qty; j++) fasePool.push(fase);
  }

  for (let i = 0; i < count; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const fase = fasePool[i % fasePool.length];
    const hasRAS = fase === 'Inscripto' || fase === 'Promesa de Inscripción' || (fase === 'Evaluando' && Math.random() > 0.3);
    const rasAsistio = hasRAS && (fase === 'Inscripto' || fase === 'Promesa de Inscripción' || Math.random() > 0.4);
    const isNoInteresado = fase === 'No interesado';
    const firstName = nombre.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lastInitial = (nombre.split(' ')[1] || 'x')[0].toLowerCase();

    opps.push({
      nombre,
      cedula: isNoInteresado ? null : randomCI(),
      telefono: randomPhone(),
      mail: isNoInteresado ? null : `${firstName}.${lastInitial}@gmail.com`,
      sape: isNoInteresado ? null : randomSAPE(i + 1),
      carrera_interes: pick(CARRERAS),
      otros_intereses: Math.random() > 0.85 ? [pick(CARRERAS)] : null,
      liceo: pick(LICEOS),
      fecha_lead: randomDate('2025-03-01', '2026-02-18'),
      ras_agendada: hasRAS,
      ras_asistio: rasAsistio,
      multiple_interes: Math.random() > 0.85,
      liceo_tipo: pick(LICEO_TIPOS),
      ras_hecha_por: null,
      proceso_inicio: pick(PROCESOS),
      fase_oportunidad: fase,
      comentario_extra: pick(COMENTARIOS_OPP[fase] || ['Seguimiento']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  let inserted = 0;
  for (let i = 0; i < opps.length; i += 50) {
    const batch = opps.slice(i, i + 50);
    const { error } = await supabase.from('oportunidades').insert(batch);
    if (error) {
      console.error(`   ❌ Error batch ${i}: ${error.message}`);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`   ${inserted}/${count}\r`);
  }
  console.log(`✅ ${count} oportunidades insertadas.       \n`);
}

// ==================== SEED RASES ====================

async function seedRases() {
  console.log('📅 Generando RASES desde oportunidades con RAS agendada...');

  const { data: opps, error: fetchError } = await supabase
    .from('oportunidades')
    .select('*')
    .eq('ras_agendada', true)
    .is('deleted_at', null);

  if (fetchError) {
    console.error('   ❌ Error obteniendo opps:', fetchError.message);
    throw fetchError;
  }
  if (!opps || opps.length === 0) {
    console.log('   No hay oportunidades con RAS agendada.');
    return;
  }

  const rases = opps.map((o: any, i: number) => {
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

  let inserted = 0;
  for (let i = 0; i < rases.length; i += 50) {
    const batch = rases.slice(i, i + 50);
    const { error } = await supabase.from('rases').insert(batch);
    if (error) {
      console.error(`   ❌ Error batch ${i}: ${error.message}`);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`   ${inserted}/${rases.length}\r`);
  }
  console.log(`✅ ${rases.length} RASES insertadas.          \n`);
}

// ==================== MAIN ====================

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('   SEED - CRM Admisiones ORT');
  console.log('═══════════════════════════════════════════\n');

  const start = Date.now();

  await deleteAll();
  await seedLeads();
  await seedOportunidades();
  await seedRases();

  // Verificación final
  const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
  const { count: oppCount } = await supabase.from('oportunidades').select('*', { count: 'exact', head: true });
  const { count: rasCount } = await supabase.from('rases').select('*', { count: 'exact', head: true });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('═══════════════════════════════════════════');
  console.log('   RESUMEN');
  console.log('═══════════════════════════════════════════');
  console.log(`   Leads:          ${leadCount}`);
  console.log(`   Oportunidades:  ${oppCount}`);
  console.log(`   RASES:          ${rasCount}`);
  console.log(`   Tiempo:         ${elapsed}s`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
