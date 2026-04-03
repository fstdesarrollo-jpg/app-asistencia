import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { RegistroAsistencia } from '@/types/models';
import { format } from 'date-fns';

export function downloadPdfTitulo(titulo: string, lineas: string[][]): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: lineas.length ? [lineas[0]!] : undefined,
    body: lineas.length > 1 ? lineas.slice(1) : lineas,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 148, 136] },
  });
  doc.save(`${slug(titulo)}.pdf`);
}

export function downloadExcelTitulo(titulo: string, rows: Record<string, string | number>[]): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${slug(titulo)}.xlsx`);
}

export function asistenciasToRows(
  registros: RegistroAsistencia[],
  extra: (r: RegistroAsistencia) => Record<string, string>
): Record<string, string>[] {
  return registros.map((r) => ({
    Tipo: r.tipo,
    Estado: String(r.estado),
    Reunión: r.reunionId,
    Bloque: r.bloqueId,
    'Fecha registro': formatFecha(r.fechaRegistro),
    ...extra(r),
  }));
}

function formatFecha(iso: string): string {
  try {
    return format(new Date(iso), 'dd/MM/yyyy HH:mm');
  } catch {
    return iso;
  }
}

function slug(s: string): string {
  return s.replace(/[^\w-]+/g, '_').slice(0, 80);
}

export function printWindowHtml(title: string, bodyHtml: string): void {
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(
    `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:system-ui;padding:16px;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ccc;padding:6px;font-size:12px;}</style></head><body><h2>${title}</h2>${bodyHtml}</body></html>`
  );
  w.document.close();
  w.focus();
  w.print();
}
