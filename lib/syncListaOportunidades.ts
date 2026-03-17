import { supabase } from './supabase';
import { FaseOportunidad } from '../types';

const normalizeStr = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const matchFase = (raw: string | null): FaseOportunidad => {
  if (!raw) return FaseOportunidad.Interesado;
  const n = normalizeStr(raw);
  for (const val of Object.values(FaseOportunidad)) {
    if (normalizeStr(val) === n) return val;
  }
  return FaseOportunidad.Interesado;
};

interface ListaItem {
  nombre_trato: string;
  nombre: string;
  fase: string | null;
  carrera_interes: string | null;
  codigo_sape: string | null;
  proceso: string | null;
  lista_id: string;
}

const FASES_CON_RAS = [FaseOportunidad.Interesado, FaseOportunidad.Evaluando] as string[];

interface SyncResult {
  items: (ListaItem & { opp_id: string | null; tag: string })[];
  vinculadas: number;
  creadas: number;
  sinSape: number;
  creadasSinRas: number;
  errors: string[];
}

export async function syncListaItemsWithOportunidades(
  rawItems: ListaItem[],
  userId: string,
): Promise<SyncResult> {
  const result: SyncResult = { items: [], vinculadas: 0, creadas: 0, sinSape: 0, creadasSinRas: 0, errors: [] };

  // Separate items with and without SAPE
  const withSape = rawItems.filter(i => i.codigo_sape);
  const withoutSape = rawItems.filter(i => !i.codigo_sape);
  result.sinSape = withoutSape.length;

  // Add items without SAPE (no linking)
  for (const item of withoutSape) {
    result.items.push({ ...item, opp_id: null, tag: 'SIN CONTACTAR' });
  }

  if (withSape.length === 0) return result;

  // Batch-fetch existing oportunidades by sape
  const sapeCodes = [...new Set(withSape.map(i => i.codigo_sape!))];
  const { data: existingOpps, error: fetchErr } = await supabase
    .from('oportunidades')
    .select('opp_id, sape')
    .in('sape', sapeCodes)
    .is('deleted_at', null);

  if (fetchErr) {
    result.errors.push('Error al buscar oportunidades: ' + fetchErr.message);
    for (const item of withSape) {
      result.items.push({ ...item, opp_id: null, tag: 'SIN CONTACTAR' });
    }
    return result;
  }

  // Map sape -> opp_id for existing ones
  const sapeToOpp: Record<string, string> = {};
  for (const opp of existingOpps || []) {
    if (opp.sape) sapeToOpp[opp.sape] = opp.opp_id;
  }

  // Determine which items need new oportunidades
  const toCreate: ListaItem[] = [];
  const toLink: (ListaItem & { opp_id: string })[] = [];

  for (const item of withSape) {
    const existingOppId = sapeToOpp[item.codigo_sape!];
    if (existingOppId) {
      toLink.push({ ...item, opp_id: existingOppId });
    } else {
      toCreate.push(item);
    }
  }

  result.vinculadas = toLink.length;

  // Add linked items
  for (const item of toLink) {
    result.items.push({ ...item, tag: 'SIN CONTACTAR' });
  }

  // Batch-create new oportunidades
  if (toCreate.length > 0) {
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const oppsToInsert = toCreate.map(item => ({
      nombre: item.nombre,
      nombre_trato: item.nombre_trato,
      carrera_interes: item.carrera_interes || null,
      sape: item.codigo_sape,
      proceso_inicio: item.proceso || null,
      fase_oportunidad: matchFase(item.fase),
      fecha_lead: today,
      ras_agendada: false,
      multiple_interes: false,
      owner: userId || null,
      created_at: now,
      updated_at: now,
    }));

    const { data: createdOpps, error: createErr } = await supabase
      .from('oportunidades')
      .insert(oppsToInsert)
      .select('opp_id, sape');

    if (createErr) {
      result.errors.push('Error al crear oportunidades: ' + createErr.message);
      for (const item of toCreate) {
        result.items.push({ ...item, opp_id: null, tag: 'SIN CONTACTAR' });
      }
    } else {
      const newSapeToOpp: Record<string, string> = {};
      for (const opp of createdOpps || []) {
        if (opp.sape) newSapeToOpp[opp.sape] = opp.opp_id;
      }
      result.creadas = createdOpps?.length || 0;
      for (const item of toCreate) {
        const oppId = newSapeToOpp[item.codigo_sape!] || null;
        result.items.push({ ...item, opp_id: oppId, tag: 'SIN CONTACTAR' });
      }

      // Escribir opp_id de vuelta a listas_de_trabajo para los items creados
      const updates = toCreate
        .map(item => ({
          codigo_sape: item.codigo_sape!,
          opp_id: newSapeToOpp[item.codigo_sape!] || null,
          lista_id: item.lista_id,
        }))
        .filter(u => u.opp_id);

      for (const u of updates) {
        const { error: linkErr } = await supabase
          .from('listas_de_trabajo')
          .update({ opp_id: u.opp_id })
          .eq('lista_id', u.lista_id)
          .eq('codigo_sape', u.codigo_sape);
        if (linkErr) {
          result.errors.push(`Error vinculando opp a lista (SAPE ${u.codigo_sape}): ${linkErr.message}`);
        }
      }
    }
  }

  // ── Post-sync: set ras_agendada = true for all opps with fase Interesado/Evaluando ──
  // Collect all opp_ids that were linked or created, and whose CSV fase needs RAS
  const oppIdsNeedRas: string[] = [];
  for (const item of result.items) {
    if (item.opp_id) {
      const fase = matchFase(item.fase);
      if (FASES_CON_RAS.includes(fase)) {
        oppIdsNeedRas.push(item.opp_id);
      }
    }
  }

  if (oppIdsNeedRas.length > 0) {
    const { error: rasErr } = await supabase
      .from('oportunidades')
      .update({ ras_agendada: true, updated_at: new Date().toISOString() })
      .in('opp_id', oppIdsNeedRas)
      .eq('ras_agendada', false);

    if (rasErr) {
      result.errors.push('Error al marcar RAS agendada: ' + rasErr.message);
    } else {
      result.creadasSinRas = oppIdsNeedRas.length;
    }
  }

  return result;
}
