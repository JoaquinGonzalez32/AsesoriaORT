import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Oportunidad } from '../types';

interface RasActions {
  addRas: (rasData: any) => Promise<any>;
  updateRas: (rasId: string, rasData: any) => Promise<void>;
}

  const VALID_COLS = [
    'nombre', 'cedula', 'mail', 'telefono', 'sape', 'carrera_interes', 'otros_intereses',
    'liceo', 'fecha_lead', 'ras_agendada', 'ras_asistio', 'multiple_interes',
    'liceo_tipo', 'ras_hecha_por', 'proceso_inicio', 'fase_oportunidad',
    'comentario_extra'
  ];

  const pickValidCols = (obj: Record<string, any>) => {
    const result: Record<string, any> = {};
    for (const col of VALID_COLS) {
      if (col in obj) {
        const val = obj[col];
        // Convert empty strings to null to avoid type errors (integer, date, etc.)
        result[col] = val === '' ? null : val;
      }
    }
    return result;
  };

export function useOpportunities(rasActions: RasActions) {
  const [opportunities, setOpportunities] = useState<Oportunidad[]>([]);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('oportunidades')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data) setOpportunities(data);
  };

  const addOpp = async (oppData: any, userId?: string) => {
    const { rasInfo, ...rest } = oppData;
    const oppToSave = {
      ...pickValidCols(rest),
      ras_hecha_por: userId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('oportunidades').insert([oppToSave]).select();
    if (error) { throw error; }

    const newOpp = data[0];
    setOpportunities(prev => [newOpp, ...prev]);

    if (newOpp.ras_agendada && rasInfo) {
      await rasActions.addRas({
        opp_id: newOpp.opp_id,
        titulo: `Reunión de Asesoramiento - ${newOpp.nombre} - ${rasInfo.agente_nombre}`,
        nombre_interesado: newOpp.nombre,
        agente_nombre: rasInfo.agente_nombre,
        fecha_hora: rasInfo.fecha_hora,
        modalidad: rasInfo.modalidad,
        carrera: newOpp.carrera_interes,
        estado_oportunidad: newOpp.proceso_inicio,
      });
    }
  };

  const updateOpp = async (updated: Oportunidad, rasInfo?: any) => {
    const { opp_id } = updated;
    const dbPayload = {
      ...pickValidCols(updated as any),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('oportunidades').update(dbPayload).eq('opp_id', opp_id);
    if (error) { throw error; }
    setOpportunities(prev => prev.map(o => o.opp_id === updated.opp_id ? updated : o));

    if (updated.ras_agendada && rasInfo) {
      const { data: existing } = await supabase
        .from('rases')
        .select('*')
        .eq('opp_id', updated.opp_id)
        .is('deleted_at', null)
        .maybeSingle();

      const rasData: any = {
        opp_id: updated.opp_id,
        titulo: `Reunión de Asesoramiento - ${updated.nombre} - ${rasInfo.agente_nombre}`,
        nombre_interesado: updated.nombre,
        agente_nombre: rasInfo.agente_nombre,
        fecha_hora: rasInfo.fecha_hora,
        modalidad: rasInfo.modalidad,
        carrera: updated.carrera_interes,
        estado_oportunidad: updated.proceso_inicio,
      };

      if (existing) {
        await rasActions.updateRas(existing.ras_id, rasData);
      } else {
        await rasActions.addRas(rasData);
      }
    }
  };

  const deleteOpp = async (id: string) => {
    const { error } = await supabase
      .from('oportunidades')
      .update({ deleted_at: new Date().toISOString() })
      .eq('opp_id', id);
    if (error) throw error;
    setOpportunities(prev => prev.filter(o => o.opp_id !== id));
  };

  return { opportunities, fetchOpportunities, addOpp, updateOpp, deleteOpp };
}
