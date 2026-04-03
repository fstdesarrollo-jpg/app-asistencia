import { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Mail, ShieldCheck, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GestorMadres() {
  const navigate = useNavigate();
  // Mock data representing Mothers
  const [madres, setMadres] = useState([
    { id: 1, nombre: 'Carmen Lucía Ramírez', documento: '1023456789', municipio: 'Ibagué', equipo: 'Equipo 1', correo: 'carmen.r@example.com' },
    { id: 2, nombre: 'María Esperanza Gómez', documento: '51892341', municipio: 'Lérida', equipo: 'Equipo 2', correo: 'maria.g@example.com' },
    { id: 3, nombre: 'Ana Rosa Pineda', documento: '34561239', municipio: 'Chaparral', equipo: 'Equipo 1', correo: 'ana.pineda@example.com' },
  ]);

  const [notificacion, setNotificacion] = useState(null);

  const simularNotificacion = (accion, nombre) => {
    setNotificacion(`Se envió una ALERTA por correo electrónico a la Súper Administradora y a la Coordinadora Técnica notificando sobre la ${accion} de: ${nombre}`);
    setTimeout(() => setNotificacion(null), 6000);
  };

  const eliminarMadre = (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre} del sistema?\n\n¡OJO! Esta acción será notificada inmediatamente a la Coordinación Técnica.`)) {
      setMadres(madres.filter(m => m.id !== id));
      simularNotificacion('eliminación', nombre);
    }
  };

  const editarMadre = (nombre) => {
    const promptNuevoEquipo = window.prompt(`Cambiar datos de ${nombre} \n\nEscribe el nuevo municipio, equipo o correo:`, 'Equipo 3 (Ibagué)');
    if (promptNuevoEquipo) {
       simularNotificacion('modificación de base de datos', nombre);
    }
  };
  
  const agregarMadre = () => {
    const nombre = window.prompt('Nombre completo de la nueva Madre Sustituta:');
    if (nombre) {
       setMadres([...madres, { id: Date.now(), nombre, documento: '12345678', municipio: 'Asignar', equipo: 'Asignar', correo: 'nuevo@mail.com'}]);
       simularNotificacion('inserción', nombre);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-fade-in relative max-w-6xl mx-auto w-full">
         <div className="flex gap-3 mb-6">
           <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
             <ArrowLeft className="w-4 h-4" /> Volver Atrás
           </button>
           <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
             <Home className="w-4 h-4" /> Panel de Inicio FST
           </button>
         </div>
         
         {notificacion && (
            <div className="fixed top-4 right-4 bg-slate-900 border-l-4 border-accent-500 text-white p-4 rounded-xl shadow-2xl z-50 flex items-start gap-3 max-w-md animate-fade-in">
               <Mail className="w-6 h-6 text-accent-500 shrink-0" />
               <div>
                 <h4 className="font-bold text-sm text-accent-500 uppercase">Aviso de Seguridad Enviado</h4>
                 <p className="text-sm text-slate-200 mt-1 leading-relaxed">{notificacion}</p>
               </div>
            </div>
         )}
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary-600" /> Directorio de Madres Sustitutas
              </h1>
              <p className="text-slate-500 mt-1">Módulo exclusivo para Administradores y Coordinadores</p>
            </div>
            <button onClick={agregarMadre} className="btn-premium flex items-center justify-center gap-2 px-6 w-full md:w-auto">
              <Plus className="w-5 h-5" /> Nueva Madre Sustituta
            </button>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50">
               <div className="relative w-full sm:w-96">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar por documento o nombre..." className="input-premium pl-10 w-full" />
               </div>
               <div className="flex items-center gap-2 text-sm text-primary-900 font-bold bg-primary-100 px-4 py-2 rounded-lg border border-primary-200 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-primary-600" /> Conexión Abierta de Alto Privilegio
               </div>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-slate-200">Madre Sustituta</th>
                        <th className="p-4 font-bold border-b border-slate-200">Documento</th>
                        <th className="p-4 font-bold hidden md:table-cell border-b border-slate-200">Municipio</th>
                        <th className="p-4 font-bold border-b border-slate-200">Equipo</th>
                        <th className="p-4 font-bold text-center border-b border-slate-200">Acciones Privilegiadas</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {madres.map((m) => (
                        <tr key={m.id} className="hover:bg-primary-50 transition-colors">
                           <td className="p-4">
                              <p className="font-bold text-slate-800">{m.nombre}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{m.correo}</p>
                           </td>
                           <td className="p-4 text-slate-600 font-mono text-sm">{m.documento}</td>
                           <td className="p-4 text-slate-600 hidden md:table-cell">{m.municipio}</td>
                           <td className="p-4">
                              <span className="bg-white text-primary-700 px-3 py-1 rounded-full text-xs font-bold border border-primary-200 shadow-sm">
                                {m.equipo}
                              </span>
                           </td>
                           <td className="p-4">
                              <div className="flex items-center justify-center gap-3">
                                 <button onClick={() => editarMadre(m.nombre)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Editar Información">
                                   <Edit2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => eliminarMadre(m.id, m.nombre)} className="p-2 text-slate-400 hover:text-accent-500 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Eliminar (Enviará Alerta)">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
