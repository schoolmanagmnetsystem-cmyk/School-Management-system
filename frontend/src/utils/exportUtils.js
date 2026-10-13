import { buildPdf } from './pdfGenerator';

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Download rows as a real RFC-4180 CSV file with a UTF-8 BOM for Excel.
 * @param {string} filename
 * @param {Array<Array<string|number>>} rows first row is treated as the header
 */
export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  downloadBlob(filename, new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
}

/**
 * Download a printable PDF built from plain text blocks.
 * @param {string} filename
 * @param {{title: string, subtitle?: string, blocks?: Array<{heading?: string, lines?: string[]}>}} doc
 */
export function downloadPdf(filename, doc) {
  const pdf = buildPdf(doc);
  downloadBlob(filename, new Blob([pdf], { type: 'application/pdf' }));
}

export function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}
