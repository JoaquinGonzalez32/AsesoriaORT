import { supabase } from './supabase';
import { MotivoDesinteres } from '../types';

export interface InformeRow {
  carrera: string;
  universo: number;
  rasReciente: number;
  siguenInteresados: number;
  totalDesinteresados: number;
  noContestan: number;
  costos: number;
  cambioVocacional: number;
  horarios: number;
  modalidadUbicacion: number;
  cambioProceso: number;
  otraCarreraOrt: number;
  noEspecifica: number;
  incontactables: number;
}

export interface InformeData {
  conRas: InformeRow[];
  sinRas: InformeRow[];
  totalesConRas: InformeRow;
  totalesSinRas: InformeRow;
}

interface ListaItem {
  id: string;
  nombre_trato: string;
  nombre: string;
  fase: string | null;
  carrera_interes: string | null;
  codigo_sape: string | null;
  proceso: string | null;
  lista_id: string | null;
  tag: string | null;
  opp_id: string | null;
  created_at: string;
}

const emptyRow = (carrera: string): InformeRow => ({
  carrera,
  universo: 0,
  rasReciente: 0,
  siguenInteresados: 0,
  totalDesinteresados: 0,
  noContestan: 0,
  costos: 0,
  cambioVocacional: 0,
  horarios: 0,
  modalidadUbicacion: 0,
  cambioProceso: 0,
  otraCarreraOrt: 0,
  noEspecifica: 0,
  incontactables: 0,
});

const sumRows = (rows: InformeRow[]): InformeRow => {
  const total = emptyRow('TOTALES');
  for (const r of rows) {
    total.universo += r.universo;
    total.rasReciente += r.rasReciente;
    total.siguenInteresados += r.siguenInteresados;
    total.totalDesinteresados += r.totalDesinteresados;
    total.noContestan += r.noContestan;
    total.costos += r.costos;
    total.cambioVocacional += r.cambioVocacional;
    total.horarios += r.horarios;
    total.modalidadUbicacion += r.modalidadUbicacion;
    total.cambioProceso += r.cambioProceso;
    total.otraCarreraOrt += r.otraCarreraOrt;
    total.noEspecifica += r.noEspecifica;
    total.incontactables += r.incontactables;
  }
  return total;
};

const MOTIVO_MAP: Record<string, keyof InformeRow> = {
  [MotivoDesinteres.Costos]: 'costos',
  [MotivoDesinteres.CambioVocacional]: 'cambioVocacional',
  [MotivoDesinteres.Horarios]: 'horarios',
  [MotivoDesinteres.ModalidadUbicacion]: 'modalidadUbicacion',
  [MotivoDesinteres.CambioProceso]: 'cambioProceso',
  [MotivoDesinteres.OtraCarreraOrt]: 'otraCarreraOrt',
  [MotivoDesinteres.NoEspecifica]: 'noEspecifica',
  [MotivoDesinteres.Incontactables]: 'incontactables',
};

export async function buildInformeLista(items: ListaItem[]): Promise<InformeData> {
  // Collect all opp_ids
  const oppIds = [...new Set(items.map(i => i.opp_id).filter(Boolean))] as string[];

  // Fetch opp data in batch
  const oppMap = new Map<string, { ras_agendada: boolean; motivo_desinteres: string | null }>();
  if (oppIds.length > 0) {
    const { data: opps } = await supabase
      .from('oportunidades')
      .select('opp_id, ras_agendada, motivo_desinteres')
      .in('opp_id', oppIds);
    if (opps) {
      for (const o of opps) {
        oppMap.set(o.opp_id, { ras_agendada: o.ras_agendada, motivo_desinteres: o.motivo_desinteres });
      }
    }
  }

  // Separate items into CON RAS / SIN RAS
  const conRasItems: ListaItem[] = [];
  const sinRasItems: ListaItem[] = [];

  for (const item of items) {
    const opp = item.opp_id ? oppMap.get(item.opp_id) : null;
    if (opp?.ras_agendada) {
      conRasItems.push(item);
    } else {
      sinRasItems.push(item);
    }
  }

  const buildRows = (groupItems: ListaItem[]): InformeRow[] => {
    const byCarrera = new Map<string, ListaItem[]>();
    for (const item of groupItems) {
      const key = item.carrera_interes || 'Sin carrera';
      if (!byCarrera.has(key)) byCarrera.set(key, []);
      byCarrera.get(key)!.push(item);
    }

    const rows: InformeRow[] = [];
    for (const [carrera, carreraItems] of byCarrera) {
      const row = emptyRow(carrera);
      row.universo = carreraItems.length;

      for (const item of carreraItems) {
        const tag = item.tag;
        if (tag === 'RAS RECIENTE') row.rasReciente++;
        if (tag === 'SIGUEN INTERESADOS') row.siguenInteresados++;
        if (tag === 'DESINTERESADO' || tag?.startsWith('DESINTERESADO - ')) {
          row.totalDesinteresados++;
          // Get motivo from opp
          const opp = item.opp_id ? oppMap.get(item.opp_id) : null;
          const motivo = opp?.motivo_desinteres;
          if (motivo && MOTIVO_MAP[motivo]) {
            (row[MOTIVO_MAP[motivo]] as number)++;
          }
        }
        if (tag === 'AGUARDANDO RESPUESTA') row.noContestan++;
      }

      rows.push(row);
    }

    // Sort by universo descending
    rows.sort((a, b) => b.universo - a.universo);
    return rows;
  };

  const conRas = buildRows(conRasItems);
  const sinRas = buildRows(sinRasItems);

  return {
    conRas,
    sinRas,
    totalesConRas: sumRows(conRas),
    totalesSinRas: sumRows(sinRas),
  };
}
