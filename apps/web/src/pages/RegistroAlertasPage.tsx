import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { searchMadresPorNombre, getMadrePorDocumento } from '@/services/madres';
import { listAsistenciasPorMadre, listAsistenciasPorDocumentoMadre } from '@/services/asistencias';
import { listAlertasPorMadre, listAlertasLog } from '@/services/alertas';
import type { AlertaLog, Madre, RegistroAsistencia } from '@/types/models';
import { contarInasistencias, progresoLlamados } from '@/lib/rollCall';
import { UMBRALES_LLAMADO } from '@/types/models';
import { downloadExcelTitulo, downloadPdfTitulo, printWindowHtml } from '@/lib/export';

export function RegistroAlertasPage() {
  const [qNombre, setQNombre] = useState('');
  const [qDoc, setQDoc] = useState('');
  const [madre, setMadre] = useState<Madre | null>(null);
  const [asist, setAsist] = useState<RegistroAsistencia[]>([]);
  const [alertas, setAlertas] = useState<AlertaLog[]>([]);
  const [todosLog, setTodosLog] = useState<AlertaLog[]>([]);

  useEffect(() => {
    void listAlertasLog(300).then(setTodosLog);
  }, []);

  async function buscar() {
    setMadre(null);
    setAsist([]);
    setAlertas([]);
    let m: Madre | null = null;
    if (qDoc.trim()) {
      m = await getMadrePorDocumento(qDoc);
    }
    if (!m && qNombre.trim()) {
      const list = await searchMadresPorNombre(qNombre);
      m = list[0] ?? null;
    }
    if (!m) return;
    setMadre(m);
    const a = await listAsistenciasPorMadre(m.id);
    const ad = await listAsistenciasPorDocumentoMadre(m.documento);
    const map = new Map<string, RegistroAsistencia>();
    for (const x of [...a, ...ad]) map.set(x.id, x);
    setAsist([...map.values()].sort((x, y) => (x.fechaRegistro < y.fechaRegistro ? 1 : -1)));
    setAlertas(await listAlertasPorMadre(m.id));
  }

  const inasistencias = useMemo(() => {
    const estados = asist
      .filter((x) => x.tipo === 'madre')
      .map((x) => x.estado as 'si' | 'no' | 'excusa');
    return contarInasistencias(estados);
  }, [asist]);

  const prog = useMemo(() => progresoLlamados(inasistencias), [inasistencias]);

  async function informePdf() {
    if (!madre) return;
    const lineas: string[][] = [
      ['Campo', 'Valor'],
      ['Nombre', madre.nombreCompleto],
      ['Documento', madre.documento],
      ['Inasistencias (conteo no)', String(inasistencias)],
      ['Progreso llamado', `Siguiente: ${prog.siguiente ?? '—'} · Faltan: ${prog.faltan}`],
    ];
    downloadPdfTitulo(`Informe_${madre.documento}`, lineas);
  }

  function informeExcel() {
    if (!madre) return;
    downloadExcelTitulo(`Informe_${madre.documento}`, [
      {
        Nombre: madre.nombreCompleto,
        Documento: madre.documento,
        Municipio: madre.municipio,
        Equipo: madre.numeroEquipo,
        Coordinación: madre.coordinacion,
        Inasistencias: inasistencias,
      },
    ]);
  }

  function imprimir() {
    if (!madre) return;
    printWindowHtml(
      'Informe de alertas y asistencia',
      `<p><strong>${madre.nombreCompleto}</strong> · ${madre.documento}</p>
       <p>Inasistencias acumuladas (estado "no"): ${inasistencias}</p>
       <p>Umbrales: ${UMBRALES_LLAMADO.join(', ')} — ${prog.siguiente ? `Faltan ${prog.faltan} para llamado ${prog.siguiente}` : 'Sin siguiente umbral'}</p>`
    );
  }

  const porTipo = useMemo(() => {
    const g = (t: AlertaLog['tipo']) => todosLog.filter((x) => x.tipo === t);
    return {
      asistencia: g('asistencia'),
      inasistencia: g('inasistencia'),
      excusa: g('excusa'),
      reunion: g('reunion_programada'),
    };
  }, [todosLog]);

  return (
    <Layout title="Registro de alertas">
      <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
        ← Panel
      </Link>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Buscar madre</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Nombre
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={qNombre}
              onChange={(e) => setQNombre(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Número de documento
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={qDoc}
              onChange={(e) => setQDoc(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => void buscar()}
        >
          Buscar
        </button>
      </section>

      {madre && (
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-teal-900">Informe</h3>
            <p className="mt-2 text-sm">
              <strong>{madre.nombreCompleto}</strong> — {madre.documento} · {madre.municipio} · Equipo{' '}
              {madre.numeroEquipo}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="text-xs uppercase text-slate-500">Progreso hacia llamado 1 ({UMBRALES_LLAMADO[0]})</div>
                <div className="font-medium">
                  {inasistencias < UMBRALES_LLAMADO[0]
                    ? `Faltan ${UMBRALES_LLAMADO[0] - inasistencias}`
                    : 'Umbral alcanzado'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="text-xs uppercase text-slate-500">Progreso hacia llamado 2 ({UMBRALES_LLAMADO[1]})</div>
                <div className="font-medium">
                  {inasistencias < UMBRALES_LLAMADO[1]
                    ? `Faltan ${UMBRALES_LLAMADO[1] - inasistencias}`
                    : 'Umbral alcanzado'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="text-xs uppercase text-slate-500">Progreso hacia llamado 3 ({UMBRALES_LLAMADO[2]})</div>
                <div className="font-medium">
                  {inasistencias < UMBRALES_LLAMADO[2]
                    ? `Faltan ${UMBRALES_LLAMADO[2] - inasistencias}`
                    : 'Umbral alcanzado'}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Resumen llamado al rol: {prog.siguiente ? `próximo hito llamado ${prog.siguiente} en ${prog.faltan} falta(s)` : 'Todos los umbrales superados'}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
                onClick={imprimir}
              >
                Imprimir informe
              </button>
              <button
                type="button"
                className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
                onClick={() => void informePdf()}
              >
                Descargar PDF
              </button>
              <button
                type="button"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                onClick={informeExcel}
              >
                Descargar Excel
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Historial de asistencias / inasistencias</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm">
              {asist.map((a) => (
                <li key={a.id} className="rounded border border-slate-100 px-2 py-2">
                  {a.fechaRegistro} · {a.estado} · Bloque {a.bloqueId}
                </li>
              ))}
              {!asist.length && <li className="text-slate-500">Sin registros.</li>}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold">Historial de alertas (esta madre)</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm">
              {alertas.map((a) => (
                <li key={a.id} className="rounded border border-slate-100 px-2 py-2">
                  <span className="font-medium">{a.tipo}</span> · {a.creadoEn}
                  <div className="text-slate-600">{a.mensaje}</div>
                </li>
              ))}
              {!alertas.length && <li className="text-slate-500">Sin alertas vinculadas por ID.</li>}
            </ul>
          </section>
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Historial global de alertas (muestra)</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <ListaTipo titulo="Por asistencia" items={porTipo.asistencia} />
          <ListaTipo titulo="Por inasistencia" items={porTipo.inasistencia} />
          <ListaTipo titulo="Por excusa" items={porTipo.excusa} />
          <ListaTipo titulo="Reunión programada" items={porTipo.reunion} />
        </div>
      </section>
    </Layout>
  );
}

function ListaTipo({ titulo, items }: { titulo: string; items: AlertaLog[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-800">{titulo}</h4>
      <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-slate-600">
        {items.slice(0, 20).map((a) => (
          <li key={a.id}>
            {a.creadoEn.slice(0, 16)} — {a.mensaje.slice(0, 80)}
            {a.mensaje.length > 80 ? '…' : ''}
          </li>
        ))}
        {!items.length && <li>Ninguna</li>}
      </ul>
    </div>
  );
}
