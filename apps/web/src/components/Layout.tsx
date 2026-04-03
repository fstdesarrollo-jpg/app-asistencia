import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { useState, type ReactNode } from 'react';

export function Layout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { logout, profile } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/80 to-slate-50 font-[family-name:var(--font-sans)]">
      <header className="sticky top-0 z-40 border-b border-teal-100/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-teal-800 md:hidden"
              aria-label="Menú"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-lg font-semibold tracking-tight text-teal-900">
              FST · {title}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">
              {profile?.nombre ?? profile?.email} ·{' '}
              <span className="font-medium capitalize text-teal-800">{profile?.role}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                void logout().then(() => nav('/login'));
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <Link className="block py-2 text-teal-800" to="/" onClick={() => setOpen(false)}>
              Dashboard
            </Link>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
