import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export function LoginPage() {
  const { login, error, firebaseReady } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalErr(null);
    setLoading(true);
    try {
      await login(usuario, password);
      nav('/', { replace: true });
    } catch (err: unknown) {
      setLocalErr(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-700 via-teal-600 to-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-semibold text-slate-900">Fundación · Acceso</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Gestión de asistencia, reuniones y alertas
        </p>
        {!firebaseReady && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Configure las variables <code className="rounded bg-amber-100 px-1">VITE_FIREBASE_*</code> en{' '}
            <code className="rounded bg-amber-100 px-1">apps/web/.env</code> (copie desde{' '}
            <code className="rounded bg-amber-100 px-1">.env.example</code>).
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Correo (usuario)</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
              type="email"
              autoComplete="username"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-teal-500 focus:ring-2"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {(localErr || error) && (
            <p className="text-sm text-red-600">{localErr ?? error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !firebaseReady}
            className="w-full rounded-xl bg-teal-600 py-3 font-medium text-white shadow hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
