import React, { useState, useMemo, useCallback } from 'react';
import { Lead, Oportunidad, RAS } from '../../types';
import { ReportType, ReportFilters, SectionConfig } from './reportTypes';
import { getDefaultSections, filterLeads, filterOpps, filterRases } from './reportSections';
import { getDefaultProceso } from '../../lib/shared-constants';
import ReportConfig from './ReportConfig';
import ReportPreview from './ReportPreview';
import { exportReportToWord } from '../../lib/exportWord';
import { useToast } from '../ui/Toast';

interface Props {
  leads: Lead[];
  opportunities: Oportunidad[];
  rases: RAS[];
}

const InformesPage: React.FC<Props> = ({ leads, opportunities, rases }) => {
  const { toast } = useToast();

  const currentYM = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const defaultFilters = useCallback((type: ReportType): ReportFilters => ({
    mes: type !== 'oportunidades' ? currentYM : '',
    estado: '',
    carrera: '',
    proceso: type === 'oportunidades' ? getDefaultProceso() : '',
    desde: '',
    hasta: '',
  }), [currentYM]);

  const [reportType, setReportType] = useState<ReportType>('leads');
  const [filters, setFilters] = useState<ReportFilters>(() => defaultFilters('leads'));
  const [sections, setSections] = useState<SectionConfig[]>(getDefaultSections('leads'));
  const [exporting, setExporting] = useState(false);

  const handleChangeType = useCallback((type: ReportType) => {
    setReportType(type);
    setSections(getDefaultSections(type));
    setFilters(defaultFilters(type));
  }, [defaultFilters]);

  const handleToggleSection = useCallback((id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }, []);

  const handleUpdateSectionTitle = useCallback((id: string, title: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }, []);

  const filteredLeads = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const filteredOpps = useMemo(() => filterOpps(opportunities, filters), [opportunities, filters]);
  const filteredRases = useMemo(() => filterRases(rases, filters), [rases, filters]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportReportToWord({
        reportType,
        filters,
        sections: sections.filter(s => s.enabled),
        leads: filteredLeads,
        opportunities: filteredOpps,
        rases: filteredRases,
      });
      toast('success', 'Informe Word exportado correctamente');
    } catch (err) {
      console.error('Export error:', err);
      toast('error', 'Error al exportar el informe');
    } finally {
      setExporting(false);
    }
  }, [reportType, filters, sections, filteredLeads, filteredOpps, filteredRases, toast]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-1"/><path d="M12 18v-6"/><path d="M16 18v-3"/></svg>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Informes</h1>
          <p className="text-sm text-gray-400">Genera informes personalizados en Word</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <ReportConfig
          reportType={reportType}
          filters={filters}
          sections={sections}
          onChangeType={handleChangeType}
          onChangeFilters={setFilters}
          onToggleSection={handleToggleSection}
          onReorderSections={setSections}
          onUpdateSectionTitle={handleUpdateSectionTitle}
          onExport={handleExport}
          exporting={exporting}
        />
        <ReportPreview
          reportType={reportType}
          filters={filters}
          sections={sections}
          leads={filteredLeads}
          opportunities={filteredOpps}
          rases={filteredRases}
        />
      </div>
    </div>
  );
};

export default InformesPage;
