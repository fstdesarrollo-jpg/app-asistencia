import { useState } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegistroAlertas() {
  const navigate = useNavigate();
  // Simulador local de privilegios para la Trazabilidad
  const [rolActual, setRolActual] = useState('Profesional');

  // Mock data basado al pie de la letra en los requerimientos
  const [datos, setDatos] = useState([
    { 
      id: 1, 
      nombre: 'Sandra Milena Orozco', 
      documento: '102345', 
      municipio: 'Ibagué', 
      equipo: 'Zonal 1', 
      coordinadora: 'Coord. Lic. Valeria Torres',
      faltas: [
        { fecha: '12-Oct-2026', taller: 'Taller de Crianza', dictadoPor: 'Psic. Carlos Ruiz' },
        { fecha: '20-Oct-2026', taller: 'Taller de Prevención', dictadoPor: 'Nutr. María José' },
        { fecha: '05-Nov-2026', taller: 'Taller de Nutrición', dictadoPor: 'Psic. Ana Osorio' },
        { fecha: '15-Nov-2026', taller: 'Taller de Vínculos', dictadoPor: 'TS. Juan Diego' } // 4 faltas = inicia Naranja
      ],
      excusas: [
        { fecha: '01-Sep-2026', motivo: 'Cita Médica', redactadoPor: 'Profesional Ana María Osorio' }
      ], 
      correos: [
        { fecha: '13-Oct-2026', tipo: 'Alerta por no asistir' },
        { fecha: '02-Sep-2026', tipo: 'Recibido en caso de presentar excusa' }
      ],
      llamado: { 
        paraLlamado: 'Sí', 
        seHizoLlamado: 'No', 
        diasRetraso: 2, 
        profesional: '', 
        fechaLlamado: '' 
      }
    },
    { 
      id: 2, 
      nombre: 'Diana Patricia Ruiz', 
      documento: '543128', 
      municipio: 'Lérida', 
      equipo: 'Zonal 2', 
      coordinadora: 'Coord. Lérida Marcela Silva',
      faltas: [
        { fecha: '15-Sep-2026', taller: 'Taller de Pedagogía', dictadoPor: 'Lic. Laura Mora' },
        { fecha: '10-Oct-2026', taller: 'Taller de Primeros Auxilios', dictadoPor: 'Enf. Camila Soto' } // 2 faltas = progresa Amarillo
      ], 
      excusas: [], 
      correos: [
        { fecha: '16-Sep-2026', tipo: 'Alerta por no asistir' },
        { fecha: '11-Oct-2026', tipo: 'Alerta por no asistir' }
      ],
      llamado: { paraLlamado: 'No', seHizoLlamado: 'No', diasRetraso: 0, profesional: '', fechaLlamado: '' }
    },
    { 
      id: 3, 
      nombre: 'Carmen Eugenia Santos', 
      documento: '981242', 
      municipio: 'Ibagué', 
      equipo: 'Zonal 1', 
      coordinadora: 'Coord. Lic. Valeria Torres',
      faltas: [], 
      excusas: [], 
      correos: [
        { fecha: '15-Sep-2026', tipo: 'Correo de agradecimiento en caso de asistir' }
      ],
      llamado: { paraLlamado: 'No', seHizoLlamado: 'No', diasRetraso: 0, profesional: '', fechaLlamado: '' }
    },
    { 
      id: 4, 
      nombre: 'Rosa María López', 
      documento: '112233', 
      municipio: 'Chaparral', 
      equipo: 'Zonal 3', 
      coordinadora: 'Coord. Paula Restrepo',
      faltas: [
        { fecha: '01-Ago', taller: 'T1', dictadoPor: 'Psic. Camilo Reyes' }, { fecha: '15-Ago', taller: 'T2', dictadoPor: 'Psic. Camilo Reyes' }, { fecha: '01-Sep', taller: 'T3', dictadoPor: 'Psic. Camilo Reyes' },
        { fecha: '15-Sep', taller: 'T4', dictadoPor: 'Lic. Marcos' }, { fecha: '01-Oct', taller: 'T5', dictadoPor: 'Lic. Marcos' }, { fecha: '15-Oct', taller: 'T6', dictadoPor: 'Psic. Camilo Reyes' },
        { fecha: '01-Nov', taller: 'T7', dictadoPor: 'Lic. Marcos' }, { fecha: '15-Nov', taller: 'T8', dictadoPor: 'Psic. Camilo Reyes' } // 8 faltas = progresa Rojo
      ], 
      excusas: [], 
      correos: [
        { fecha: '02-Sep-2026', tipo: 'Alerta por no asistir' },
        { fecha: '16-Oct-2026', tipo: 'Alerta por no asistir' }
      ],
      llamado: { 
        paraLlamado: 'Sí', 
        seHizoLlamado: 'Sí', 
        diasRetraso: 0, 
        profesional: 'Coord. Paula Restrepo', 
        fechaLlamado: '17-Oct-2026' 
      }
    },
  ]);

  const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [madreSeleccionada, setMadreSeleccionada] = useState(null);

  // Lógica de colores y barra
  // 1-3 Amarillo, 4-6 Naranja, 7-9 Rojo
  const getColorBarra = (faltasCount) => {
    if (faltasCount >= 7) return 'bg-red-500'; // rojo al llegar de 7 a 9
    if (faltasCount >= 4) return 'bg-orange-500'; // naranja al llegar de 4 a 6
    if (faltasCount >= 1) return 'bg-yellow-400'; // amarillo de 1 a 3
    return 'bg-transparent';
  };

  const getColorClaroContainer = (faltasCount) => {
    if (faltasCount >= 7) return 'bg-red-50 border-red-200';
    if (faltasCount >= 4) return 'bg-orange-50 border-orange-200';
    if (faltasCount >= 1) return 'bg-yellow-50 border-yellow-200';
    return 'bg-slate-50 border-slate-200';
  };

  const getTopBarClass = (faltasCount) => {
    if (faltasCount >= 7) return 'bg-red-500 border-red-700 text-white';
    if (faltasCount >= 4) return 'bg-orange-500 border-orange-700 text-white';
    if (faltasCount >= 1) return 'bg-yellow-400 border-yellow-600 text-slate-900';
    return 'bg-slate-800 border-slate-900 text-white';
  };

  const datosFiltrados = datos.filter(d => {
    const coincideMunicipio = filtroMunicipio === 'Todos' || d.municipio === filtroMunicipio;
    const coincideTexto = d.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) || d.documento.includes(filtroTexto);
    return coincideMunicipio && coincideTexto;
  });

  const registrarHizoLlamado = () => {
    // Aquí implementamos la regla estricta de que SOLO la coordinadora puede llenarlo
    const coordName = window.prompt("⚠️ ACCIÓN RESTRINGIDA A LA COORDINADORA DEL EQUIPO ⚠️\n\nPor favor, ingrese su nombre confirmando que dejó la constancia:");
    if(coordName) {
      setDatos(datos.map(d => {
        if(d.id === madreSeleccionada.id) {
          const modificado = {...d, llamado: { ...d.llamado, seHizoLlamado: 'Sí', profesional: coordName, fechaLlamado: new Date().toLocaleDateString() }};
          setMadreSeleccionada(modificado);
          return modificado;
        }
        return d;
      }));
    }
  };

  // ========== DETALLES INDIVIDUALES DE LA MADRE ==========
  if (madreSeleccionada) {
    const m = madreSeleccionada;
    const faltasCount = m.faltas.length;
    const topBarColor = getTopBarClass(faltasCount);

    return (
      <div className="min-h-screen bg-slate-100 flex">
        <div className="flex-1 flex flex-col p-4 md:p-8 relative max-w-6xl mx-auto w-full">
           <div className="flex gap-3 mb-6">
             <button onClick={() => setMadreSeleccionada(null)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
               <ArrowLeft className="w-5 h-5" /> Atrás a la Búsqueda
             </button>
             <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
               <Home className="w-5 h-5" /> Panel de Inicio
             </button>
           </div>

           <div className="bg-white rounded-lg shadow-xl border border-slate-300 overflow-hidden">
             
             {/* BARRA SUPERIOR COINCIDE CON COLOR PROGRESIVO DE FALTAS */}
             <div className={`${topBarColor} p-6 border-b-4 shadow-sm flex flex-col md:flex-row justify-between md:items-center`}>
               <div>
                 <h1 className="text-2xl font-bold uppercase">{m.nombre}</h1>
                 <p className="font-bold text-sm mt-1 opacity-90">Número de Documento: {m.documento} | Equipo: {m.equipo}</p>
                 <p className="font-bold text-sm mt-1 opacity-90">Total Inasistencias: {faltasCount}</p>
               </div>
             </div>

             <div className="p-6">
               
               {/* LLAMADO AL ROL */}
               <div className="mb-6 bg-slate-50 p-5 rounded border border-slate-300 shadow-sm">
                  <div className="border-b border-slate-300 pb-2 mb-4 flex justify-between items-start flex-col md:flex-row gap-2">
                    <h3 className="font-bold text-lg text-slate-800 uppercase">LLAMADO AL ROL (EQUIPO: {m.equipo})</h3>
                    <p className="text-sm font-bold text-slate-700 bg-slate-200 px-3 py-1.5 rounded">
                      Coordinadora Responsable: <span className="text-black font-black uppercase">{m.coordinadora}</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                     <div className="bg-white p-3 rounded border border-slate-300 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">¿Está para llamado al rol?</p>
                       <p className="text-base font-bold text-slate-800 mt-1">{m.llamado.paraLlamado}</p>
                     </div>
                     <div className="bg-white p-3 rounded border border-slate-300 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">¿Se le hizo el llamado al rol?</p>
                       <p className="text-base font-bold text-slate-800 mt-1">{m.llamado.seHizoLlamado}</p>
                     </div>
                     <div className="bg-white p-3 rounded border border-slate-300 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">Coordinadora que lo hizo</p>
                       <p className="text-base font-medium text-slate-800 mt-1">{m.llamado.profesional || '--'}</p>
                     </div>
                     <div className="bg-white p-3 rounded border border-slate-300 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">Fecha del llamado</p>
                       <p className="text-base font-medium text-slate-800 mt-1">{m.llamado.fechaLlamado || '--'}</p>
                     </div>
                  </div>

                  {m.llamado.paraLlamado === 'Sí' && m.llamado.seHizoLlamado === 'No' && (
                    <div className="bg-red-50 border border-red-300 p-4 rounded mt-4">
                       <p className="uppercase font-bold text-red-800 mb-2 underline">REGLAS DE AVISOS DEL SISTEMA:</p>
                       <ul className="list-decimal ml-6 space-y-2 text-sm text-red-800">
                         <li className={m.llamado.diasRetraso >= 0 ? "font-bold" : ""}>Día 1: El sistema avisa a los PROFESIONALES QUE ESTUVIERON COMO RESPONSABLES DEL TALLER.</li>
                         <li className={m.llamado.diasRetraso >= 1 ? "font-bold" : ""}>Día 2: Se envía alerta a la COORDINADORA DEL EQUIPO ({m.coordinadora}).</li>
                         <li className={m.llamado.diasRetraso >= 2 ? "font-bold" : ""}>Día 3: Se envía alerta a la COORDINADORA TÉCNICA y al ADMINISTRADOR.</li>
                       </ul>
                       { (rolActual === 'Coordinadora') ? (
                         <button onClick={registrarHizoLlamado} className="mt-5 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded shadow border border-red-800 uppercase text-xs tracking-wide">
                            📝 Dejar constancia de llamado al rol
                         </button>
                       ) : (
                         <p className="mt-5 text-red-900 font-bold bg-white/50 p-3 rounded border border-red-200 text-xs italic shadow-inner">
                           * Tu cuenta conectada actuamente como [{rolActual}] no tiene permisos de sistema para hacer esto. Solo el perfil de Coordinadora puede dejar constancia.
                         </p>
                       )}
                    </div>
                  )}
               </div>

               {/* RECUADROS DE FALLAS, ALERTAS Y EXCUSAS */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                 {/* FALLAS NO JUSTIFICADAS */}
                 <div className="bg-white border border-slate-300 rounded p-5 shadow-sm">
                   <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-3">FALLAS NO JUSTIFICADAS</h3>
                   {m.faltas.length > 0 ? (
                     <ul className="space-y-3">
                       {m.faltas.map((f, i) => (
                         <li key={i} className="text-sm bg-slate-50 p-2 rounded border border-slate-200 shadow-sm leading-relaxed">
                           <span className="font-bold">Fecha:</span> {f.fecha} <br/>
                           <span className="font-bold">Nombre del Taller:</span> {f.taller} <br/>
                           <span className="font-bold text-blue-800">Profesional(es) que lo dictaron:</span> {f.dictadoPor}
                         </li>
                       ))}
                     </ul>
                   ) : <p className="text-sm text-slate-500 italic">No tiene fallas.</p>}
                 </div>

                 {/* ALERTAS ENVIADAS */}
                 <div className="bg-white border border-slate-300 rounded p-5 shadow-sm">
                   <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-3">ALERTAS ENVIADAS</h3>
                   {m.correos.length > 0 ? (
                     <ul className="space-y-3">
                       {m.correos.map((c, i) => (
                         <li key={i} className="text-sm bg-slate-50 p-2 rounded border border-slate-200 shadow-sm leading-relaxed">
                           <span className="font-bold">Fecha del correo:</span> {c.fecha} <br/>
                           <span className="font-bold">Tipo:</span> {c.tipo}
                         </li>
                       ))}
                     </ul>
                   ) : <p className="text-sm text-slate-500 italic">No hay correos enviados.</p>}
                 </div>

                 {/* REGISTRO DE EXCUSAS */}
                 <div className="bg-white border border-slate-300 rounded p-5 shadow-sm">
                   <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-3">REGISTRO DE EXCUSAS</h3>
                   {m.excusas.length > 0 ? (
                     <ul className="space-y-3">
                       {m.excusas.map((e, i) => (
                         <li key={i} className="text-sm bg-slate-50 p-2 rounded border border-slate-200 shadow-sm leading-relaxed">
                           <span className="font-bold">Excusa:</span> {e.motivo} <br/>
                           <span className="font-bold">Fecha:</span> {e.fecha} <br/>
                           <span className="font-bold text-blue-800">Profesional que la redactó:</span> {e.redactadoPor}
                         </li>
                       ))}
                     </ul>
                   ) : <p className="text-sm text-slate-500 italic">No tiene excusas.</p>}
                 </div>

               </div>
               
             </div>
           </div>
        </div>
      </div>
    );
  }

  // ========== VISTA PRINCIPAL (TABLA ESTILO NATIVO) ==========
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <div className="flex-1 flex flex-col p-4 md:p-8 relative max-w-7xl mx-auto w-full">
         <div className="flex justify-between items-start mb-6">
           <div className="flex gap-3">
             <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
               <ArrowLeft className="w-5 h-5" /> Volver Atrás
             </button>
             <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
               <Home className="w-5 h-5" /> Panel de Inicio FST
             </button>
           </div>

           <div className="hidden lg:flex bg-white rounded-lg p-1 gap-1 border border-slate-300 shadow-sm flex-col md:flex-row items-center">
             <span className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest pl-2">Tú Eres:</span>
             <button onClick={() => setRolActual('Administrador')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Administrador' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Admin</button>
             <button onClick={() => setRolActual('Coordinadora Técnica')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinadora Técnica' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Técnica</button>
             <button onClick={() => setRolActual('Coordinadora')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Coordinadora' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Coordinadora</button>
             <button onClick={() => setRolActual('Profesional')} className={`px-2 py-1.5 text-xs rounded font-bold transition-all ${rolActual === 'Profesional' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Profesional</button>
           </div>
         </div>
         
         <h1 className="text-2xl font-bold text-slate-800 mb-6">TRAZABILIDAD FST E INFORMES</h1>

         {/* FILTROS AL PIE DE LA LETRA */}
         <div className="bg-white p-5 rounded shadow border border-slate-300 mb-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">FILTROS DE BÚSQUEDA</h3>
            <div className="flex flex-col lg:flex-row gap-4 align-bottom">
              <div className="w-full lg:w-1/3">
                <label className="block text-sm font-bold text-slate-600 mb-1">Filtrar por municipio:</label>
                <select 
                  value={filtroMunicipio}
                  onChange={(e) => setFiltroMunicipio(e.target.value)}
                  className="w-full border border-slate-400 p-2 rounded focus:border-blue-500 bg-white"
                >
                   <option value="Todos">Todos</option>
                   <option value="Ibagué">Ibagué</option>
                   <option value="Lérida">Lérida</option>
                   <option value="Chaparral">Chaparral</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-600 mb-1">Filtrar por número de documento o nombre de la madre:</label>
                <input 
                  type="text" 
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  placeholder="Escribir..." 
                  className="w-full border border-slate-400 p-2 rounded focus:border-blue-500 bg-white" 
                />
              </div>
            </div>
         </div>

         {/* TABLA PRINCIPAL AL PIE DE LA LETRA */}
         <div className="bg-white rounded shadow border border-slate-300 overflow-hidden mb-8">
            <div className="overflow-x-auto w-full">
               <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                     <tr className="bg-slate-200 text-slate-800 text-xs font-bold border-b border-slate-300">
                        <th className="p-3 border-r border-slate-300">DATOS DE LA MADRE</th>
                        <th className="p-3 border-r border-slate-300 text-center">MUNICIPIO</th>
                        <th className="p-3 border-r border-slate-300 text-center w-24">INASISTENCIAS</th>
                        <th className="p-3 border-r border-slate-300 w-64">ALERTAS DE CORREOS DISPARADOS</th>
                        <th className="p-3 border-r border-slate-300 w-56 text-center">PROXIMO LLAMADO AL ROL</th>
                        <th className="p-3 text-center">DETALLES INDIVIDUALES</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 bg-white text-sm">
                     {datosFiltrados.map(d => {
                       const barColor = getColorBarra(d.faltas.length);
                       const barBgContenedor = getColorClaroContainer(d.faltas.length);
                       
                       // Barra de progreso de 1 a 9
                       const pct = Math.min(100, (d.faltas.length / 9) * 100);

                       return (
                       <tr key={d.id} className="hover:bg-blue-50">
                          <td className="p-3 border-r border-slate-300 align-top">
                             <p className="font-bold text-slate-900">{d.nombre}</p>
                             <p className="text-slate-600 mt-1">Doc: {d.documento}</p>
                          </td>
                          <td className="p-3 border-r border-slate-300 text-center align-top text-slate-800">
                             {d.municipio}
                          </td>
                          <td className="p-3 border-r border-slate-300 text-center align-top font-bold text-lg text-slate-800">
                             {d.faltas.length}
                          </td>
                          <td className="p-3 border-r border-slate-300 align-top">
                             {d.correos.length > 0 ? (
                               <ul className="list-disc ml-4 space-y-1">
                                 {d.correos.map((env, i) => (
                                    <li key={i} className="text-xs text-slate-700">{env.tipo}</li>
                                 ))}
                               </ul>
                             ) : (
                               <span className="text-xs text-slate-500">Ninguna</span>
                             )}
                          </td>
                          
                          {/* COLUMNA: PROXIMO LLAMADO AL ROL: NUMERO + BARRA GRAFICA PROGRESIVA COLORES */}
                          <td className="p-3 border-r border-slate-300 align-middle">
                             <div className={`flex flex-col items-center w-full p-2 border rounded ${barBgContenedor}`}>
                               <span className="font-bold mb-2">Faltas Reales: {d.faltas.length}</span>
                               <div className="w-full bg-slate-200 h-4 border border-slate-400 relative overflow-hidden flex items-center shadow-inner">
                                  {/* La celda o barra se llena y tiñe con barColor progresivamente: 1 a 9 */}
                                  <div className={`h-full transition-all duration-300 ${barColor}`} style={{width: `${pct}%`}}></div>
                               </div>
                               <div className="flex justify-between w-full text-[10px] text-slate-600 font-bold mt-1 px-1">
                                  <span>0</span>
                                  <span>3 (A)</span>
                                  <span>6 (N)</span>
                                  <span>9 (R)</span>
                               </div>
                             </div>
                          </td>

                          <td className="p-3 align-middle text-center">
                            <button 
                              onClick={() => setMadreSeleccionada(d)}
                              className="text-white bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded text-xs font-bold border border-blue-900 shadow-sm"
                            >
                              Ver Detalles Individuales
                            </button>
                          </td>
                       </tr>
                     )})}
                     {datosFiltrados.length === 0 && (
                       <tr>
                         <td colSpan="6" className="p-8 text-center text-slate-500 font-bold border-t border-slate-300">
                           No se encontraron resultados para los filtros seleccionados.
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
