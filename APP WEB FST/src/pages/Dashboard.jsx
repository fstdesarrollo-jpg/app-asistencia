import { useState } from 'react';
import { Users, Calendar, Clock, Bell, LogOut, Menu, BookOpen, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  // Simulador de privilegios para la Fase 1
  const [rolActual, setRolActual] = useState('Administrador');
  const esBasico = rolActual === 'Profesional';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-white font-bold text-xl tracking-tight">Fundación Somos Todos FST</h2>
          <p className="text-sm text-slate-500 mt-1">Panel Administrativo</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 flex flex-col">
          {!esBasico && (
             <div className="mb-4">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">Base de Datos VIP</p>
               <button onClick={() => navigate('/gestor-madres')} className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors w-full text-left">
                 <BookOpen className="w-5 h-5 text-accent-500" /> Directorio Madres
               </button>
               <div className="h-px bg-slate-800 my-4 mx-3 opacity-50" />
             </div>
          )}
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 flex-none">Panel de Reuniones FST</p>
          <button onClick={() => navigate('/nueva-reunion')} className="flex items-center gap-3 px-3 py-2 bg-primary-600 text-white rounded-lg shadow-md shadow-primary-600/20 w-full text-left flex-none hover:bg-black transition-colors">
            <Calendar className="w-5 h-5" /> Nueva Reunión
          </button>
          <button onClick={() => navigate('/asistencia')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 hover:text-white w-full rounded-lg transition-colors text-left">
            <Clock className="w-5 h-5" /> Tomar Asistencia (Escáner)
          </button>
          <button onClick={() => navigate('/registro-asistencias')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 hover:text-white w-full rounded-lg transition-colors text-left">
            <Users className="w-5 h-5" /> Registro Asistencias
          </button>
          <button onClick={() => navigate('/registro-alertas')} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 text-slate-300 hover:text-white w-full rounded-lg transition-colors text-left">
            <Bell className="w-5 h-5" /> Trazabilidad y Alertas
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => navigate('/login')} className="flex items-center gap-3 px-3 py-2 w-full hover:bg-slate-800 rounded-lg transition-colors text-red-400">
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:justify-end">
          <button className="md:hidden text-slate-500">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex bg-slate-100 rounded-lg p-1 gap-1 border border-slate-200 shadow-inner">
               <button onClick={() => setRolActual('Administrador')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Administrador' ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:bg-slate-200'}`}>Admin</button>
               <button onClick={() => setRolActual('Coordinadora Técnica')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinadora Técnica' ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:bg-slate-200'}`}>Técnica</button>
               <button onClick={() => setRolActual('Coordinador')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinador' ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:bg-slate-200'}`}>Coordinador</button>
               <button onClick={() => setRolActual('Profesional')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Profesional' ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:bg-slate-200'}`}>Profesional</button>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200 shrink-0">
              {rolActual.charAt(0)}
            </div>
            <span className="font-bold text-slate-700 hidden md:block">{rolActual}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Panel Virtual FST</h1>
          <p className="text-slate-500 mb-8 pb-4 border-b border-slate-200">Nivel de seguridad activado: <strong className="text-primary-600">{rolActual}</strong> {esBasico && <span className="text-red-500 ml-2">(Funciones base de datos restingidas)</span>}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(rolActual === 'Administrador' || rolActual === 'Coordinador' || rolActual === 'Coordinadora Técnica') && (
             <div onClick={() => navigate('/gestor-personal')} className="bg-gradient-to-br from-slate-900 to-black text-white p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center hover:scale-[1.02] transition-transform cursor-pointer col-span-1 md:col-span-2 lg:col-span-4 gap-6 mb-2 border border-slate-700">
               <div className="w-16 h-16 bg-accent-500/20 rounded-full flex items-center justify-center shrink-0 border border-accent-500/50">
                 <ShieldAlert className="w-8 h-8 text-accent-500" />
               </div>
               <div className="text-center md:text-left flex-1">
                 <h3 className="font-bold text-xl mb-1 text-accent-400">Bóveda Suprema: Gestión de Personal FST</h3>
                 <p className="text-sm text-slate-300 leading-relaxed">Módulo seguro de administración de personal operativo. Alta de usuarios, gestión zonal y encriptación. Restringido para profesionales.</p>
               </div>
             </div>
            )}
            
            {!esBasico && (
             <div onClick={() => navigate('/gestor-madres')} className="bg-primary-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center hover:scale-[1.02] transition-transform cursor-pointer col-span-1 md:col-span-2 lg:col-span-4 gap-6 mb-4">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                 <BookOpen className="w-8 h-8 text-primary-200" />
               </div>
               <div className="text-center md:text-left flex-1">
                 <h3 className="font-bold text-xl mb-1">Directorio de Madres Sustitutas</h3>
                 <p className="text-sm text-primary-200 leading-relaxed">Módulo con privilegios de administrador. Gestione, edite o retire madres. Cualquier modificación disparará una alerta técnica operativa de seguridad.</p>
               </div>
             </div>
            )}
            
            <div className="col-span-1 md:col-span-2 lg:col-span-4 border-b-2 border-slate-300 mt-2 pb-2">
               <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Panel de Reuniones FST</h2>
               <p className="text-sm text-slate-500">Gestión operativa, planeación integral y control de faltas.</p>
            </div>

            <div onClick={() => navigate('/nueva-reunion')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Nueva Reunión</h3>
              <p className="text-sm text-slate-500 mt-2">Crear y programar bloques</p>
            </div>

            <div onClick={() => navigate('/asistencia')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Tomar Asistencia</h3>
              <p className="text-sm text-slate-500 mt-2">Cámara QR o modo manual</p>
            </div>

            <div onClick={() => navigate('/registro-asistencias')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Asistencias</h3>
              <p className="text-sm text-slate-500 mt-2">Actas, planillas y reportes FST</p>
            </div>

            <div onClick={() => navigate('/registro-alertas')} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer hover:border-accent-300">
              <div className="w-12 h-12 bg-red-100 text-accent-600 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800">Trazabilidad Alertas</h3>
              <p className="text-sm text-slate-500 mt-2">Llamados 1, 2 y 3. Histórico de faltas.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
