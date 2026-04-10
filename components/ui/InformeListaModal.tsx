import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { buildInformeLista, InformeData, InformeRow } from '../../lib/informeListaData';

interface ListaItem {
  id: string;
  nombre_trato: string;
  nombre: string;
  fase: string | null;
  carrera_interes: string | null;
  codigo_sape: string | null;
  proceso: string | null;
  lista_id: string | null;
  tag: string | null;
  opp_id: string | null;
  created_at: string;
}

interface InformeListaModalProps {
  open: boolean;
  onClose: () => void;
  items: ListaItem[];
  listaNombre: string;
  listaId: string;
}

const pct = (n: number, total: number) => total === 0 ? '—' : `${Math.round((n / total) * 100)}%`;

// ─── Excel export ──────────────────────────────────────────────────────────────

async function exportToExcel(data: InformeData, listaNombre: string) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Informe');

  // Color constants (ARGB without #)
  const BLUE = '2563EB';
  const BLUE_LIGHT = 'EFF6FF';
  const GREEN = '16A34A';
  const GREEN_LIGHT = 'F0FDF4';
  const RED = 'DC2626';
  const RED_LIGHT = 'FEF2F2';
  const AMBER = 'D97706';
  const AMBER_LIGHT = 'FFFBEB';
  const PURPLE = '7C3AED';
  const PURPLE_LIGHT = 'FAF5FF';
  const GRAY_BG = 'F9FAFB';
  const GRAY_BORDER = 'E5E7EB';
  const GRAY_700 = '374151';
  const GRAY_500 = '6B7280';
  const TOTALES_BG = 'F3F4F6';

  const thin: ExcelJS.Border = { style: 'thin', color: { argb: GRAY_BORDER } };
  const borders: Partial<ExcelJS.Borders> = { top: thin, left: thin, bottom: thin, right: thin };

  const writeSection = (startRow: number, titulo: string, rows: InformeRow[], totales: InformeRow): number => {
    let r = startRow;

    // Section title
    const titleCell = ws.getCell(r, 1);
    titleCell.value = titulo;
    titleCell.font = { bold: true, size: 11, color: { argb: GRAY_700 } };
    ws.mergeCells(r, 1, r, 18);
    r++;

    // Header row 1 (merged groups)
    const h1 = ws.getRow(r);
    h1.height = 22;

    const setHeader = (row: number, col: number, text: string, fg: string, bg: string) => {
      const c = ws.getCell(row, col);
      c.value = text;
      c.font = { bold: true, size: 9, color: { argb: fg } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = borders;
    };

    // Carrera + Universo span 2 rows
    setHeader(r, 1, 'CARRERA', GRAY_500, GRAY_BG);
    ws.mergeCells(r, 1, r + 1, 1);
    setHeader(r, 2, 'UNIVERSO', GRAY_500, GRAY_BG);
    ws.mergeCells(r, 2, r + 1, 2);

    // Grouped headers
    setHeader(r, 3, 'RAS RECIENTE', BLUE, BLUE_LIGHT);
    ws.mergeCells(r, 3, r, 4);
    setHeader(r, 5, 'SIGUEN INTERESADOS', GREEN, GREEN_LIGHT);
    ws.mergeCells(r, 5, r, 6);
    setHeader(r, 7, 'DESINTERESADOS', RED, RED_LIGHT);
    ws.mergeCells(r, 7, r, 8);
    setHeader(r, 9, 'NO CONTESTAN', AMBER, AMBER_LIGHT);
    ws.mergeCells(r, 9, r, 10);
    setHeader(r, 11, 'MOTIVOS DE DESINTERÉS', PURPLE, PURPLE_LIGHT);
    ws.mergeCells(r, 11, r, 18);

    r++;
    // Header row 2 (sub-columns)
    const subCols: [number, string, string, string][] = [
      [3, '#', BLUE, BLUE_LIGHT], [4, '%', BLUE, BLUE_LIGHT],
      [5, '#', GREEN, GREEN_LIGHT], [6, '%', GREEN, GREEN_LIGHT],
      [7, '#', RED, RED_LIGHT], [8, '%', RED, RED_LIGHT],
      [9, '#', AMBER, AMBER_LIGHT], [10, '%', AMBER, AMBER_LIGHT],
      [11, 'Costos', PURPLE, PURPLE_LIGHT], [12, 'Cambio Vocacional', PURPLE, PURPLE_LIGHT],
      [13, 'Horarios', PURPLE, PURPLE_LIGHT], [14, 'Modalidad/Ubicación', PURPLE, PURPLE_LIGHT],
      [15, 'Cambio Proceso', PURPLE, PURPLE_LIGHT], [16, 'Otra Carrera ORT', PURPLE, PURPLE_LIGHT],
      [17, 'No Especifica', PURPLE, PURPLE_LIGHT], [18, 'Incontactables', PURPLE, PURPLE_LIGHT],
    ];
    for (const [col, text, fg, bg] of subCols) {
      setHeader(r, col, text, fg, bg);
    }
    ws.getRow(r).height = 18;
    r++;

    // Data rows
    const writeDataRow = (row: InformeRow, rowNum: number, isTotales: boolean) => {
      const bg = isTotales ? TOTALES_BG : 'FFFFFF';
      const setCell = (col: number, value: string | number, color: string) => {
        const c = ws.getCell(rowNum, col);
        c.value = value;
        c.font = { bold: isTotales, size: 9, color: { argb: color } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        c.alignment = { horizontal: col === 1 ? 'left' : 'center', vertical: 'middle' };
        c.border = borders;
      };

      setCell(1, row.carrera, isTotales ? GRAY_700 : '1F2937');
      setCell(2, row.universo, '111827');
      setCell(3, row.rasReciente || '—', BLUE);
      setCell(4, pct(row.rasReciente, row.universo), '3B82F6');
      setCell(5, row.siguenInteresados || '—', GREEN);
      setCell(6, pct(row.siguenInteresados, row.universo), '22C55E');
      setCell(7, row.totalDesinteresados || '—', RED);
      setCell(8, pct(row.totalDesinteresados, row.universo), 'F87171');
      setCell(9, row.noContestan || '—', AMBER);
      setCell(10, pct(row.noContestan, row.universo), 'FBBF24');
      setCell(11, row.costos || '—', GRAY_500);
      setCell(12, row.cambioVocacional || '—', GRAY_500);
      setCell(13, row.horarios || '—', GRAY_500);
      setCell(14, row.modalidadUbicacion || '—', GRAY_500);
      setCell(15, row.cambioProceso || '—', GRAY_500);
      setCell(16, row.otraCarreraOrt || '—', GRAY_500);
      setCell(17, row.noEspecifica || '—', GRAY_500);
      setCell(18, row.incontactables || '—', GRAY_500);
    };

    for (const row of rows) {
      writeDataRow(row, r, false);
      r++;
    }
    writeDataRow(totales, r, true);
    r++;

    // Blank row separator
    r++;
    return r;
  };

  // Column widths
  ws.getColumn(1).width = 14;
  ws.getColumn(2).width = 10;
  for (let i = 3; i <= 10; i++) ws.getColumn(i).width = 9;
  for (let i = 11; i <= 18; i++) ws.getColumn(i).width = 16;

  let currentRow = 1;
  currentRow = writeSection(currentRow, `OPORTUNIDADES CON RAS (${data.totalesConRas.universo} registros)`, data.conRas, data.totalesConRas);
  writeSection(currentRow, `OPORTUNIDADES SIN RAS (${data.totalesSinRas.universo} registros)`, data.sinRas, data.totalesSinRas);

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `informe_${listaNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ─── PDF export ───────────────────────────────────────────────────────────────

async function exportToPDF(data: InformeData, listaNombre: string) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();

  // Colors (RGB arrays)
  const BLUE: [number, number, number] = [37, 99, 235];
  const GREEN: [number, number, number] = [22, 163, 74];
  const RED: [number, number, number] = [220, 38, 38];
  const AMBER: [number, number, number] = [217, 119, 6];
  const PURPLE: [number, number, number] = [124, 58, 237];
  const GRAY_700: [number, number, number] = [55, 65, 81];

  const BLUE_LIGHT: [number, number, number] = [239, 246, 255];
  const GREEN_LIGHT: [number, number, number] = [240, 253, 244];
  const RED_LIGHT: [number, number, number] = [254, 242, 242];
  const AMBER_LIGHT: [number, number, number] = [255, 251, 235];
  const PURPLE_LIGHT: [number, number, number] = [250, 245, 255];
  const GRAY_BG: [number, number, number] = [249, 250, 251];
  const TOTALES_BG: [number, number, number] = [243, 244, 246];

  const headers = [
    ['Carrera', 'Universo', '#', '%', '#', '%', '#', '%', '#', '%',
     'Costos', 'C.Vocac.', 'Horarios', 'Mod/Ubic.', 'C.Proceso', 'Otra ORT', 'No Espec.', 'Incontact.'],
  ];

  const mapRow = (r: InformeRow) => [
    r.carrera,
    r.universo,
    r.rasReciente || '—', pct(r.rasReciente, r.universo),
    r.siguenInteresados || '—', pct(r.siguenInteresados, r.universo),
    r.totalDesinteresados || '—', pct(r.totalDesinteresados, r.universo),
    r.noContestan || '—', pct(r.noContestan, r.universo),
    r.costos || '—', r.cambioVocacional || '—', r.horarios || '—', r.modalidadUbicacion || '—',
    r.cambioProceso || '—', r.otraCarreraOrt || '—', r.noEspecifica || '—', r.incontactables || '—',
  ];

  const colColorMap: Record<number, { text: [number, number, number]; bg: [number, number, number] }> = {
    2: { text: BLUE, bg: BLUE_LIGHT }, 3: { text: BLUE, bg: BLUE_LIGHT },
    4: { text: GREEN, bg: GREEN_LIGHT }, 5: { text: GREEN, bg: GREEN_LIGHT },
    6: { text: RED, bg: RED_LIGHT }, 7: { text: RED, bg: RED_LIGHT },
    8: { text: AMBER, bg: AMBER_LIGHT }, 9: { text: AMBER, bg: AMBER_LIGHT },
    10: { text: PURPLE, bg: PURPLE_LIGHT }, 11: { text: PURPLE, bg: PURPLE_LIGHT },
    12: { text: PURPLE, bg: PURPLE_LIGHT }, 13: { text: PURPLE, bg: PURPLE_LIGHT },
    14: { text: PURPLE, bg: PURPLE_LIGHT }, 15: { text: PURPLE, bg: PURPLE_LIGHT },
    16: { text: PURPLE, bg: PURPLE_LIGHT }, 17: { text: PURPLE, bg: PURPLE_LIGHT },
  };

  const writeSection = (titulo: string, rows: InformeRow[], totales: InformeRow, startY: number) => {
    doc.setFontSize(10);
    doc.setTextColor(...GRAY_700);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, 14, startY);

    const body = [...rows.map(mapRow), mapRow(totales)];
    const totalsIdx = body.length - 1;

    autoTable(doc, {
      startY: startY + 2,
      head: headers,
      body,
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1.5, halign: 'center', valign: 'middle', lineWidth: 0.1, lineColor: [229, 231, 235] },
      headStyles: { fillColor: GRAY_BG, textColor: [107, 114, 128], fontStyle: 'bold', fontSize: 6 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 18 },
        1: { cellWidth: 12 },
      },
      didParseCell: (hookData: any) => {
        const { section, row, column } = hookData;
        const colIdx = column.index;

        if (section === 'head' && colIdx >= 2) {
          const c = colColorMap[colIdx];
          if (c) {
            hookData.cell.styles.fillColor = c.bg;
            hookData.cell.styles.textColor = c.text;
          }
        }

        if (section === 'body') {
          const isTotals = row.index === totalsIdx;
          if (isTotals) {
            hookData.cell.styles.fillColor = TOTALES_BG;
            hookData.cell.styles.fontStyle = 'bold';
          }
          if (colIdx >= 2) {
            const c = colColorMap[colIdx];
            if (c) hookData.cell.styles.textColor = c.text;
          }
        }
      },
      margin: { left: 14, right: 14 },
    });

    return (doc as any).lastAutoTable.finalY + 8;
  };

  // Title
  doc.setFontSize(13);
  doc.setTextColor(...GRAY_700);
  doc.setFont('helvetica', 'bold');
  doc.text(`Informe — ${listaNombre}`, 14, 15);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-UY')}  •  ${data.totalesConRas.universo + data.totalesSinRas.universo} registros`, 14, 20);

  let y = 26;
  y = writeSection(`OPORTUNIDADES CON RAS (${data.totalesConRas.universo} registros)`, data.conRas, data.totalesConRas, y);
  writeSection(`OPORTUNIDADES SIN RAS (${data.totalesSinRas.universo} registros)`, data.sinRas, data.totalesSinRas, y);

  doc.save(`informe_${listaNombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── Component ─────────────────────────────────────────────────────────────────

const InformeListaModal: React.FC<InformeListaModalProps> = ({
  open, onClose, items, listaNombre, listaId,
}) => {
  const [data, setData] = useState<InformeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (open && items.length > 0) {
      setLoading(true);
      setDownloaded(false);
      buildInformeLista(items).then(d => {
        setData(d);
        setLoading(false);
      }).catch(err => {
        console.error('Error generando informe:', err);
        setData(null);
        setLoading(false);
      });
    }
    if (!open) {
      setData(null);
    }
  }, [open, items, listaId]);

  const handleDownload = async () => {
    if (!data) return;
    await exportToExcel(data, listaNombre);
    setDownloaded(true);
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    await exportToPDF(data, listaNombre);
  };

  const handleClose = () => {
    setDownloaded(false);
    onClose();
  };

  const renderTable = (rows: InformeRow[], totales: InformeRow, titulo: string) => (
    <div className="mb-6">
      <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${titulo.includes('CON') ? 'bg-green-500' : 'bg-gray-400'}`} />
        {titulo}
        <span className="text-gray-400 font-bold normal-case">({totales.universo} registros)</span>
      </h4>
      {rows.length === 0 ? (
        <p className="text-gray-400 text-xs italic py-3">Sin registros en esta sección</p>
      ) : (
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-[11px] border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50">
                <th rowSpan={2} className="text-left p-2 font-black text-gray-500 uppercase border-b border-r border-gray-200 sticky left-0 bg-gray-50 z-10">Carrera</th>
                <th rowSpan={2} className="text-center p-2 font-black text-gray-500 uppercase border-b border-r border-gray-200">Universo</th>
                <th colSpan={2} className="text-center p-2 font-black text-blue-600 uppercase border-b border-r border-gray-200 bg-blue-50/50">RAS Reciente</th>
                <th colSpan={2} className="text-center p-2 font-black text-green-600 uppercase border-b border-r border-gray-200 bg-green-50/50">Siguen Interesados</th>
                <th colSpan={2} className="text-center p-2 font-black text-red-600 uppercase border-b border-r border-gray-200 bg-red-50/50">Desinteresados</th>
                <th colSpan={2} className="text-center p-2 font-black text-amber-600 uppercase border-b border-r border-gray-200 bg-amber-50/50">No Contestan</th>
                <th colSpan={8} className="text-center p-2 font-black text-purple-600 uppercase border-b border-gray-200 bg-purple-50/50">Motivos de Desinterés</th>
              </tr>
              <tr className="bg-gray-50 text-[10px]">
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-blue-50/30">#</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-blue-50/30">%</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-green-50/30">#</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-green-50/30">%</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-red-50/30">#</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-red-50/30">%</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-amber-50/30">#</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-amber-50/30">%</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Costos</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Cambio Vocacional</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Horarios</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Modalidad/Ubicación</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Cambio Proceso</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">Otra Carrera ORT</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-r border-gray-200 bg-purple-50/30">No Especifica</th>
                <th className="p-1.5 text-center font-bold text-gray-400 border-b border-gray-200 bg-purple-50/30">Incontactables</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-2 font-bold text-gray-800 sticky left-0 bg-white border-r border-gray-100">{r.carrera}</td>
                  <td className="p-2 text-center font-black text-gray-900 border-r border-gray-100">{r.universo}</td>
                  <td className="p-2 text-center text-blue-700 font-bold border-r border-gray-100">{r.rasReciente || '—'}</td>
                  <td className="p-2 text-center text-blue-500 border-r border-gray-100">{pct(r.rasReciente, r.universo)}</td>
                  <td className="p-2 text-center text-green-700 font-bold border-r border-gray-100">{r.siguenInteresados || '—'}</td>
                  <td className="p-2 text-center text-green-500 border-r border-gray-100">{pct(r.siguenInteresados, r.universo)}</td>
                  <td className="p-2 text-center text-red-600 font-bold border-r border-gray-100">{r.totalDesinteresados || '—'}</td>
                  <td className="p-2 text-center text-red-400 border-r border-gray-100">{pct(r.totalDesinteresados, r.universo)}</td>
                  <td className="p-2 text-center text-amber-600 font-bold border-r border-gray-100">{r.noContestan || '—'}</td>
                  <td className="p-2 text-center text-amber-400 border-r border-gray-100">{pct(r.noContestan, r.universo)}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.costos || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.cambioVocacional || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.horarios || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.modalidadUbicacion || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.cambioProceso || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.otraCarreraOrt || '—'}</td>
                  <td className="p-2 text-center text-gray-600 border-r border-gray-100">{r.noEspecifica || '—'}</td>
                  <td className="p-2 text-center text-gray-600">{r.incontactables || '—'}</td>
                </tr>
              ))}
              {/* Totales */}
              <tr className="bg-gray-100 font-black">
                <td className="p-2 text-gray-900 uppercase sticky left-0 bg-gray-100 border-r border-gray-200">Totales</td>
                <td className="p-2 text-center text-gray-900 border-r border-gray-200">{totales.universo}</td>
                <td className="p-2 text-center text-blue-700 border-r border-gray-200">{totales.rasReciente}</td>
                <td className="p-2 text-center text-blue-500 border-r border-gray-200">{pct(totales.rasReciente, totales.universo)}</td>
                <td className="p-2 text-center text-green-700 border-r border-gray-200">{totales.siguenInteresados}</td>
                <td className="p-2 text-center text-green-500 border-r border-gray-200">{pct(totales.siguenInteresados, totales.universo)}</td>
                <td className="p-2 text-center text-red-600 border-r border-gray-200">{totales.totalDesinteresados}</td>
                <td className="p-2 text-center text-red-400 border-r border-gray-200">{pct(totales.totalDesinteresados, totales.universo)}</td>
                <td className="p-2 text-center text-amber-600 border-r border-gray-200">{totales.noContestan}</td>
                <td className="p-2 text-center text-amber-400 border-r border-gray-200">{pct(totales.noContestan, totales.universo)}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.costos}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.cambioVocacional}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.horarios}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.modalidadUbicacion}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.cambioProceso}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.otraCarreraOrt}</td>
                <td className="p-2 text-center text-gray-700 border-r border-gray-200">{totales.noEspecifica}</td>
                <td className="p-2 text-center text-gray-700">{totales.incontactables}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Informe — ${listaNombre}`}
      subtitle={`${items.length} registros en la lista`}
      headerColor
      maxWidth="max-w-7xl"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={loading || !data}
            className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Descargar PDF
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !data}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloaded ? 'Descargado' : 'Descargar Excel'}
          </button>
        </>
      }
    >
      <div className="p-5 max-h-[65vh] overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-gray-400 font-medium">No hay datos para generar el informe</div>
        ) : (
          <>
            {renderTable(data.conRas, data.totalesConRas, 'Oportunidades CON RAS')}
            {renderTable(data.sinRas, data.totalesSinRas, 'Oportunidades SIN RAS')}
          </>
        )}
      </div>
    </Modal>
  );
};

export default InformeListaModal;
