export type ReportType = 'leads' | 'oportunidades' | 'rases';

export interface SectionConfig {
  id: string;
  title: string;
  defaultTitle: string;
  description: string;
  enabled: boolean;
  type: 'kpi' | 'chart' | 'table' | 'detail';
}

export interface ReportFilters {
  mes: string;          // '' = todos, 'YYYY-MM'
  estado: string;       // '' = todos
  carrera: string;      // '' = todas
  proceso: string;      // '' = todos
  desde: string;        // '' = sin limite, 'YYYY-MM-DD'
  hasta: string;        // '' = sin limite, 'YYYY-MM-DD'
}

export interface ReportState {
  reportType: ReportType;
  filters: ReportFilters;
  sections: SectionConfig[];
}
