import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';

const VALID_LEAD_COLS = [
  'nombre', 'cedula', 'mail', 'carrera_interes', 'liceo',
  'fecha_lead', 'resultado_llamada', 'horario_llamada',
  'intentos_llamado', 'comentario', 'convertido'
];

const pickValidLeadCols = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};
  for (const col of VALID_LEAD_COLS) {
    if (col in obj) {
      const val = obj[col];
      result[col] = val === '' ? null : val;
    }
  }
  return result;
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (data) setLeads(data);
  };

  const addLead = async (leadData: Omit<Lead, 'lead_id' | 'created_at' | 'updated_at'>, userId?: string) => {
    const now = new Date().toISOString();
    const leadToSave = {
      ...pickValidLeadCols(leadData as any),
      owner: userId || null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await supabase.from('leads').insert([leadToSave]).select();
    if (error) throw error;
    if (data?.[0]) setLeads(prev => [data[0], ...prev]);
  };

  const updateLead = async (updated: Lead) => {
    const now = new Date().toISOString();
    const dbPayload = {
      ...pickValidLeadCols(updated as any),
      updated_at: now,
    };
    const { data, error } = await supabase
      .from('leads')
      .update(dbPayload)
      .eq('lead_id', updated.lead_id)
      .select();
    if (error) throw error;
    if (data?.[0]) {
      setLeads(prev => prev.map(l => l.lead_id === updated.lead_id ? data[0] : l));
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() })
      .eq('lead_id', id);
    if (error) throw error;
    setLeads(prev => prev.filter(l => l.lead_id !== id));
  };

  return { leads, fetchLeads, addLead, updateLead, deleteLead };
}
