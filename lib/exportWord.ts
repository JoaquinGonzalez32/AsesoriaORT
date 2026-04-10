import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ImageRun, ShadingType,
} from 'docx';
import { ReportType, ReportFilters, SectionConfig } from '../components/informes/reportTypes';
import { Lead, Oportunidad, RAS } from '../types';
import {
  computeLeadKPIs, computeOppKPIs, computeRasKPIs,
  computeLeadsByResultado, computeLeadsResultadoHorario,
  computeOppsByFase, computeByCarrera,
  computeRasesByResultado, computeRasesByAgente,
  BarItem,
} from '../components/informes/reportSections';
import { MESES } from './shared-constants';
import { renderBarChartToBase64 } from './exportChartWord';

interface ExportParams {
  reportType: ReportType;
  filters: ReportFilters;
  sections: SectionConfig[];
  leads: Lead[];
  opportunities: Oportunidad[];
  rases: RAS[];
}

const BLUE = '1e40af';
const GRAY_LIGHT = 'f1f5f9';
const GRAY_BORDER = 'e2e8f0';

const reportTitle: Record<ReportType, string> = {
  leads: 'Informe de Leads',
  oportunidades: 'Informe de Oportunidades',
  rases: 'Informe de RASES',
};

function filtersDescription(filters: ReportFilters, reportType: ReportType): string {
  const parts: string[] = [];
  if (reportType === 'oportunidades') {
    if (filters.proceso) parts.push(filters.proceso);
  } else {
    if (filters.mes) {
      const [y, m] = filters.mes.split('-');
      const mesName = MESES.find(x => x.val === m)?.name || m;
      parts.push(`${mesName} ${y}`);
    }
  }
  if (filters.estado) parts.push(filters.estado);
  if (filters.carrera) parts.push(filters.carrera);
  if (filters.desde || filters.hasta) {
    const desde = filters.desde || '...';
    const hasta = filters.hasta || '...';
    parts.push(`${desde} → ${hasta}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Todos';
}

function formatDateWord(): string {
  const d = new Date();
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function sectionTitle(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER } },
    children: [
      new TextRun({ text: title.toUpperCase(), bold: true, size: 20, color: BLUE, font: 'Calibri' }),
    ],
  });
}

function kpiRow(items: { value: string; label: string }[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: items.map(item =>
          new TableCell({
            width: { size: Math.floor(100 / items.length), type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: GRAY_LIGHT },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
              left: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
              right: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
            },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 0 }, children: [new TextRun({ text: item.value, bold: true, size: 36, font: 'Calibri' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: item.label.toUpperCase(), size: 14, color: '94a3b8', bold: true, font: 'Calibri' })] }),
            ],
          })
        ),
      }),
    ],
  });
}

function barChartImage(items: BarItem[], title: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  try {
    const base64 = renderBarChartToBase64(items, title);
    if (base64) {
      elements.push(new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [
          new ImageRun({
            data: Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
            transformation: { width: 600, height: Math.max(items.length * 28 + 60, 120) },
            type: 'png',
          }),
        ],
      }));
    }
  } catch {
    // Fallback: text-based representation
    items.forEach(item => {
      elements.push(new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({ text: `${item.label}: `, bold: true, size: 20, font: 'Calibri' }),
          new TextRun({ text: String(item.value), size: 20, font: 'Calibri' }),
        ],
      }));
    });
  }
  return elements;
}

function dataTable(headers: string[], rows: string[][], alignments?: (typeof AlignmentType)[keyof typeof AlignmentType][]): Table {
  const headerCells = headers.map((h, i) =>
    new TableCell({
      shading: { type: ShadingType.CLEAR, fill: GRAY_LIGHT },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: GRAY_BORDER },
        left: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
        right: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
      },
      children: [new Paragraph({
        alignment: alignments?.[i] || AlignmentType.LEFT,
        children: [new TextRun({ text: h.toUpperCase(), bold: true, size: 16, color: '64748b', font: 'Calibri' })],
      })],
    })
  );

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      children: row.map((cell, ci) =>
        new TableCell({
          shading: ri % 2 === 1 ? { type: ShadingType.CLEAR, fill: 'fafbfc' } : undefined,
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: GRAY_LIGHT },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: GRAY_LIGHT },
            left: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
            right: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
          },
          children: [new Paragraph({
            alignment: alignments?.[ci] || AlignmentType.LEFT,
            children: [new TextRun({ text: cell, size: 20, font: 'Calibri' })],
          })],
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...dataRows],
  });
}

// ─── Section builders ─────────────────────────────────────────────────────
function buildLeadSections(sections: SectionConfig[], leads: Lead[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const s of sections) {
    elements.push(sectionTitle(s.title));

    switch (s.id) {
      case 'leads-kpi': {
        const kpi = computeLeadKPIs(leads);
        elements.push(kpiRow([
          { value: String(kpi.total), label: 'Total Leads' },
          { value: String(kpi.contactados), label: 'Contactados' },
          { value: `${kpi.pctContactados}%`, label: 'Efectividad' },
        ]));
        break;
      }
      case 'leads-resultado': {
        const data = computeLeadsByResultado(leads);
        elements.push(...barChartImage(data, s.title));
        break;
      }
      case 'leads-tabla': {
        const { rows, totals } = computeLeadsResultadoHorario(leads);
        const alignments = [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.RIGHT];
        const tableRows = [
          ...rows.map(r => [r.resultado, String(r.manana), String(r.tarde), String(r.noche), String(r.total)]),
          ['Total', String(totals.manana), String(totals.tarde), String(totals.noche), String(totals.total)],
        ];
        elements.push(dataTable(['Resultado', 'Mañana', 'Tarde', 'Noche', 'Total'], tableRows, alignments));
        break;
      }
      case 'leads-detalle': {
        const display = leads.slice(0, 100);
        const alignments = [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.LEFT];
        const tableRows = display.map(l => [
          l.nombre, l.carrera_interes || '—', l.resultado_llamada,
          l.horario_llamada || '—', String(l.intentos_llamado), l.comentario || '',
        ]);
        elements.push(dataTable(['Nombre', 'Carrera', 'Resultado', 'Horario', 'Intentos', 'Comentario'], tableRows, alignments));
        if (leads.length > 100) {
          elements.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `... y ${leads.length - 100} leads mas`, size: 18, color: '94a3b8', italics: true, font: 'Calibri' })],
          }));
        }
        break;
      }
    }
  }
  return elements;
}

function buildOppSections(sections: SectionConfig[], opps: Oportunidad[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const s of sections) {
    elements.push(sectionTitle(s.title));

    switch (s.id) {
      case 'opps-kpi': {
        const kpi = computeOppKPIs(opps);
        elements.push(kpiRow([
          { value: String(kpi.total), label: 'Oportunidades' },
          { value: String(kpi.contactos), label: 'Contactos' },
          { value: String(kpi.inscriptos), label: 'Inscriptos' },
          { value: `${kpi.pctInscriptos}%`, label: 'Conversion' },
        ]));
        break;
      }
      case 'opps-pipeline': {
        const data = computeOppsByFase(opps);
        elements.push(...barChartImage(data, s.title));
        break;
      }
      case 'opps-carreras': {
        const data = computeByCarrera(opps);
        elements.push(...barChartImage(data, s.title));
        break;
      }
    }
  }
  return elements;
}

function buildRasSections(sections: SectionConfig[], rases: RAS[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  for (const s of sections) {
    elements.push(sectionTitle(s.title));

    switch (s.id) {
      case 'rases-kpi': {
        const kpi = computeRasKPIs(rases);
        elements.push(kpiRow([
          { value: String(kpi.total), label: 'Total RASES' },
          { value: String(kpi.presencial), label: 'Presencial' },
          { value: String(kpi.enLinea), label: 'En Linea' },
        ]));
        break;
      }
      case 'rases-resultado': {
        const data = computeRasesByResultado(rases);
        elements.push(...barChartImage(data, s.title));
        break;
      }
      case 'rases-agente': {
        const data = computeRasesByAgente(rases);
        elements.push(...barChartImage(data, s.title));
        break;
      }
      case 'rases-carrera': {
        const data = computeByCarrera(rases.map(r => ({ carrera_interes: r.carrera })));
        elements.push(...barChartImage(data, s.title));
        break;
      }
    }
  }
  return elements;
}

// ─── Main export ──────────────────────────────────────────────────────────
export async function exportReportToWord(params: ExportParams) {
  const { reportType, filters, sections, leads, opportunities, rases } = params;

  const headerParagraphs = [
    new Paragraph({
      spacing: { after: 40 },
      children: [new TextRun({ text: reportTitle[reportType], bold: true, size: 36, color: BLUE, font: 'Calibri' })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [new TextRun({ text: 'CRM Asesoria ORT', size: 20, color: '64748b', font: 'Calibri' })],
    }),
    new Paragraph({
      spacing: { after: 20 },
      children: [
        new TextRun({ text: 'Fecha: ', bold: true, size: 18, color: '475569', font: 'Calibri' }),
        new TextRun({ text: formatDateWord(), size: 18, color: '94a3b8', font: 'Calibri' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: BLUE } },
      children: [
        new TextRun({ text: 'Filtros: ', bold: true, size: 18, color: '475569', font: 'Calibri' }),
        new TextRun({ text: filtersDescription(filters, reportType), size: 18, color: '94a3b8', font: 'Calibri' }),
      ],
    }),
  ];

  let sectionElements: (Paragraph | Table)[] = [];
  switch (reportType) {
    case 'leads': sectionElements = buildLeadSections(sections, leads); break;
    case 'oportunidades': sectionElements = buildOppSections(sections, opportunities); break;
    case 'rases': sectionElements = buildRasSections(sections, rases); break;
  }

  const footerParagraph = new Paragraph({
    spacing: { before: 400 },
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER } },
    children: [
      new TextRun({ text: 'CRM Asesoria ORT - Informe generado automaticamente', size: 16, color: 'cbd5e1', font: 'Calibri' }),
    ],
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, right: 1200, bottom: 1000, left: 1200 },
        },
      },
      children: [...headerParagraphs, ...sectionElements, footerParagraph],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const typeLabel = { leads: 'Leads', oportunidades: 'Oportunidades', rases: 'RASES' }[reportType];
  link.download = `Informe_${typeLabel}_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
