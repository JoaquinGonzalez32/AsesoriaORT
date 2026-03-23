import { useState, useCallback, useEffect } from 'react';

export interface DashboardBlock {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_BLOCKS: DashboardBlock[] = [
  { id: 'kpi-captacion', label: 'Leads, 1er contacto, contactados e interesados', description: 'Total leads, 1er contacto, contactados e interesados.', enabled: true },
  { id: 'kpi-cierre', label: 'RAS agendadas y realizadas', description: 'RAS agendadas y RAS realizadas.', enabled: true },
  { id: 'chart-funnel', label: 'Datos Leads', description: 'Grafica de barras con el embudo: 1er Contacto, Contactados, Interesados.', enabled: true },
  { id: 'chart-top-carreras', label: 'Top Carreras', description: 'Ranking de carreras con mas leads por interes.', enabled: true },
  { id: 'section-leads', label: 'Seccion Leads', description: 'Filtros y grafica de distribucion por resultado de llamada.', enabled: true },
  { id: 'section-opps', label: 'Seccion Oportunidades', description: 'Filtros, pipeline por fase y mix de carreras.', enabled: true },
  { id: 'section-rases', label: 'Seccion RASES', description: 'Filtros, modalidad, RAS por agente y RAS por carrera.', enabled: true },
];

// First-time users start with everything disabled
const EMPTY_BLOCKS: DashboardBlock[] = DEFAULT_BLOCKS.map(b => ({ ...b, enabled: false }));

function storageKey(userId: string) {
  return `dashboard_config_${userId}`;
}

function isFirstTime(userId: string): boolean {
  return !localStorage.getItem(storageKey(userId));
}

function loadConfig(userId: string): DashboardBlock[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return EMPTY_BLOCKS;
    const saved: { id: string; enabled: boolean }[] = JSON.parse(raw);
    // Merge saved order/enabled with current defaults (handles new blocks added later)
    const savedMap = new Map(saved.map(s => [s.id, s.enabled]));
    const orderedIds = saved.map(s => s.id);
    const result: DashboardBlock[] = [];
    // First: blocks in saved order
    for (const id of orderedIds) {
      const def = DEFAULT_BLOCKS.find(b => b.id === id);
      if (def) result.push({ ...def, enabled: savedMap.get(id) ?? def.enabled });
    }
    // Then: any new blocks not in saved
    for (const def of DEFAULT_BLOCKS) {
      if (!orderedIds.includes(def.id)) result.push({ ...def });
    }
    return result;
  } catch {
    return DEFAULT_BLOCKS;
  }
}

function saveConfig(userId: string, blocks: DashboardBlock[]) {
  const minimal = blocks.map(b => ({ id: b.id, enabled: b.enabled }));
  localStorage.setItem(storageKey(userId), JSON.stringify(minimal));
}

export function useDashboardConfig(userId: string | undefined) {
  const [blocks, setBlocks] = useState<DashboardBlock[]>(EMPTY_BLOCKS);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    if (userId) {
      setFirstTime(isFirstTime(userId));
      setBlocks(loadConfig(userId));
    }
  }, [userId]);

  const updateBlocks = useCallback((newBlocks: DashboardBlock[]) => {
    setBlocks(newBlocks);
    if (userId) saveConfig(userId, newBlocks);
  }, [userId]);

  const toggleBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b);
      if (userId) saveConfig(userId, next);
      return next;
    });
  }, [userId]);

  const resetToDefault = useCallback(() => {
    const defaults = DEFAULT_BLOCKS.map(b => ({ ...b }));
    setBlocks(defaults);
    setFirstTime(false);
    if (userId) saveConfig(userId, defaults);
  }, [userId]);

  const enableAll = useCallback(() => {
    const all = blocks.map(b => ({ ...b, enabled: true }));
    setBlocks(all);
    setFirstTime(false);
    if (userId) saveConfig(userId, all);
  }, [userId, blocks]);

  const isVisible = useCallback((id: string) => {
    return blocks.find(b => b.id === id)?.enabled ?? false;
  }, [blocks]);

  return { blocks, updateBlocks, toggleBlock, resetToDefault, enableAll, isVisible, isFirstTime: firstTime };
}
