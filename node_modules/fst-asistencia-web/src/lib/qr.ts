export function encodeQrMadre(documento: string): string {
  return `FST|MADRE|${documento.trim()}`;
}

export function encodeQrProfesional(documento: string): string {
  return `FST|PROF|${documento.trim()}`;
}

export function parseQrPayload(raw: string): { tipo: 'MADRE' | 'PROF'; documento: string } | null {
  const t = raw.trim();
  const parts = t.split('|');
  if (parts.length >= 3 && parts[0] === 'FST') {
    const tipo = parts[1];
    const documento = parts.slice(2).join('|');
    if ((tipo === 'MADRE' || tipo === 'PROF') && documento) {
      return { tipo, documento };
    }
  }
  const digits = t.replace(/\D/g, '');
  if (digits.length >= 5) return { tipo: 'MADRE', documento: digits };
  return null;
}
