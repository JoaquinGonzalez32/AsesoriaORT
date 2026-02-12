import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { RAS } from '../types';

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

  const addRas = async (rasData: any): Promise<RAS | undefined> => {
    const { data, error } = await supabase.from('rases').insert([rasData]).select();
    if (error) {
      console.warn('No se pudo guardar la RAS.', error.message);
      return undefined;
    }
    if (data?.[0]) {
      setRases(prev => [...prev, data[0]]);
      return data[0];
    }
  };

  const updateRas = async (rasId: string, rasData: any) => {
    const { data, error } = await supabase.from('rases').update(rasData).eq('ras_id', rasId).select();
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
