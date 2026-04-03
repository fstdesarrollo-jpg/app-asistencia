import { useState } from 'react';
import { UserPlus, Search, ShieldAlert, KeyRound, Building2, Trash2, ShieldCheck, Mail, MapPin, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GestorPersonal() {
  const navigate = useNavigate();
  
  // Simulador de privilegios para la Fase 1
  const [rolActual, setRolActual] = useState('Administrador');
  const esAdmin = rolActual === 'Administrador';

  // Mock data representing Staff
  const [personal, setPersonal] = useState([
    { id: 1, nombre: 'Ana María Osorio', documento: '11112222', correo: 'ana@fst.com', municipio: 'Ibagué', equipo: 'Zonal 1', cargo: 'Coordinadora Zonal', rol: 'Coordinador', password: null, estado: 'Pendiente' },
    { id: 2, nombre: 'Julián Camilo Reyes', documento: '33334444', correo: 'julian@fst.com', municipio: 'Lérida', equipo: 'Zonal 2', cargo: 'Profesional Psicosocial', rol: 'Profesional', password: null, estado: 'Pendiente' },
    { id: 3, nombre: 'Marta Helena Restrepo', documento: '55556666', correo: 'marta@fst.com', municipio: 'Planadas', equipo: 'Zonal 3', cargo: 'Técnica de Operaciones', rol: 'Coordinadora Técnica', password: '948271', estado: 'Activo' },
  ]);

  const [notificacion, setNotificacion] = useState(null);

  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 5000);
  };

  const eliminarPersonal = (id, nombre) => {
    if (window.confirm(`🚧 ¡ALERTA DE SEGURIDAD EXTREMA! 🚧\n\n¿Estás absolutamente segura de REVOCAR EL ACCESO INMEDIATO a ${nombre}?\n\nEsta persona ya no podrá entrar a la aplicación ni registrar datos.`)) {
      setPersonal(personal.filter(p => p.id !== id));
      mostrarNotificacion(`Acceso revocado definitivamente para ${nombre}. Su credencial ha sido destruida del sistema.`);
    }
  };

  const agregarPersonal = () => {
    const nombre = window.prompt(`Paso 1/7: Escribe el NOMBRE COMPLETO del trabajador:`);
    if (!nombre) return;
    
    const doc = window.prompt(`Paso 2/7: Escribe el NÚMERO DE DOCUMENTO (Será su Usuario):\n\nTrabajador: ${nombre}`);
    if (!doc) return;

    const correo = window.prompt(`Paso 3/7: Escribe el CORREO ELECTRÓNICO (Se usará para enviar su contraseña):\n\nTrabajador: ${nombre}`);
    if (!correo) return;

    const cargo = window.prompt(`Paso 4/7: Escribe el CARGO (Ej: Psicólogo, Trabajador Social, etc):\n\nTrabajador: ${nombre}`);
    if (!cargo) return;

    const municipio = window.prompt(`Paso 5/7: Escribe el MUNICIPIO ASIGNADO (Ej: Ibagué, Lérida, Chaparral):\n\nTrabajador: ${nombre}`);
    if (!municipio) return;

    const equipo = window.prompt(`Paso 6/7: Escribe el NÚMERO DE EQUIPO ASIGNADO (Ej: Zonal 1, Zonal 2):\n\nTrabajador: ${nombre}`);
    if (!equipo) return;

    const rol = window.prompt('Paso Final (7/7): Asigna su ROL OPERATIVO de sistema.\n\nEscribe el número:\n1 = Profesional\n2 = Coordinador\n3 = Coordinadora Técnica', '1');
    if (!rol) return;
    
    let rolAsignado = 'Profesional';
    if(rol === '2') rolAsignado = 'Coordinador';
    if(rol === '3') rolAsignado = 'Coordinadora Técnica';

    setPersonal([...personal, { 
      id: Date.now(), 
      nombre, 
      documento: doc, 
      correo,
      municipio,
      equipo,
      cargo, 
      rol: rolAsignado, 
      password: null,
      estado: 'Pendiente'
    }]);

    mostrarNotificacion(`¡Alta de perfil exitosa! ${nombre} ha sido ingresado al sistema. Se ha enviado automáticamente una alerta al Administrador para que genere y autorice su contraseña.`);
  };

  const generarContrasena = (id, nombre, correo, yaTiene) => {
    if (yaTiene && !window.confirm(`⚠️ ${nombre} ya tiene una contraseña activa. ¿Estás seguro de que deseas REVOCAR la actual y enviarle una NUEVA contraseña por correo?`)) {
       return;
    }
    
    // Generador aleatorio numérico Fijo de 6 dígitos
    const nuevaClave = Math.floor(100000 + Math.random() * 900000).toString();
    
    setPersonal(personal.map(p => {
      if (p.id === id) {
        return { ...p, password: nuevaClave, estado: 'Activo' };
      }
      return p;
    }));
    
    alert(`🔑 LLAVE MAESTRA CREADA CON ÉXITO\n\nEl sistema FST ha generado automáticamente la clave de 6 dígitos segura para ${nombre}.\n\nNueva Clave: [ ${nuevaClave} ]\n\nSIMULACIÓN: El servidor acaba de enviar un correo a [${correo}] informando al profesional su nuevo acceso al Software FST.`);
    mostrarNotificacion(`Contraseña actualizada y correo enviado a ${correo}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex flex-col p-4 md:p-8 animate-fade-in relative max-w-7xl mx-auto w-full">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
           <div className="flex gap-3">
             <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
               <ArrowLeft className="w-4 h-4" /> Volver Atrás
             </button>
             <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
               <Home className="w-4 h-4" /> Panel de Inicio FST
             </button>
           </div>

           <div className="hidden lg:flex bg-white rounded-lg p-1 gap-1 border border-slate-300 shadow-sm flex-col md:flex-row items-center">
             <span className="text-[10px] font-black tracking-widest text-slate-400 mr-2 uppercase pl-2">Perfil Visualizador:</span>
             <button onClick={() => setRolActual('Administrador')} className={`px-3 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Administrador' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Súper Administrador</button>
             <button onClick={() => setRolActual('Coordinadora Técnica')} className={`px-3 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinadora Técnica' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Coord Técnica</button>
             <button onClick={() => setRolActual('Coordinador')} className={`px-3 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinador' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Coordinadora</button>
           </div>
         </div>
         
         {notificacion && (
            <div className="fixed top-4 right-4 bg-green-900 border-l-4 border-green-500 text-white p-4 rounded-xl shadow-2xl z-50 flex items-start gap-3 max-w-md animate-fade-in">
               <ShieldCheck className="w-6 h-6 text-green-400 shrink-0" />
               <div>
                 <h4 className="font-bold text-sm text-green-400 uppercase tracking-widest">Sistema Actualizado</h4>
                 <p className="text-sm text-slate-200 mt-1 leading-relaxed">{notificacion}</p>
               </div>
            </div>
         )}
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <ShieldAlert className={`w-8 h-8 ${esAdmin ? 'text-accent-500' : 'text-primary-600'}`} /> 
                Bóveda de Registro de Personal
              </h1>
              <p className="text-slate-500 mt-1 font-medium">{esAdmin ? "Modo Activo: Permisos Absolutos de Administrador / Activador de Accesos." : "Modo Operativo: Puedes agregar empleados, pero el Administrador validará su acceso final."}</p>
            </div>
            
            <button onClick={agregarPersonal} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 w-full md:w-auto hover:scale-105 border border-slate-700">
              <UserPlus className="w-5 h-5 text-accent-500" /> Añadir Nuevo Empleado FST
            </button>
         </div>

         {/* Información Estratégica Modificada */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-primary-300 transition-colors">
               <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                 <Building2 className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Criterio de Usuario Oficial</p>
                  <p className="text-sm font-black text-primary-800">DOCUMENTO DE IDENTIDAD</p>
               </div>
            </div>
            <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-colors ${esAdmin ? 'hover:border-amber-300' : 'opacity-70 grayscale'}`}>
               <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${esAdmin ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                 <KeyRound className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Activación de Accesos</p>
                  <p className={`text-sm font-black ${esAdmin ? 'text-amber-800' : 'text-slate-600'}`}>Solo Módulo Admnistrativo</p>
               </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-green-300 transition-colors">
               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Privacidad Bóveda</p>
                  <p className="text-sm font-black text-green-800">Sistema Inaccesible a Profesionales</p>
               </div>
            </div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 ${esAdmin ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
               <div className="relative w-full sm:w-96">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Buscar empleado por cédula o nombre..." className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-300 focus:border-primary-500 text-sm font-bold bg-white" />
               </div>
               {esAdmin ? (
                  <div className="flex items-center gap-2 text-sm text-accent-500 font-bold bg-black/50 px-4 py-2 rounded-lg shadow-inner">
                    <ShieldAlert className="w-5 h-5" /> ¡Sistema Activador Maestro Autorizado!
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-bold bg-slate-200 px-4 py-2 rounded-lg shadow-inner border border-slate-300">
                    <ShieldCheck className="w-5 h-5" /> Permisos Ocultos: Eres Coordinadora/Operativa.
                  </div>
               )}
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase tracking-widest">
                        <th className="p-4 font-black border-b border-slate-300 border-r border-slate-200">Empleado FST</th>
                        <th className="p-4 font-black border-b border-slate-300 border-r border-slate-200">Contacto y Zona Asignada</th>
                        <th className="p-4 font-black border-b border-slate-300 border-r border-slate-200">Usuario y Nivel FST</th>
                        {/* COLUMNA EXCLUSIVA PARA ADMIN: CONTRASEÑA */}
                        {esAdmin && (
                           <th className="p-4 font-black border-b text-amber-900 bg-amber-50 border-amber-200 border-r text-center">🔐 Llave de Acceso Secreta</th>
                        )}
                        <th className="p-4 font-black text-center border-b border-slate-300">Acciones Directas</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {personal.map((p) => (
                        <tr key={p.id} className="hover:bg-blue-50/40 transition-colors">
                           
                           {/* Empleado FST */}
                           <td className="p-4 border-r border-slate-200 align-top">
                              <p className="font-bold text-slate-800 text-base">{p.nombre}</p>
                              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">{p.cargo}</p>
                           </td>
                           
                           {/* Contacto y Zonal */}
                           <td className="p-4 border-r border-slate-200 align-top">
                              <p className="flex items-center gap-1.5 text-sm text-slate-700 mb-1"><Mail className="w-4 h-4 text-slate-400"/> {p.correo}</p>
                              <p className="flex items-center gap-1.5 text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded inline-flex border border-slate-200">
                                <MapPin className="w-4 h-4 text-slate-400"/> {p.municipio} <span className="font-bold ml-1 text-primary-700">({p.equipo})</span>
                              </p>
                           </td>

                           {/* Usuario FST */}
                           <td className="p-4 border-r border-slate-200 align-top">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Doc. Identidad / Usuario:</p>
                              <div className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm font-bold font-mono inline-block border border-slate-300 shadow-sm shadow-slate-200 mb-2">
                                {p.documento}
                              </div>
                              <div className="mt-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                  p.rol === 'Coordinadora Técnica' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                  p.rol === 'Coordinador' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  'bg-slate-100 text-slate-700 border-slate-300'
                                }`}>
                                  Rol: {p.rol}
                                </span>
                              </div>
                           </td>

                           {/* CONTRASEÑAS GESTIÓN (SOLO ADMIN) */}
                           {esAdmin && (
                              <td className="p-4 border-r border-slate-200 bg-amber-50/20 align-middle text-center">
                                {p.estado === 'Pendiente' ? (
                                   <div className="bg-amber-100 text-amber-800 px-3 py-2 rounded border border-amber-300 inline-flex flex-col items-center">
                                      <span className="font-bold text-xs uppercase animate-pulse mb-2">🟡 Esperando Clave</span>
                                      <button onClick={() => generarContrasena(p.id, p.nombre, p.correo, false)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md transition-colors whitespace-nowrap">
                                        Generar Nueva Clave
                                      </button>
                                   </div>
                                ) : (
                                   <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm inline-block">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-slate-100 pb-1">CLAVE ESTABLECIDA</p>
                                      <p className="font-mono text-xl font-black text-slate-800 tracking-widest bg-slate-100 px-2 py-1 rounded select-all">{p.password}</p>
                                   </div>
                                )}
                              </td>
                           )}

                           {/* ACCIONES DIRECTAS */}
                           <td className="p-4 align-middle">
                              <div className="flex flex-col items-center gap-3 w-full max-w-[150px] mx-auto">
                                 {/* Boton Regenerar si es Admin y ya tiene clave */}
                                 {esAdmin && p.estado === 'Activo' && (
                                   <button onClick={() => generarContrasena(p.id, p.nombre, p.correo, true)} className="flex items-center justify-center gap-2 px-3 py-2 text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all border border-slate-300 text-xs font-bold w-full shadow-sm" title="Revocar clave existente y enviar una nueva">
                                     <RefreshCw className="w-3 h-3" /> Reiniciar Clave
                                   </button>
                                 )}

                                 <button onClick={() => eliminarPersonal(p.id, p.nombre)} className="flex items-center justify-center gap-2 px-3 py-2 text-red-700 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-200 text-xs font-bold w-full shadow-sm" title="Bloquear Usuario Inmediatamente">
                                   <Trash2 className="w-4 h-4" /> Eliminar Perfil
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
