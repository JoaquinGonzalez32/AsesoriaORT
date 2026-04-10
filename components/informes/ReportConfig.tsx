import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { ReportType, SectionConfig, ReportFilters } from './reportTypes';
import { ResultadoLlamada, FaseOportunidad, ResultadoRAS } from '../../types';
import { CARRERAS_OPTIONS, MESES, PROCESO_OPTIONS } from '../../lib/shared-constants';
import SectionItem from './SectionItem';

interface Props {
  reportType: ReportType;
  filters: ReportFilters;
  sections: SectionConfig[];
  onChangeType: (type: ReportType) => void;
  onChangeFilters: (filters: ReportFilters) => void;
  onToggleSection: (id: string) => void;
  onReorderSections: (sections: SectionConfig[]) => void;
  onUpdateSectionTitle: (id: string, title: string) => void;
  onExport: () => void;
  exporting: boolean;
}

const selectClass = (active: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 ${active ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-300 bg-gray-50 text-gray-700'}`;

const ReportConfig: React.FC<Props> = ({
  reportType, filters, sections,
  onChangeType, onChangeFilters, onToggleSection, onReorderSections, onUpdateSectionTitle,
  onExport, exporting,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      onReorderSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const estadoOptions = () => {
    switch (reportType) {
      case 'leads': return Object.values(ResultadoLlamada);
      case 'oportunidades': return Object.values(FaseOportunidad);
      case 'rases': return Object.values(ResultadoRAS);
    }
  };

  const mesLabel = reportType === 'oportunidades' ? 'Proceso' : 'Mes';
  const showProceso = reportType === 'oportunidades';

  const now = new Date();
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-5">
      {/* Tipo de informe */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Informe</label>
        <select
          value={reportType}
          onChange={(e) => onChangeType(e.target.value as ReportType)}
          className={selectClass(true)}
        >
          <option value="leads">Leads</option>
          <option value="oportunidades">Oportunidades</option>
          <option value="rases">RASES</option>
        </select>
      </div>

      {/* Filtros */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtros</label>
        <div className="space-y-2">
          {showProceso ? (
            <select
              value={filters.proceso}
              onChange={(e) => onChangeFilters({ ...filters, proceso: e.target.value })}
              className={selectClass(!!filters.proceso)}
            >
              <option value="">Todos los procesos</option>
              {PROCESO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <select
              value={filters.mes}
              onChange={(e) => onChangeFilters({ ...filters, mes: e.target.value })}
              className={selectClass(!!filters.mes)}
            >
              <option value="">Todos los meses</option>
              {years.map(y =>
                MESES.map(m => {
                  const val = `${y}-${m.val}`;
                  return <option key={val} value={val}>{m.name} {y}</option>;
                })
              )}
            </select>
          )}

          <select
            value={filters.estado}
            onChange={(e) => onChangeFilters({ ...filters, estado: e.target.value })}
            className={selectClass(!!filters.estado)}
          >
            <option value="">Todos los estados</option>
            {estadoOptions().map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <select
            value={filters.carrera}
            onChange={(e) => onChangeFilters({ ...filters, carrera: e.target.value })}
            className={selectClass(!!filters.carrera)}
          >
            <option value="">Todas las carreras</option>
            {CARRERAS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Rango de fechas — solo para oportunidades y rases */}
          {(reportType === 'oportunidades' || reportType === 'rases') && (
            <div className={`border rounded-xl p-3 space-y-2 transition-colors ${filters.desde || filters.hasta ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${filters.desde || filters.hasta ? 'text-blue-700' : 'text-gray-500'}`}>Rango de fechas</span>
                {(filters.desde || filters.hasta) && (
                  <button
                    onClick={() => onChangeFilters({ ...filters, desde: '', hasta: '' })}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Desde</label>
                  <input
                    type="date"
                    value={filters.desde}
                    onChange={(e) => onChangeFilters({ ...filters, desde: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Hasta</label>
                  <input
                    type="date"
                    value={filters.hasta}
                    onChange={(e) => onChangeFilters({ ...filters, hasta: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secciones */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Secciones</label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map(s => (
                <SectionItem
                  key={s.id}
                  section={s}
                  onToggle={onToggleSection}
                  onUpdateTitle={onUpdateSectionTitle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Export button */}
      <button
        onClick={onExport}
        disabled={exporting || !sections.some(s => s.enabled)}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
      >
        {exporting ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Generando...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Word
          </>
        )}
      </button>
    </div>
  );
};

export default ReportConfig;
