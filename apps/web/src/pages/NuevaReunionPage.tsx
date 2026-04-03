import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { listMadres, type Madre } from '@/services/madres';
import { listProfesionales, type Profesional } from '@/services/profesionales';
import {
  createReunion,
  getReunion,
  updateReunion,
  validarBloquesSinDuplicados,
} from '@/services/reuniones';
import type { BloqueReunion, ParticipantesTipo, Reunion } from '@/types/models';
import { logSistema } from '@/lib/logger';
import { useAuth } from '@/auth/AuthContext';

function nuevoBloque(): BloqueReunion {
  return {
    id: crypto.randomUUID(),
    fecha: '',
    hora: '',
    madresIds: [],
  };
}

export function NuevaReunionPage() {
  const { id } = useParams();
  const editId = id;
  const nav = useNavigate();
  const { user } = useAuth();

  const [madres, setMadres] = useState<Madre[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [responsable, setResponsable] = useState({ nombre: '', cargo: '', numeroEquipo: '' });
  const [profSel, setProfSel] = useState<string[]>([]);
  const [participantesTipo, setParticipantesTipo] = useState<ParticipantesTipo>('general');
  const [bloques, setBloques] = useState<BloqueReunion[]>([nuevoBloque()]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void listMadres().then(setMadres);
    void listProfesionales().then(setProfesionales);
  }, []);

  useEffect(() => {
    if (!editId) return;
    void getReunion(editId).then((r) => {
      if (!r) return;
      setNombre(r.nombre);
      setFecha(r.fecha);
      setHora(r.hora);
      setResponsable(r.responsable);
      setProfSel(r.profesionalesIds ?? []);
      setParticipantesTipo(r.participantesTipo);
      setBloques(r.bloques?.length ? r.bloques : [nuevoBloque()]);
    });
  }, [editId]);

  const asignadas = useMemo(() => {
    const s = new Set<string>();
    for (const b of bloques) for (const m of b.madresIds) s.add(m);
    return s.size;
  }, [bloques]);

  const totalMadres = madres.length;
  const faltantes = Math.max(0, totalMadres - asignadas);

  function toggleProf(pid: string) {
    setProfSel((prev) => (prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid]));
  }

  function toggleMadreEnBloque(bid: string, mid: string) {
    setBloques((prev) =>
      prev.map((b) => {
        if (b.id !== bid) {
          return { ...b, madresIds: b.madresIds.filter((x) => x !== mid) };
        }
        const has = b.madresIds.includes(mid);
        return {
          ...b,
          madresIds: has ? b.madresIds.filter((x) => x !== mid) : [...b.madresIds, mid],
        };
      })
    );
  }

  function madreDisponibleEnBloque(bloqueId: string, madreId: string): boolean {
    for (const b of bloques) {
      if (b.id === bloqueId) continue;
      if (b.madresIds.includes(madreId)) return false;
    }
    return true;
  }

  async function guardar() {
    setErr(null);
    const v = validarBloquesSinDuplicados(bloques);
    if (v) {
      setErr(v);
      return;
    }
    const payload: Omit<Reunion, 'id'> = {
      nombre,
      fecha,
      hora,
      responsable,
      profesionalesIds: profSel,
      participantesTipo,
      bloques,
    };
    setLoading(true);
    try {
      if (editId) {
        await updateReunion(editId, payload);
        await logSistema('reunion', `Editada reunión ${editId}`, 'info', user?.uid);
      } else {
        const newId = await createReunion(payload);
        await logSistema('reunion', `Creada reunión ${newId}`, 'info', user?.uid);
      }
      nav('/');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title={editId ? 'Editar reunión' : 'Nueva reunión'}>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
          ← Volver al panel
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Datos del responsable</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Nombre" value={responsable.nombre} onChange={(v) => setResponsable({ ...responsable, nombre: v })} />
              <Field label="Cargo" value={responsable.cargo} onChange={(v) => setResponsable({ ...responsable, cargo: v })} />
              <Field label="Número de equipo" value={responsable.numeroEquipo} onChange={(v) => setResponsable({ ...responsable, numeroEquipo: v })} />
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-800">Profesionales adicionales</h3>
              <p className="text-xs text-slate-500">Seleccione uno o varios del catálogo.</p>
              <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-slate-100 p-2">
                {profesionales.map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                    <input
                      type="checkbox"
                      checked={profSel.includes(p.id)}
                      onChange={() => toggleProf(p.id)}
                    />
                    <span>
                      {p.nombre} · {p.cargo}
                    </span>
                  </label>
                ))}
                {!profesionales.length && (
                  <p className="text-sm text-slate-500">No hay profesionales en el catálogo.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Datos de la reunión</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Nombre" value={nombre} onChange={setNombre} />
              <Field label="Fecha" type="date" value={fecha} onChange={setFecha} />
              <Field label="Hora" type="time" value={hora} onChange={setHora} />
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-slate-800">Participantes</span>
              <div className="mt-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pt"
                    checked={participantesTipo === 'general'}
                    onChange={() => setParticipantesTipo('general')}
                  />
                  General
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pt"
                    checked={participantesTipo === 'segmentada'}
                    onChange={() => setParticipantesTipo('segmentada')}
                  />
                  Segmentada
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Bloques de reunión</h2>
              <button
                type="button"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
                onClick={() => setBloques((b) => [...b, nuevoBloque()])}
              >
                Agregar bloque
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Una madre solo puede estar en un bloque. Si la selecciona en otro, se quita del anterior.
            </p>
            <div className="mt-4 space-y-6">
              {bloques.map((b, idx) => (
                <div key={b.id} className="rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-teal-900">Bloque {idx + 1}</span>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="rounded border border-slate-200 px-2 py-1 text-sm"
                        value={b.fecha}
                        onChange={(e) =>
                          setBloques((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, fecha: e.target.value } : x))
                          )
                        }
                      />
                      <input
                        type="time"
                        className="rounded border border-slate-200 px-2 py-1 text-sm"
                        value={b.hora}
                        onChange={(e) =>
                          setBloques((prev) =>
                            prev.map((x) => (x.id === b.id ? { ...x, hora: e.target.value } : x))
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 max-h-56 overflow-auto rounded-lg border border-white bg-white p-2">
                    {madres.map((m) => {
                      const checked = b.madresIds.includes(m.id);
                      const disponible = checked || madreDisponibleEnBloque(b.id, m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 py-1 text-sm ${!disponible ? 'opacity-40' : ''}`}
                        >
                          <input
                            type="checkbox"
                            disabled={!disponible}
                            checked={checked}
                            onChange={() => disponible && toggleMadreEnBloque(b.id, m.id)}
                          />
                          <span>
                            {m.nombreCompleto} · Doc. {m.documento}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => void guardar()}
              className="rounded-xl bg-teal-600 px-5 py-3 font-medium text-white shadow hover:bg-teal-700 disabled:opacity-50"
            >
              {editId ? 'Guardar cambios' : 'Guardar reunión'}
            </button>
            {editId && (
              <Link
                to="/"
                className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </Link>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-teal-900">Panel dinámico</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Bloques creados: <strong>{bloques.length}</strong></li>
              <li>Participantes asignados (madres): <strong>{asignadas}</strong></li>
              <li>Participantes sin asignar (aprox.): <strong>{faltantes}</strong></li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              “Faltantes” compara el total del catálogo con las madres ya colocadas en algún bloque.
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-teal-500 focus:ring-2"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
