import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { MUNICIPIOS_ALERTA } from '@/types/models';
import { programarAlerta, registrarAlertaSiNueva } from '@/services/alertas';
import { listProfesionales } from '@/services/profesionales';
import { logSistema } from '@/lib/logger';
import { useAuth } from '@/auth/AuthContext';

export function AlertasReunionPage() {
  const { user } = useAuth();
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [mun, setMun] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  function toggleM(m: string) {
    setMun((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  async function programar() {
    setMsg(null);
    await programarAlerta({ fecha, hora, municipios: mun });
    await logSistema('alerta_reunion', `Programada ${fecha} ${hora}`, 'info', user?.uid);
    setMsg('Alerta programada (registro en sistema).');
  }

  async function enviarAhora() {
    setMsg(null);
    await registrarAlertaSiNueva({
      tipo: 'reunion_programada',
      dedupeKey: `manual_${Date.now()}`,
      destinatarioTipo: 'coordinadora',
      mensaje: `Alerta inmediata — municipios: ${mun.join(', ') || 'todos'} — ${fecha} ${hora}`,
      metadata: { municipios: mun.join(',') },
    });
    await logSistema('alerta_reunion', 'Envío manual inmediato', 'info', user?.uid);
    setMsg('Alerta registrada (simulación de envío inmediato).');
  }

  async function enviarProfesionales() {
    setMsg(null);
    const pros = await listProfesionales();
    let n = 0;
    for (const p of pros) {
      if (mun.length && !mun.includes(p.municipio)) continue;
      const ok = await registrarAlertaSiNueva({
        tipo: 'grupo_interno',
        dedupeKey: `prof_${p.id}_${fecha}_${hora}`,
        destinatarioTipo: 'profesional',
        destinatarioRef: p.id,
        mensaje: `Aviso de reunión/alerta para ${p.nombre} (${p.municipio}). Fecha: ${fecha} Hora: ${hora}`,
      });
      if (ok) n++;
    }
    await logSistema('alerta_reunion', `Enviado a ${n} profesionales`, 'info', user?.uid);
    setMsg(`Notificaciones generadas para ${n} profesionales (filtrado por municipio si aplica).`);
  }

  return (
    <Layout title="Alertas de reunión">
      <Link to="/" className="text-sm font-medium text-teal-800 hover:underline">
        ← Panel
      </Link>
      <section className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Programar envío de alertas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Fecha
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Hora
            <input
              type="time"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-800">Municipios</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            {MUNICIPIOS_ALERTA.map((m) => (
              <label key={m} className="flex items-center gap-2">
                <input type="checkbox" checked={mun.includes(m)} onChange={() => toggleM(m)} />
                {m}
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white"
            onClick={() => void programar()}
          >
            Programar alerta
          </button>
          <button
            type="button"
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            onClick={() => void enviarAhora()}
          >
            Enviar ahora
          </button>
          <button
            type="button"
            className="rounded-xl border border-teal-200 px-4 py-2 text-sm font-medium text-teal-900"
            onClick={() => void enviarProfesionales()}
          >
            Enviar a profesionales
          </button>
        </div>
        {msg && <p className="mt-4 text-sm text-teal-900">{msg}</p>}
        <p className="mt-4 text-xs text-slate-500">
          Los envíos reales (SMS, correo, WhatsApp) se conectan en producción vía Cloud Functions y
          proveedores; aquí se registran en Firestore con trazabilidad y anti-duplicados.
        </p>
      </section>
    </Layout>
  );
}
