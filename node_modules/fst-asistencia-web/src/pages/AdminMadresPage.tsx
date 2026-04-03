import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import type { Madre } from '@/types/models';
import { createMadre, deleteMadre, listMadres, updateMadre } from '@/services/madres';
import { useIsAdmin } from '@/auth/AuthContext';
import { Navigate } from 'react-router-dom';

const empty: Omit<Madre, 'id'> = {
  nombreCompleto: '',
  documento: '',
  municipio: '',
  numeroEquipo: '',
  coordinacion: '',
};

export function AdminMadresPage() {
  const admin = useIsAdmin();
  const [rows, setRows] = useState<Madre[]>([]);
  const [form, setForm] = useState<Omit<Madre, 'id'>>(empty);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    void listMadres().then(setRows);
  }, []);

  if (!admin) return <Navigate to="/" replace />;

  async function guardar() {
    if (editId) {
      await updateMadre(editId, form);
    } else {
      await createMadre(form);
    }
    setForm(empty);
    setEditId(null);
    setRows(await listMadres());
  }

  function editar(m: Madre) {
    setEditId(m.id);
    setForm({
      nombreCompleto: m.nombreCompleto,
      documento: m.documento,
      municipio: m.municipio,
      numeroEquipo: m.numeroEquipo,
      coordinacion: m.coordinacion,
    });
  }

  return (
    <Layout title="Madres sustitutas">
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
          <h2 className="font-semibold">{editId ? 'Editar' : 'Nueva'} madre</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Nombre completo" v={form.nombreCompleto} onChange={(x) => setForm({ ...form, nombreCompleto: x })} />
            <Field label="Número de documento" v={form.documento} onChange={(x) => setForm({ ...form, documento: x })} />
            <Field label="Municipio" v={form.municipio} onChange={(x) => setForm({ ...form, municipio: x })} />
            <Field label="Número de equipo" v={form.numeroEquipo} onChange={(x) => setForm({ ...form, numeroEquipo: x })} />
            <Field label="Coordinación" v={form.coordinacion} onChange={(x) => setForm({ ...form, coordinacion: x })} />
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
          <ul className="mt-3 max-h-[480px] space-y-2 overflow-auto text-sm">
            {rows.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-2 py-2">
                <span>
                  {m.nombreCompleto} · {m.documento}
                </span>
                <span className="flex gap-2">
                  <button type="button" className="text-teal-700 hover:underline" onClick={() => editar(m)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    className="text-rose-600 hover:underline"
                    onClick={() => void deleteMadre(m.id).then(() => listMadres().then(setRows))}
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
