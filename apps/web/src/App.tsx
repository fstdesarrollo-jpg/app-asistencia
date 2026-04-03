import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NuevaReunionPage } from '@/pages/NuevaReunionPage';
import { TomarAsistenciaPage } from '@/pages/TomarAsistenciaPage';
import { RegistroAsistenciasPage } from '@/pages/RegistroAsistenciasPage';
import { RegistroAlertasPage } from '@/pages/RegistroAlertasPage';
import { AlertasReunionPage } from '@/pages/AlertasReunionPage';
import { AdminMadresPage } from '@/pages/AdminMadresPage';
import { AdminProfesionalesPage } from '@/pages/AdminProfesionalesPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, profileError, firebaseReady, logout } = useAuth();
  if (!firebaseReady) {
    return <LoginPage />;
  }
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Cargando…
      </div>
    );
  }
  if (!user) {
    return <LoginPage />;
  }
  if (profileError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50 px-4 text-center">
        <p className="max-w-md text-amber-950">{profileError}</p>
        <button
          type="button"
          className="rounded-lg bg-amber-800 px-4 py-2 text-white"
          onClick={() => void logout()}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reunion/nueva"
        element={
          <RequireAuth>
            <NuevaReunionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/reunion/:id/editar"
        element={
          <RequireAuth>
            <NuevaReunionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/asistencia"
        element={
          <RequireAuth>
            <TomarAsistenciaPage />
          </RequireAuth>
        }
      />
      <Route
        path="/registro-asistencias"
        element={
          <RequireAuth>
            <RegistroAsistenciasPage />
          </RequireAuth>
        }
      />
      <Route
        path="/registro-alertas"
        element={
          <RequireAuth>
            <RegistroAlertasPage />
          </RequireAuth>
        }
      />
      <Route
        path="/alertas-reunion"
        element={
          <RequireAuth>
            <AlertasReunionPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/madres"
        element={
          <RequireAuth>
            <AdminMadresPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/profesionales"
        element={
          <RequireAuth>
            <AdminProfesionalesPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
