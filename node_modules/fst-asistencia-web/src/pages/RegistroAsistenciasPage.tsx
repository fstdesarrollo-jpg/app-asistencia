import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { listReuniones, getReunion } from '@/services/reuniones';
import { listAsistenciasPorReunion } from '@/services/asistencias';
import { getMadre } from '@/services/madres';
import type { Reunion, RegistroAsistencia } from '@/types/models';
import { downloadExcelTitulo, downloadPdfTitulo, printWindowHtml } from '@/lib/export';

export function RegistroAsistenciasPage() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [reunion, setReunion] = useState<Reunion | null>(null);
  const [bloqueFiltro, setBloqueFiltro] = useState<string>('todos');
  const [rows, setRows] = useState<RegistroAsistencia[]>([]);

  useEffect(() => {
    void listReuniones().then(setReuniones);
  }, []);

  useEffect(() => {
    if (!selId) {
      setReunion(null);
      setRows([]);
      return;
    }
    void getReunion(selId).then(setReunion);
    void listAsistenciasPorReunion(selId).then(setRows);
  }, [selId]);

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return reuniones;
    return reuniones.filter(
      (r) => r.nombre.toLowerCase().includes(t) || (r.fecha && r.fecha.includes(t))
    );
  }, [q, reuniones]);

  const visibles = useMemo(() => {
    if (!reunion) return [];
    if (bloqueFiltro === 'todos') return rows;
    return rows.filter((r) => r.bloqueId === bloqueFiltro);
  }, [rows, bloqueFiltro, reunion]);

  async function filasTabla() {
    const out: string[][] = [
      ['Tipo', 'Estado', 'Documento', 'Bloque', 'Fecha registro'],
    ];
    for (const r of visibles) {
      let doc = '';
      if (r.tipo === 'madre' && r.madreId) {
        const m = await getMadre(r.madreId);
        doc = m?.documento ?? '';
      } else if (r.profesionalDocumento) {
        doc = r.profesionalDocumento;
      }
      out.push([r.tipo, String(r.estado), doc, r.bloqueId, r.fechaRegistro]);
    }
    return out;
  }

  async function exportPdf() {
    const lineas = await filasTabla();
    const suf = bloqueFiltro === 'todos' ? 'toda_la_reunion' : `bloque_${bloqueFiltro}`;
    downloadPdfTitulo(`Asistencias_${reunion?.nombre ?? 'reunion'}_${suf}`, lineas);
  }

  async function exportExcel() {
    const records = await Promise.all(
      visibles.map(async (r) => {
        let nombre = '';
        let doc = '';
        if (r.tipo === 'madre' && r.madreId) {
          const m = await getMadre(r.madreId);
          nombre = m?.nombreCompleto ?? '';
          doc = m?.documento ?? '';
        } else if (r.profesionalId) {
          nombre = 'Profesional';
          doc = r.profesionalDocumento ?? '';
        }
        return {
          Tipo: r.tipo,
          Estado: String(r.estado),
          Nombre: nombre,
          Documento: doc,
          Bloque: r.bloqueId,
          'Fecha registro': r.fechaRegistro,
        };
      })
    );
    downloadExcelTitulo(`Asistencias_${reunion?.nombre ?? 'reunion'}`, records);
  }

  async function imprimir() {
    const lineas = await filasTabla();
    const body =
      '<table><thead><tr>' +
      lineas[0]!.map((c) => `<th>${c}</th>`).join('') +
      '</tr></thead><tbody>' +
      lineas
        .slice(1)
        .map((row) => '<tr>' + row.map((c) => `<td>${c}</td>`).join('') + '</tr>')
        .join('') +
      '</tbody></table>';
    printWindowHtml('Registro de asistencias', body);
  }

  return (
    <Layout title="Registro de asistencias">
      <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
        ← Panel
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Buscar reunión</h2>
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Nombre o fecha"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="mt-3 max-h-56 overflow-auto text-sm">
            {filtradas.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg px-2 py-2 text-left hover:bg-teal-50 ${selId === r.id ? 'bg-teal-100' : ''}`}
                  onClick={() => setSelId(r.id)}
                >
                  {r.nombre} · {r.fecha}
                </button>
              </li>
            ))}
          </ul>
        </section>
        {reunion && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Ámbito de impresión / descarga</h2>
            <select
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              value={bloqueFiltro}
              onChange={(e) => setBloqueFiltro(e.target.value)}
            >
              <option value="todos">Toda la reunión</option>
              {reunion.bloques.map((b, i) => (
                <option key={b.id} value={b.id}>
                  Bloque {i + 1}
                </option>
              ))}
            </select>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                onClick={() => void imprimir()}
              >
                Imprimir
              </button>
              <button
                type="button"
                className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
                onClick={() => void exportPdf()}
              >
                PDF
              </button>
              <button
                type="button"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                onClick={() => void exportExcel()}
              >
                Excel
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-600">Registros mostrados: {visibles.length}</p>
          </section>
        )}
      </div>
    </Layout>
  );
}
