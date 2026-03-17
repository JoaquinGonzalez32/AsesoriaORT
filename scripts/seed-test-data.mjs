/**
 * Script para generar datos de prueba de Oportunidades y RASES.
 * Procesos: Marzo 2025 → Marzo 2027
 *
 * Ejecutar:  node scripts/seed-test-data.mjs
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qguyzucqelzjhuonkzsu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndXl6dWNxZWx6amh1b25renN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjUzOTgsImV4cCI6MjA4NTY0MTM5OH0.7-1YG7W_qux20gw-syBMA8X5SDkneOHEUN_R2YDhVyc'
);

// ─── Constantes ──────────────────────────────────────────────────────────────

const CARRERAS = ['LV', 'WY', 'LT', 'LD', 'YN', 'LG', 'VD', 'UI', 'GF', 'WE'];

const CARRERA_NOMBRE = {
  LV: 'Lic. Animación y Videojuegos',
  WY: 'Lic. Diseño de Modas',
  LT: 'Lic. Diseño, Arte y Tecnología',
  LD: 'Lic. Diseño Multimedia',
  YN: 'Lic. Diseño Industrial',
  LG: 'Lic. Diseño Gráfico',
  VD: 'Desarrollo y Producción de Videojuegos',
  UI: 'Diseño de Interfaces',
  GF: 'Diseñador Gráfico',
  WE: 'Diseñador Digital',
};

const FASES = [
  'Interesado', 'Evaluando', 'Contactado',
  'No interesado', 'Promesa de Inscripción', 'Inscripto',
];

const LICEO_TIPOS = ['Publico', 'Privado', 'Interior'];

const AGENTES = [
  'Natalia Benarducci', 'Mariana Muzi', 'Bruno Arce', 'Diego Miranda',
  'Alejandro Erramun', 'Lucia Nazur', 'Fabian Barros', 'Maria Podesta',
  'Fernanda Nuñez', 'Pablo Pirotto', 'Daniel Dominguez',
];

const MODALIDADES = ['Presencial', 'En línea'];
const RESULTADOS_RAS = ['Pendiente', 'Realizada', 'Frustrada', 'Cancelada'];

const PROCESOS = [
  'Marzo 2025', 'Agosto 2025',
  'Marzo 2026', 'Agosto 2026',
  'Marzo 2027',
];

// Distribución realista de fases por "antigüedad" del proceso
// Procesos más viejos → más avanzados; más nuevos → más tempranos
const FASE_WEIGHTS_OLD   = [0.05, 0.05, 0.10, 0.15, 0.30, 0.35]; // Marzo 2025
const FASE_WEIGHTS_MID   = [0.10, 0.15, 0.20, 0.15, 0.25, 0.15]; // Agosto 2025, Marzo 2026
const FASE_WEIGHTS_NEW   = [0.30, 0.25, 0.20, 0.10, 0.10, 0.05]; // Agosto 2026
const FASE_WEIGHTS_FRESH = [0.45, 0.25, 0.15, 0.05, 0.07, 0.03]; // Marzo 2027

function getFaseWeights(proceso) {
  if (proceso === 'Marzo 2025') return FASE_WEIGHTS_OLD;
  if (proceso === 'Agosto 2025' || proceso === 'Marzo 2026') return FASE_WEIGHTS_MID;
  if (proceso === 'Agosto 2026') return FASE_WEIGHTS_NEW;
  return FASE_WEIGHTS_FRESH;
}

// ─── Nombres realistas uruguayos ─────────────────────────────────────────────

const NOMBRES = [
  'Santiago', 'Valentina', 'Mateo', 'Camila', 'Martín', 'Lucía', 'Sebastián',
  'Isabella', 'Nicolás', 'Sofía', 'Tomás', 'Catalina', 'Juan', 'Agustina',
  'Diego', 'Florencia', 'Ignacio', 'Milagros', 'Joaquín', 'Micaela',
  'Federico', 'Antonella', 'Facundo', 'Pilar', 'Agustín', 'Victoria',
  'Emiliano', 'Martina', 'Rodrigo', 'Julieta', 'Bruno', 'Renata',
  'Maximiliano', 'Sol', 'Gonzalo', 'Mía', 'Lautaro', 'Paula', 'Matías',
  'Ana', 'Leandro', 'Clara', 'Marcos', 'Elena', 'Daniel', 'Natalia',
  'Pablo', 'Andrea', 'Germán', 'Carolina',
];

const APELLIDOS = [
  'González', 'Rodríguez', 'Martínez', 'López', 'Fernández', 'García',
  'Pérez', 'Silva', 'Díaz', 'Romero', 'Suárez', 'Torres', 'Núñez',
  'Álvarez', 'Morales', 'Vázquez', 'Acosta', 'Benítez', 'Cardozo',
  'Ramos', 'Sosa', 'Pereira', 'Castro', 'Méndez', 'Rivero', 'Giménez',
  'Cabrera', 'Alonso', 'Olivera', 'Ferreira', 'Hernández', 'Duarte',
  'Medina', 'Techera', 'Costa', 'Viera', 'Pereyra', 'De León',
  'Moreira', 'Santos',
];

const LICEOS = [
  'Liceo Nº 1 Montevideo', 'Liceo Nº 2 Héctor Miranda', 'Liceo Nº 3 Dámaso A. Larrañaga',
  'Liceo Nº 7 Joaquín Suárez', 'Liceo Nº 10 Carlos Vaz Ferreira',
  'Colegio Stella Maris', 'Instituto Crandon', 'Colegio Jesús María',
  'Liceo Militar', 'Colegio Seminario', 'British Schools',
  'Liceo Nº 1 Salto', 'Liceo Nº 1 Paysandú', 'Liceo Nº 1 Maldonado',
  'Liceo Nº 1 Rivera', 'Liceo Nº 1 Tacuarembó', 'Liceo Nº 1 Colonia',
  'Instituto Preuniversitario', 'Colegio Pío IX', 'Colegio San Juan Bautista',
  'Liceo IAVA', 'Liceo Bauzá', 'Liceo Zorrilla', 'Colegio Pallotti',
  'Liceo Nº 35 Montevideo', 'Liceo Nº 50 Montevideo',
  'Liceo Nº 1 Canelones', 'Liceo Nº 1 Florida', 'Liceo Nº 1 Durazno',
  'Instituto Técnico Superior',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function weightedPick(items, weights) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}

function randomDate(startStr, endStr) {
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  return new Date(start + Math.random() * (end - start));
}

function isoDate(d) { return d.toISOString().slice(0, 10); }

function randomPhone() {
  const prefix = pick(['091', '092', '093', '094', '095', '096', '097', '098', '099']);
  const num = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return prefix + num;
}

function randomCedula() {
  return String(Math.floor(10000000 + Math.random() * 89999999));
}

function randomSape() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomEmail(nombre, apellido) {
  const clean = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  return `${clean(nombre)}.${clean(apellido)}${Math.floor(Math.random() * 99)}@${pick(domains)}`;
}

// Rango de fecha_lead según el proceso
function dateRangeForProceso(proceso) {
  const [mes, anio] = proceso.split(' ');
  const y = parseInt(anio);
  if (mes === 'Marzo') {
    // captación: sept año anterior → marzo año
    return [`${y - 1}-09-01`, `${y}-03-31`];
  } else {
    // captación: marzo → agosto
    return [`${y}-03-01`, `${y}-08-31`];
  }
}

// RAS scheduling range (un poco después del lead)
function rasDateRange(proceso) {
  const [mes, anio] = proceso.split(' ');
  const y = parseInt(anio);
  if (mes === 'Marzo') {
    return [`${y - 1}-10-01`, `${y}-03-15`];
  } else {
    return [`${y}-04-01`, `${y}-08-15`];
  }
}

function randomTimeSlot() {
  const hour = 8 + Math.floor(Math.random() * 10); // 8:00 - 17:30
  const min = pick(['00', '30']);
  return `${String(hour).padStart(2, '0')}:${min}:00`;
}

// ─── Generación de datos ─────────────────────────────────────────────────────

const OPP_COUNT_PER_PROCESO = {
  'Marzo 2025': 60,
  'Agosto 2025': 50,
  'Marzo 2026': 70,
  'Agosto 2026': 45,
  'Marzo 2027': 35,
};

function generateOportunidades() {
  const opps = [];

  for (const proceso of PROCESOS) {
    const count = OPP_COUNT_PER_PROCESO[proceso];
    const [dStart, dEnd] = dateRangeForProceso(proceso);
    const faseWeights = getFaseWeights(proceso);

    for (let i = 0; i < count; i++) {
      const nombre = pick(NOMBRES);
      const apellido = pick(APELLIDOS);
      const fullName = `${nombre} ${apellido}`;
      const carrera = pick(CARRERAS);
      const fase = weightedPick(FASES, faseWeights);
      const liceo = pick(LICEOS);
      const liceoTipo = liceo.startsWith('Colegio') || liceo.startsWith('British') || liceo.startsWith('Instituto')
        ? 'Privado'
        : liceo.includes('Salto') || liceo.includes('Paysandú') || liceo.includes('Maldonado') ||
          liceo.includes('Rivera') || liceo.includes('Tacuarembó') || liceo.includes('Colonia') ||
          liceo.includes('Canelones') || liceo.includes('Florida') || liceo.includes('Durazno')
          ? 'Interior'
          : 'Publico';

      const fechaLead = isoDate(randomDate(dStart, dEnd));

      // Si la fase es avanzada, más chance de tener RAS
      const esAvanzada = ['Promesa de Inscripción', 'Inscripto', 'Evaluando'].includes(fase);
      const rasAgendada = esAvanzada ? Math.random() < 0.8 : Math.random() < 0.25;

      // Algunos tienen SAPE (más frecuente en fases avanzadas)
      const hasSape = esAvanzada ? Math.random() < 0.7 : Math.random() < 0.15;

      // Nombre de trato estilo Zoho
      const nombreTrato = `${fullName} - ${CARRERA_NOMBRE[carrera]}`;

      // Múltiple interés ~15%
      const multipleInteres = Math.random() < 0.15;
      let otrosIntereses = null;
      if (multipleInteres) {
        const other = CARRERAS.filter(c => c !== carrera);
        const count2 = 1 + Math.floor(Math.random() * 2);
        otrosIntereses = [];
        for (let j = 0; j < count2; j++) {
          const oi = pick(other.filter(c => !otrosIntereses.includes(c)));
          if (oi) otrosIntereses.push(oi);
        }
      }

      opps.push({
        nombre: fullName,
        nombre_trato: nombreTrato,
        cedula: Math.random() < 0.6 ? randomCedula() : null,
        telefono: Math.random() < 0.85 ? randomPhone() : null,
        mail: Math.random() < 0.7 ? randomEmail(nombre, apellido) : null,
        sape: hasSape ? randomSape() : null,
        carrera_interes: carrera,
        otros_intereses: otrosIntereses,
        liceo,
        fecha_lead: fechaLead,
        ras_agendada: rasAgendada,
        multiple_interes: multipleInteres,
        liceo_tipo: liceoTipo,
        proceso_inicio: proceso,
        fase_oportunidad: fase,
        comentario_extra: null,
      });
    }
  }

  return opps;
}

function generateRases(insertedOpps, userId) {
  const rases = [];

  for (const opp of insertedOpps) {
    if (!opp.ras_agendada) continue;

    const [rStart, rEnd] = rasDateRange(opp.proceso_inicio);
    const fechaRas = randomDate(rStart, rEnd);
    const fechaHora = `${isoDate(fechaRas)}T${randomTimeSlot()}`;

    const agente = pick(AGENTES);
    const modalidad = pick(MODALIDADES);

    // Resultado según fase de la oportunidad
    let resultadoPesos;
    if (['Inscripto', 'Promesa de Inscripción'].includes(opp.fase_oportunidad)) {
      resultadoPesos = [0.05, 0.75, 0.10, 0.10]; // mayormente Realizada
    } else if (opp.fase_oportunidad === 'No interesado') {
      resultadoPesos = [0.05, 0.30, 0.40, 0.25]; // muchas frustradas/canceladas
    } else if (opp.fase_oportunidad === 'Evaluando') {
      resultadoPesos = [0.15, 0.55, 0.15, 0.15];
    } else {
      resultadoPesos = [0.30, 0.35, 0.20, 0.15]; // mix general
    }

    const resultado = weightedPick(RESULTADOS_RAS, resultadoPesos);

    const comentarios = [
      '', '', '', // muchos sin comentario
      'Muy interesado en la carrera.',
      'Consulta sobre becas disponibles.',
      'Viene acompañado de sus padres.',
      'Pidió más información sobre plan de estudios.',
      'Quiere conocer las instalaciones.',
      'Preguntó por horarios y modalidad.',
      'Tiene dudas entre dos carreras.',
      'Ya visitó otras universidades.',
      'Referido por un estudiante actual.',
      'Contactar nuevamente en dos semanas.',
      'Interesado pero no puede en estas fechas.',
      'No atiende el teléfono.',
    ];

    rases.push({
      opp_id: opp.opp_id,
      titulo: `Reunión de Asesoramiento - ${opp.nombre} - ${agente}`,
      nombre_interesado: opp.nombre,
      agente_nombre: agente,
      fecha_hora: fechaHora,
      modalidad,
      carrera: opp.carrera_interes,
      estado_oportunidad: opp.proceso_inicio,
      resultado_ras: resultado,
      comentario: pick(comentarios) || null,
      owner: userId,
    });
  }

  return rases;
}

// ─── Inserción ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Autenticando...');
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: process.env.SEED_EMAIL || '',
    password: process.env.SEED_PASSWORD || '',
  });
  if (authErr) {
    console.error('❌ Error de autenticación:', authErr.message);
    process.exit(1);
  }
  console.log('✅ Autenticado.\n');

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user.id;
  console.log(`👤 User ID: ${userId}\n`);

  console.log('🔧 Generando datos de prueba...\n');

  const oppsData = generateOportunidades();
  console.log(`📊 Oportunidades generadas: ${oppsData.length}`);
  for (const p of PROCESOS) {
    const c = oppsData.filter(o => o.proceso_inicio === p).length;
    console.log(`   ${p}: ${c}`);
  }

  // Insertar oportunidades en batches de 50
  const insertedOpps = [];
  const BATCH = 50;
  for (let i = 0; i < oppsData.length; i += BATCH) {
    const batch = oppsData.slice(i, i + BATCH);
    const { data, error } = await supabase
      .from('oportunidades')
      .insert(batch)
      .select('opp_id, nombre, ras_agendada, carrera_interes, proceso_inicio, fase_oportunidad');

    if (error) {
      console.error(`❌ Error insertando oportunidades (batch ${i / BATCH + 1}):`, error.message);
      process.exit(1);
    }
    insertedOpps.push(...data);
    process.stdout.write(`   ✅ Insertadas ${Math.min(i + BATCH, oppsData.length)}/${oppsData.length}\r`);
  }
  console.log(`\n✅ ${insertedOpps.length} oportunidades insertadas.\n`);

  // Generar y insertar RASES
  const rasesData = generateRases(insertedOpps, userId);
  console.log(`📊 RASES generadas: ${rasesData.length}`);

  for (let i = 0; i < rasesData.length; i += BATCH) {
    const batch = rasesData.slice(i, i + BATCH);
    const { error } = await supabase.from('rases').insert(batch);

    if (error) {
      console.error(`❌ Error insertando RASES (batch ${i / BATCH + 1}):`, error.message);
      process.exit(1);
    }
    process.stdout.write(`   ✅ Insertadas ${Math.min(i + BATCH, rasesData.length)}/${rasesData.length}\r`);
  }
  console.log(`\n✅ ${rasesData.length} RASES insertadas.\n`);

  // Resumen
  console.log('─── Resumen ───');
  console.log(`Total Oportunidades: ${insertedOpps.length}`);
  console.log(`Total RASES: ${rasesData.length}`);
  console.log(`Ratio RAS/Opp: ${(rasesData.length / insertedOpps.length * 100).toFixed(1)}%`);

  const faseCount = {};
  insertedOpps.forEach(o => { faseCount[o.fase_oportunidad] = (faseCount[o.fase_oportunidad] || 0) + 1; });
  console.log('\nDistribución por fase:');
  for (const [f, c] of Object.entries(faseCount).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${f}: ${c}`);
  }

  const carreraCount = {};
  insertedOpps.forEach(o => { carreraCount[o.carrera_interes] = (carreraCount[o.carrera_interes] || 0) + 1; });
  console.log('\nDistribución por carrera:');
  for (const [c, n] of Object.entries(carreraCount).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${c}: ${n}`);
  }

  console.log('\n🎉 Seed completado exitosamente.');
}

main().catch(e => { console.error('Error fatal:', e); process.exit(1); });
