import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  CalendarPlus,
  ClipboardCheck,
  ListChecks,
  BellRing,
  Users,
  UserCog,
} from 'lucide-react';
import { useIsAdmin } from '@/auth/AuthContext';

const cards = [
  { to: '/reunion/nueva', label: 'Nueva reunión', icon: CalendarPlus, desc: 'Crear bloques y participantes' },
  { to: '/asistencia', label: 'Tomar asistencia', icon: ClipboardCheck, desc: 'QR, manual y excusas' },
  { to: '/registro-asistencias', label: 'Registro de asistencias', icon: ListChecks, desc: 'Consulta e impresión' },
  { to: '/registro-alertas', label: 'Registro de alertas', icon: BellRing, desc: 'Historial e informes' },
  { to: '/alertas-reunion', label: 'Alertas de reunión', icon: BellRing, desc: 'Programar y enviar' },
];

export function DashboardPage() {
  const admin = useIsAdmin();

  return (
    <Layout title="Panel principal">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group flex gap-4 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-100">
              <c.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{c.label}</h2>
              <p className="text-sm text-slate-600">{c.desc}</p>
            </div>
          </Link>
        ))}
        {admin && (
          <>
            <Link
              to="/admin/madres"
              className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-teal-50">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Madres sustitutas</h2>
                <p className="text-sm text-slate-600">Catálogo (solo administrador)</p>
              </div>
            </Link>
            <Link
              to="/admin/profesionales"
              className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-teal-50">
                <UserCog className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Profesionales</h2>
                <p className="text-sm text-slate-600">Catálogo y roles internos de alerta</p>
              </div>
            </Link>
          </>
        )}
      </div>
    </Layout>
  );
}
