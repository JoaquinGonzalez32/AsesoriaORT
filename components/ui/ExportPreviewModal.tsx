import React, { useState } from 'react';
import Modal from './Modal';

interface ExportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  headers: string[];
  rows: string[][];
  filename: string;
}

const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  open, onClose, title, headers, rows, filename,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const buildCSV = () => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(','),
      ...rows.map(r => r.map(escape).join(',')),
    ];
    return lines.join('\n');
  };

  const handleDownload = () => {
    const csv = buildCSV();
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    setDownloaded(true);
  };

  const handleClose = () => {
    setDownloaded(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      subtitle={`${rows.length} registro${rows.length !== 1 ? 's' : ''}`}
      headerColor
      maxWidth="max-w-5xl"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={handleDownload}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloaded ? 'Descargado' : 'Descargar CSV'}
          </button>
        </>
      }
    >
      <div className="p-4 max-h-[60vh] overflow-auto">
        {rows.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium">No hay datos para exportar</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50">
                {headers.map((h, i) => (
                  <th key={i} className="text-left p-2.5 text-[10px] font-black text-gray-400 uppercase border-b border-gray-200 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-gray-50 hover:bg-gray-50/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2.5 text-gray-700 max-w-[200px] truncate" title={cell}>
                      {cell || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};

export default ExportPreviewModal;
