import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import type { Profesional, RolInterno } from '@/types/models';
import { createProfesional, deleteProfesional, listProfesionales, updateProfesional } from '@/services/profesionales';
import { useIsAdmin } from '@/auth/AuthContext';

const empty: Omit<Profesional, 'id'> = {
  nombre: '',
  documento: '',
  cargo: '',
  municipio: '',
  numeroEquipo: '',
  coordinacion: '',
  rolInterno: null,
};

export function AdminProfesionalesPage() {
  const admin = useIsAdmin();
  const [rows, setRows] = useState<Profesional[]>([]);
  const [form, setForm] = useState<Omit<Profesional, 'id'>>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    void listProfesionales().then(setRows);
  }, []);

  if (!admin) return <Navigate to="/" replace />;

  async function guardar() {
    if (editId) {
      await updateProfesional(editId, form);
    } else {
      await createProfesional(form);
    }
    setForm(empty);
    setEditId(null);
    setRows(await listProfesionales());
  }

  function editar(p: Profesional) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      documento: p.documento,
      cargo: p.cargo,
      municipio: p.municipio,
      numeroEquipo: p.numeroEquipo,
      coordinacion: p.coordinacion,
      rolInterno: p.rolInterno ?? null,
    });
  }

  return (
    <Layout title="Profesionales">
      <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
        ← Panel
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <form
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            void guardar();
          }}
        >
          <h2 className="font-semibold">{editId ? 'Editar' : 'Nuevo'} profesional</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Nombre" v={form.nombre} onChange={(x) => setForm({ ...form, nombre: x })} />
            <Field label="Número de documento" v={form.documento} onChange={(x) => setForm({ ...form, documento: x })} />
            <Field label="Cargo" v={form.cargo} onChange={(x) => setForm({ ...form, cargo: x })} />
            <Field label="Municipio" v={form.municipio} onChange={(x) => setForm({ ...form, municipio: x })} />
            <Field label="Número de equipo" v={form.numeroEquipo} onChange={(x) => setForm({ ...form, numeroEquipo: x })} />
            <Field label="Coordinación" v={form.coordinacion} onChange={(x) => setForm({ ...form, coordinacion: x })} />
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Rol interno (alertas)</span>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.rolInterno ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rolInterno: (e.target.value || null) as RolInterno,
                  })
                }
              >
                <option value="">— Ninguno —</option>
                <option value="equipo_psicosocial">Equipo psicosocial</option>
                <option value="coordinadora">Coordinadora</option>
                <option value="coordinadora_tecnica">Coordinadora técnica</option>
              </select>
            </label>
          </div>
          <button type="submit" className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white">
            Guardar
          </button>
          {editId && (
            <button
              type="button"
              className="ml-2 mt-4 text-sm text-slate-600"
              onClick={() => {
                setEditId(null);
                setForm(empty);
              }}
            >
              Cancelar edición
            </button>
          )}
        </form>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Listado</h2>
          <ul className="mt-3 max-h-[520px] space-y-2 overflow-auto text-sm">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-2 py-2">
                <span>
                  {p.nombre} · {p.cargo}
                  {p.rolInterno ? <span className="text-xs text-teal-700"> · {p.rolInterno}</span> : null}
                </span>
                <span className="flex gap-2">
                  <button type="button" className="text-teal-700 hover:underline" onClick={() => editar(p)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-rose-600 hover:underline"
                    onClick={() => void deleteProfesional(p.id).then(() => listProfesionales().then(setRows))}
                  >
                    Eliminar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}

function Field({
  label,
  v,
  onChange,
}: {
  label: string;
  v: string;
  onChange: (x: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 w-full rounded-lg border px-3 py-2"
        value={v}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
