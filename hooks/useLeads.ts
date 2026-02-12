import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';

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
    const leadToSave = {
      ...leadData,
      owner: userId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('leads').insert([leadToSave]).select();
    if (error) throw error;
    if (data?.[0]) setLeads(prev => [data[0], ...prev]);
  };

  const updateLead = async (updated: Lead) => {
    const { error } = await supabase.from('leads').update(updated).eq('lead_id', updated.lead_id);
    if (error) throw error;
    setLeads(prev => prev.map(l => l.lead_id === updated.lead_id ? updated : l));
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
