/**
 * Minimal dependency-free PDF generator (PDF 1.4, Type1 base fonts).
 * Produces a valid multi-page PDF with Helvetica text for printable reports.
 */

function escapeText(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?');
}

/**
 * @param {object} doc
 * @param {string} doc.title
 * @param {string} [doc.subtitle]
 * @param {Array<{heading?: string, lines?: string[]}>} [doc.blocks]
 * @returns {string} raw PDF bytes encoded as a latin1 string
 */
export function buildPdf({ title = '', subtitle = '', blocks = [] } = {}) {
  const pageW = 595;
  const pageH = 842;
  const margin = 50;
  const leading = 16;
  const titleSize = 18;

  const items = [];
  if (title) items.push({ text: title, size: titleSize, bold: true, gapAfter: 8 });
  if (subtitle) items.push({ text: subtitle, size: 10, bold: false, gapAfter: 14 });
  for (const block of blocks) {
    if (block.heading) items.push({ text: block.heading, size: 12, bold: true, gapBefore: 10, gapAfter: 4 });
    for (const line of block.lines || []) {
      items.push({ text: line, size: 11, bold: false });
    }
  }

  const pages = [];
  let current = [];
  let y = pageH - margin;
  const flush = () => {
    if (current.length) pages.push(current);
    current = [];
    y = pageH - margin;
  };

  for (const item of items) {
    if (item.gapBefore) y -= item.gapBefore;
    if (y - item.size < margin) flush();
    y -= item.size;
    const font = item.bold ? 'F2' : 'F1';
    current.push(
      `BT /${font} ${item.size} Tf 1 0 0 1 ${margin} ${y.toFixed(2)} Tm (${escapeText(item.text)}) Tj ET`
    );
    y -= leading - item.size + (item.gapAfter || 0);
  }
  flush();
  if (pages.length === 0) pages.push([]);

  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => 5 + i * 2).join(' ')}] /Count ${pages.length} >>`;
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  pages.forEach((lines, index) => {
    const pageObj = 5 + index * 2;
    const contentObj = pageObj + 1;
    const stream = lines.join('\n');
    objects[pageObj] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;
    objects[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 1; i < objects.length; i += 1) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  const count = objects.length - 1;
  pdf += `xref\n0 ${count + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= count; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

export default buildPdf;
