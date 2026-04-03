import { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Users, Save, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NuevaReunion() {
  const navigate = useNavigate();
  const [bloques, setBloques] = useState([{ id: 1, horaInicio: '', horaFin: '', participantes: [] }]);
  
  // Fake data for visualization
  const totalMadres = 120;
  const madresAsignadas = bloques.reduce((acc, curr) => acc + (curr.participantes ? curr.participantes.length : 0), 0);
  
  const agregarBloque = () => {
    setBloques([...bloques, { id: Date.now(), horaInicio: '', horaFin: '', participantes: [] }]);
  };

  const eliminarBloque = (id) => {
    if (bloques.length > 1) {
      setBloques(bloques.filter(b => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-fade-in relative max-w-5xl mx-auto w-full">
         <div className="flex gap-3 mb-6">
           <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
             <ArrowLeft className="w-4 h-4" /> Volver Atrás
           </button>
           <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
             <Home className="w-4 h-4" /> Panel de Inicio FST
           </button>
         </div>
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Crear Nueva Reunión</h1>
            <button className="btn-premium flex items-center justify-center gap-2 px-6 w-full md:w-auto">
              <Save className="w-5 h-5" /> Guardar Reunión
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" /> Información del Responsable
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Nombre Completo</label>
                       <input type="text" className="input-premium" placeholder="Ej. Carlos Martínez" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Cargo</label>
                       <input type="text" className="input-premium" placeholder="Profesional Psicosocial" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Número de Equipo</label>
                       <select className="input-premium">
                         <option>Equipo 1</option>
                         <option>Equipo 2</option>
                         <option>Equipo 3</option>
                       </select>
                     </div>
                  </div>
                  <button className="mt-4 text-primary-600 font-medium text-sm flex items-center gap-1 hover:text-primary-800 transition-colors">
                    <Plus className="w-4 h-4" /> Agregar otro profesional responsable
                  </button>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" /> Datos de la Reunión
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-slate-600 mb-1">Nombre o Tema de la Reunión</label>
                       <input type="text" className="input-premium" placeholder="Capacitación Módulo 1..." />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Fecha Programada</label>
                       <input type="date" className="input-premium" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de Participantes</label>
                       <select className="input-premium">
                         <option>Reunión General</option>
                         <option>Reunión Segmentada</option>
                       </select>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                       <Clock className="w-5 h-5 text-primary-500" /> División por Bloques
                     </h2>
                     <button onClick={agregarBloque} className="bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-primary-200">
                        <Plus className="w-4 h-4" /> Añadir Bloque
                     </button>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Alerta Inteligente: Una madre seleccionada en un bloque desaparecerá automáticamente de las opciones para otros bloques.
                  </p>
                  
                  <div className="space-y-4">
                    {bloques.map((b, index) => (
                      <div key={b.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                        <div className="flex justify-between items-start mb-3">
                           <h3 className="font-bold text-slate-700">Bloque {index + 1}</h3>
                           {bloques.length > 1 && (
                             <button onClick={() => eliminarBloque(b.id)} className="text-red-400 hover:text-red-600 p-1">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Inicio</label>
                             <input type="time" className="input-premium w-full text-sm" />
                           </div>
                           <div>
                             <label className="block text-xs font-semibold text-slate-500 mb-1">Hora Fin</label>
                             <input type="time" className="input-premium w-full text-sm" />
                           </div>
                           <div className="sm:col-span-2">
                             <label className="block text-xs font-semibold text-slate-500 mb-1">Seleccionar Madres (Escribe para buscar...)</label>
                             <input type="text" className="input-premium w-full text-sm" placeholder="Buscar por documento o nombre..." />
                             <div className="mt-2 flex flex-wrap gap-2">
                               <span className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                                 👩 Ana Rodríguez <button className="text-slate-400 hover:text-red-500">&times;</button>
                               </span>
                               <span className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                                 👩 María Gómez <button className="text-slate-400 hover:text-red-500">&times;</button>
                               </span>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <div className="lg:col-span-1">
               <div className="bg-primary-900 text-white p-6 rounded-2xl shadow-lg sticky top-8 border-t-4 border-accent-500">
                  <h3 className="font-bold text-lg mb-6 border-b border-primary-700 pb-4">Panel Dinámico FST</h3>
                  
                  <div className="space-y-6">
                     <div>
                       <p className="text-primary-300 text-sm mb-1 uppercase tracking-wider font-semibold">Bloques Creados</p>
                       <p className="text-4xl font-bold">{bloques.length}</p>
                     </div>
                     <div>
                       <p className="text-primary-300 text-sm mb-1 uppercase tracking-wider font-semibold">Participantes Asignados</p>
                       <p className="text-4xl font-bold">{madresAsignadas + 2}</p>
                     </div>
                     <div>
                       <p className="text-primary-300 text-sm mb-1 uppercase tracking-wider font-semibold">Participantes Faltantes</p>
                       <div className="flex items-center gap-3">
                         <p className="text-4xl font-bold text-accent-500">{totalMadres - (madresAsignadas + 2)}</p>
                         <AlertCircle className="text-accent-500 w-6 h-6" />
                       </div>
                       <p className="text-xs text-primary-400 mt-2">de un total de {totalMadres} madres activas</p>
                     </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-primary-700">
                     <p className="text-xs text-primary-300 text-center leading-relaxed">
                       Este panel calcula automáticamente las asistencias y previene que una madre esté en dos lugares al mismo tiempo.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
