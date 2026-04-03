import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { QrScanner } from '@/components/QrScanner';
import { listReuniones, getReunion } from '@/services/reuniones';
import { getMadre, getMadrePorDocumento } from '@/services/madres';
import { getProfesionalPorDocumento } from '@/services/profesionales';
import {
  findAsistenciaMadreBloque,
  findAsistenciaProfesionalBloque,
  listAsistenciasPorReunion,
  upsertAsistencia,
} from '@/services/asistencias';
import { ejecutarAlertasPostRegistroMadre } from '@/services/automation';
import { parseQrPayload } from '@/lib/qr';
import type { Reunion, EstadoAsistenciaMadre, RegistroAsistencia } from '@/types/models';
import { logSistema } from '@/lib/logger';
import { useAuth } from '@/auth/AuthContext';
import { listProfesionales, type Profesional } from '@/services/profesionales';
import { registrarAlertaSiNueva } from '@/services/alertas';

export function TomarAsistenciaPage() {
  const { user } = useAuth();
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [reunion, setReunion] = useState<Reunion | null>(null);
  const [bloqueId, setBloqueId] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState('');
  const [motivoRetraso, setMotivoRetraso] = useState('');
  const [docManual, setDocManual] = useState('');
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [qrMadre, setQrMadre] = useState(false);
  const [qrProf, setQrProf] = useState(false);
  const [asistRows, setAsistRows] = useState<RegistroAsistencia[]>([]);

  useEffect(() => {
    void listReuniones().then(setReuniones);
    void listProfesionales().then(setProfesionales);
  }, []);

  useEffect(() => {
    if (!selId) {
      setReunion(null);
      return;
    }
    void getReunion(selId).then((r) => {
      setReunion(r);
      if (r?.bloques?.length) setBloqueId(r.bloques[0]!.id);
    });
  }, [selId]);

  useEffect(() => {
    if (!selId) {
      setAsistRows([]);
      return;
    }
    void listAsistenciasPorReunion(selId).then(setAsistRows);
  }, [selId]);

  async function refreshAsist() {
    if (selId) {
      setAsistRows(await listAsistenciasPorReunion(selId));
    }
  }

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return reuniones;
    return reuniones.filter(
      (r) =>
        r.nombre.toLowerCase().includes(t) ||
        (r.fecha && r.fecha.includes(t))
    );
  }, [q, reuniones]);

  const bloque = reunion?.bloques.find((b) => b.id === bloqueId);

  async function registrarMadre(estado: EstadoAsistenciaMadre, madreId: string) {
    if (!reunion || !bloque) return;
    const madre = await getMadre(madreId);
    if (!madre) {
      setMsg('Madre no encontrada');
      return;
    }
    if (!bloque.madresIds.includes(madreId)) {
      setMsg('Esta madre no pertenece al bloque seleccionado');
      return;
    }
    const prev = await findAsistenciaMadreBloque(reunion.id, bloque.id, madreId);
    const base: Omit<RegistroAsistencia, 'id' | 'fechaRegistro'> = {
      reunionId: reunion.id,
      bloqueId: bloque.id,
      tipo: 'madre',
      madreId,
      madreDocumento: madre.documento,
      estado,
      horaInicio: horaInicio || undefined,
      motivoRetraso: motivoRetraso || undefined,
    };
    await upsertAsistencia({ ...base, id: prev?.id });
    await refreshAsist();
    await ejecutarAlertasPostRegistroMadre({
      reunion,
      bloqueId: bloque.id,
      madreId,
      estado,
      uid: user?.uid,
    });
    setMsg(`Registrado: ${madre.nombreCompleto} → ${estado}`);
    await logSistema('asistencia', `Madre ${madre.documento} ${estado}`, 'info', user?.uid);
  }

  async function registrarProf(documento: string, presente: boolean) {
    if (!reunion || !bloque) return;
    const p = await getProfesionalPorDocumento(documento);
    if (!p) {
      setMsg('Profesional no encontrado');
      return;
    }
    const prev = await findAsistenciaProfesionalBloque(reunion.id, bloque.id, p.id);
    await upsertAsistencia({
      reunionId: reunion.id,
      bloqueId: bloque.id,
      tipo: 'profesional',
      profesionalId: p.id,
      profesionalDocumento: p.documento,
      estado: presente ? 'presente' : 'ausente',
      id: prev?.id,
      motivoNoAsiste: presente ? undefined : 'No asistió (registro manual)',
    });
    if (!presente) {
      await registrarAlertaSiNueva({
        tipo: 'grupo_interno',
        dedupeKey: `${reunion.id}_${bloque.id}_prof_${p.id}_ausente`,
        destinatarioTipo: 'profesional',
        destinatarioRef: p.id,
        mensaje: `Inasistencia profesional: ${p.nombre} en ${reunion.nombre}`,
        reunionId: reunion.id,
        bloqueId: bloque.id,
      });
    }
    await refreshAsist();
    setMsg(`Profesional ${p.nombre}: ${presente ? 'presente' : 'ausente'}`);
  }

  async function onQr(text: string) {
    setMsg(null);
    const p = parseQrPayload(text);
    if (!p) {
      setMsg('Código no válido');
      return;
    }
    if (p.tipo === 'MADRE') {
      const m = await getMadrePorDocumento(p.documento);
      if (!m) {
        setMsg('Documento no registrado como madre');
        return;
      }
      await registrarMadre('si', m.id);
    } else {
      await registrarProf(p.documento, true);
    }
  }

  const faltantesMadres = useMemo(() => {
    if (!reunion || !bloque) return [];
    return bloque.madresIds;
  }, [reunion, bloque]);

  const faltantesProfIds = useMemo(() => {
    if (!reunion || !bloque) return [];
    const regs = asistRows.filter(
      (a) => a.bloqueId === bloque.id && a.tipo === 'profesional' && a.profesionalId
    );
    const done = new Set(regs.map((a) => a.profesionalId!));
    return reunion.profesionalesIds.filter((id) => !done.has(id));
  }, [reunion, bloque, asistRows]);

  return (
    <Layout title="Tomar asistencia">
      <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
        ← Panel
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Búsqueda de reunión</h2>
          <input
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Nombre o fecha (AAAA-MM-DD)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-sm">
            {filtradas.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={`w-full rounded-lg px-2 py-2 text-left hover:bg-teal-50 ${selId === r.id ? 'bg-teal-100' : ''}`}
                  onClick={() => setSelId(r.id)}
                >
                  <span className="font-medium">{r.nombre}</span>
                  <span className="text-slate-500"> · {r.fecha}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {reunion && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Datos de la reunión</h2>
            <p className="mt-2 text-sm text-slate-700">{reunion.nombre}</p>
            <p className="text-sm text-slate-600">
              {reunion.fecha} {reunion.hora} · {reunion.participantesTipo}
            </p>
            <Link className="mt-2 inline-block text-sm text-teal-700 hover:underline" to={`/reunion/${reunion.id}/editar`}>
              Editar reunión
            </Link>
            <div className="mt-4">
              <label className="text-sm font-medium">Bloque</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={bloqueId}
                onChange={(e) => setBloqueId(e.target.value)}
              >
                {reunion.bloques.map((b, i) => (
                  <option key={b.id} value={b.id}>
                    Bloque {i + 1} — {b.fecha} {b.hora}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Hora de inicio (control)
                <input
                  type="time"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Motivo de retraso (si aplica)
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={motivoRetraso}
                  onChange={(e) => setMotivoRetraso(e.target.value)}
                />
              </label>
            </div>
          </section>
        )}
      </div>

      {reunion && bloque && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-teal-900">Madres del bloque</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                onClick={() => setQrMadre((v) => !v)}
              >
                {qrMadre ? 'Cerrar cámara (QR)' : 'QR con cámara'}
              </button>
            </div>
            {qrMadre && (
              <div className="mt-3">
                <QrScanner onScan={(t) => void onQr(t)} onError={(e) => setMsg(e)} />
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Documento (manual)"
                value={docManual}
                onChange={(e) => setDocManual(e.target.value)}
              />
              <button
                type="button"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm text-white"
                onClick={async () => {
                  const m = await getMadrePorDocumento(docManual);
                  if (!m) {
                    setMsg('No encontrada');
                    return;
                  }
                  await registrarMadre('si', m.id);
                  setDocManual('');
                }}
              >
                Registrar asistencia
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-600">
              Pendientes de marcar en este bloque:{' '}
              {bloque
                ? faltantesMadres.filter((mid) => {
                    const ok = asistRows.some(
                      (a) =>
                        a.bloqueId === bloque.id && a.tipo === 'madre' && a.madreId === mid
                    );
                    return !ok;
                  }).length
                : 0}
            </p>
            <ul className="mt-6 space-y-3">
              {faltantesMadres.map((mid) => (
                <MadreRow
                  key={mid}
                  mid={mid}
                  reunion={reunion}
                  bloqueId={bloque.id}
                  onSet={(est) => void registrarMadre(est, mid)}
                />
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Profesionales</h3>
            <button
              type="button"
              className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white"
              onClick={() => setQrProf((v) => !v)}
            >
              {qrProf ? 'Cerrar cámara (QR)' : 'Registro por QR'}
            </button>
            {qrProf && (
              <div className="mt-3">
                <QrScanner onScan={(t) => void onQr(t)} onError={(e) => setMsg(e)} />
              </div>
            )}
            <p className="mt-4 text-sm font-medium text-slate-800">Listado (vinculados a la reunión)</p>
            {faltantesProfIds.length > 0 && (
              <p className="mt-1 text-xs text-amber-800">
                Faltantes por registrar: {faltantesProfIds.length} profesional(es)
              </p>
            )}
            <ul className="mt-2 space-y-2 text-sm">
              {reunion.profesionalesIds.map((pid) => {
                const p = profesionales.find((x) => x.id === pid);
                if (!p) return null;
                return (
                  <li key={pid} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 px-2 py-2">
                    <span className="flex-1">
                      {p.nombre} · {p.documento}
                    </span>
                    <button
                      type="button"
                      className="rounded bg-teal-600 px-2 py-1 text-xs text-white"
                      onClick={() => void registrarProf(p.documento, true)}
                    >
                      Presente
                    </button>
                    <input
                      className="min-w-[120px] flex-1 rounded border px-2 py-1 text-xs"
                      placeholder="Motivo si no asiste"
                      id={`mot-${pid}`}
                    />
                    <button
                      type="button"
                      className="rounded bg-slate-200 px-2 py-1 text-xs"
                      onClick={() => {
                        const el = document.getElementById(`mot-${pid}`) as HTMLInputElement | null;
                        void (async () => {
                          const prev = await findAsistenciaProfesionalBloque(
                            reunion.id,
                            bloque.id,
                            p.id
                          );
                          await upsertAsistencia({
                            reunionId: reunion.id,
                            bloqueId: bloque.id,
                            tipo: 'profesional',
                            profesionalId: p.id,
                            profesionalDocumento: p.documento,
                            estado: 'ausente',
                            motivoNoAsiste: el?.value || 'Sin motivo',
                            id: prev?.id,
                          });
                          await registrarAlertaSiNueva({
                            tipo: 'grupo_interno',
                            dedupeKey: `${reunion.id}_${bloque.id}_prof_${p.id}_ausente_mot`,
                            destinatarioTipo: 'profesional',
                            destinatarioRef: p.id,
                            mensaje: `Ausencia: ${p.nombre}. Motivo: ${el?.value || '—'}`,
                            reunionId: reunion.id,
                            bloqueId: bloque.id,
                          });
                          await refreshAsist();
                          setMsg(`Ausencia registrada: ${p.nombre}`);
                        })();
                      }}
                    >
                      Ausente
                    </button>
                  </li>
                );
              })}
              {!reunion.profesionalesIds.length && (
                <li className="text-slate-500">No hay profesionales asignados a esta reunión.</li>
              )}
            </ul>
          </section>
        </div>
      )}

      {msg && <p className="mt-6 text-sm text-slate-800">{msg}</p>}
    </Layout>
  );
}

function MadreRow({
  mid,
  reunion,
  bloqueId,
  onSet,
}: {
  mid: string;
  reunion: Reunion;
  bloqueId: string;
  onSet: (e: EstadoAsistenciaMadre) => void;
}) {
  const [nombre, setNombre] = useState<string>('…');
  useEffect(() => {
    void getMadre(mid).then((m) => setNombre(m?.nombreCompleto ?? mid));
  }, [mid]);
  return (
    <li className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="font-medium text-slate-900">{nombre}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white"
          onClick={() => onSet('si')}
        >
          Sí
        </button>
        <button
          type="button"
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm text-white"
          onClick={() => onSet('no')}
        >
          No
        </button>
        <button
          type="button"
          className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm text-white"
          onClick={() => onSet('excusa')}
        >
          Tiene excusa
        </button>
      </div>
    </li>
  );
}
