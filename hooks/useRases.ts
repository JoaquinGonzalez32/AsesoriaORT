import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { RAS } from '../types';

const VALID_RAS_COLS = [
  'opp_id', 'titulo', 'nombre_interesado', 'agente_nombre',
  'fecha_hora', 'modalidad', 'carrera', 'estado_oportunidad',
  'resultado_ras', 'comentario'
];

const pickValidRasCols = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const col of VALID_RAS_COLS) {
    if (col in obj) {
      const val = obj[col];
      result[col] = val === '' ? null : val;
    }
  }
  return result;
};

export function useRases() {
  const [rases, setRases] = useState<RAS[]>([]);

  const fetchRases = async () => {
    const { data, error } = await supabase
      .from('rases')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_hora', { ascending: true });
    if (error) {
      console.warn('La tabla "rases" no se encontró o no es accesible.', error.message);
      setRases([]);
      return;
    }
    if (data) setRases(data);
  };

  const addRas = async (rasData: any, userId?: string): Promise<RAS | undefined> => {
    const payload = {
      ...pickValidRasCols(rasData),
      owner: userId || null,
    };
    const { data, error } = await supabase.from('rases').insert([payload]).select();
    if (error) {
      throw new Error('No se pudo guardar la RAS: ' + error.message);
    }
    if (data?.[0]) {
      setRases(prev => [...prev, data[0]]);
      return data[0];
    }
  };

  const updateRas = async (rasId: string, rasData: any) => {
    const payload = pickValidRasCols(rasData);
    const { data, error } = await supabase.from('rases').update(payload).eq('ras_id', rasId).select();
    if (error) throw error;
    if (data?.[0]) setRases(prev => prev.map(r => r.ras_id === rasId ? data[0] : r));
  };

  const deleteRas = async (id: string) => {
    const { error } = await supabase
      .from('rases')
      .update({ deleted_at: new Date().toISOString() })
      .eq('ras_id', id);
    if (error) throw error;
    setRases(prev => prev.filter(r => r.ras_id !== id));
  };

  return { rases, fetchRases, addRas, updateRas, deleteRas };
}
