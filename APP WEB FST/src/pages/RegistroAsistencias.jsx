import { useState } from 'react';
import { ArrowLeft, Search, MapPin, Users, Calendar, Printer, FileDown, CheckCircle, XCircle, FileEdit, Building2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegistroAsistencias() {
  const navigate = useNavigate();

  // Mock de Actas/Planillas de Talleres FST
  const [planillas, setPlanillas] = useState([
    {
      id: 1,
      nombreTaller: 'Taller de Crianza Respetuosa',
      fecha: '12/Oct/2026',
      hora: '08:00 AM - 12:00 PM',
      municipio: 'Ibagué',
      responsables: 'Psic. Carlos Ruiz',
      equipoFiltro: 'Zonal 1', // a qué equipo iba dirigido
      coordinadora: 'Coord. Lic. Valeria Torres',
      listaMadres: [
        { id: 101, nombre: 'Sandra Milena Orozco', documento: '102345', municipio: 'Ibagué', equipo: 'Zonal 1', estado: 'FALTÓ' },
        { id: 102, nombre: 'Berta Cecilia Giraldo', documento: '987654', municipio: 'Ibagué', equipo: 'Zonal 1', estado: 'ASISTIÓ' },
        { id: 103, nombre: 'Carmen Eugenia Santos', documento: '981242', municipio: 'Ibagué', equipo: 'Zonal 1', estado: 'ASISTIÓ' },
        { id: 104, nombre: 'Ana Isabel Forero', documento: '111222', municipio: 'Ibagué', equipo: 'Zonal 1', estado: 'EXCUSA' },
      ]
    },
    {
      id: 2,
      nombreTaller: 'Capacitación Legal Primera Infancia',
      fecha: '15/Sep/2026',
      hora: '02:00 PM - 05:00 PM',
      municipio: 'Ibagué',
      responsables: 'Abog. Juan Camilo Reyes',
      equipoFiltro: 'Todos los Equipos', // Fue un taller global municipal
      coordinadora: 'Coord. Lic. Valeria Torres',
      listaMadres: [
        { id: 101, nombre: 'Sandra Milena Orozco', documento: '102345', municipio: 'Ibagué', equipo: 'Zonal 1', estado: 'ASISTIÓ' },
        { id: 201, nombre: 'Laura Ximena Torres', documento: '333444', municipio: 'Ibagué', equipo: 'Zonal 2', estado: 'ASISTIÓ' },
        { id: 202, nombre: 'Mónica María Castro', documento: '555666', municipio: 'Ibagué', equipo: 'Zonal 2', estado: 'FALTÓ' },
        { id: 301, nombre: 'Gloria Amparo Silva', documento: '777888', municipio: 'Ibagué', equipo: 'Zonal 3', estado: 'EXCUSA' },
      ]
    },
    {
      id: 3,
      nombreTaller: 'Taller de Pedagogía',
      fecha: '15/Sep/2026',
      hora: '09:00 AM - 11:00 AM',
      municipio: 'Lérida',
      responsables: 'Lic. Laura Mora',
      equipoFiltro: 'Zonal 2',
      coordinadora: 'Coord. Lérida Marcela Silva',
      listaMadres: [
        { id: 401, nombre: 'Diana Patricia Ruiz', documento: '543128', municipio: 'Lérida', equipo: 'Zonal 2', estado: 'FALTÓ' },
        { id: 402, nombre: 'María Teresa Moncada', documento: '223344', municipio: 'Lérida', equipo: 'Zonal 2', estado: 'ASISTIÓ' },
      ]
    }
  ]);

  const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');
  const [filtroEquipo, setFiltroEquipo] = useState('Todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  
  const [planillaAbierta, setPlanillaAbierta] = useState(null);

  // Filtrador de planillas maestras
  const planillasFiltradas = planillas.filter(p => {
    // Si la planilla es global (Todos los Equipos), siempre mostrarla en los filtros de municipio si coincide
    const coincideMuni = filtroMunicipio === 'Todos' || p.municipio === filtroMunicipio;
    // Si busco por un equipo (Zonal 1), y la planilla es del Zonal 1 O es una global para todos en el municipio
    const coincideEquipo = filtroEquipo === 'Todos' || p.equipoFiltro === filtroEquipo || p.equipoFiltro === 'Todos los Equipos';
    const coincideTexto = p.nombreTaller.toLowerCase().includes(filtroTexto.toLowerCase()) || p.fecha.toLowerCase().includes(filtroTexto.toLowerCase());
    
    return coincideMuni && coincideEquipo && coincideTexto;
  });

  const tieneFiltrosAplicados = filtroMunicipio !== 'Todos' || filtroEquipo !== 'Todos' || filtroTexto.trim() !== '';
  
  // Invertir el array para que las planillas más recientes (ID mayor) queden primero.
  const planillasInvertidas = [...planillasFiltradas].reverse();
  const planillasMostrar = tieneFiltrosAplicados ? planillasInvertidas : planillasInvertidas.slice(0, 3);

  const getStatusDeco = (estado) => {
    if (estado === 'ASISTIÓ') return <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded font-bold text-xs flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3"/> ASISTIÓ</span>;
    if (estado === 'FALTÓ') return <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded font-bold text-xs flex items-center gap-1 w-fit"><XCircle className="w-3 h-3"/> NO ASISTIÓ</span>;
    if (estado === 'EXCUSA') return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded font-bold text-xs flex items-center gap-1 w-fit"><FileEdit className="w-3 h-3"/> EXCUSADA</span>;
    return <span>{estado}</span>;
  };

  // ========== VISTA: PLANILLA ESPECÍFICA ==========
  if (planillaAbierta) {
    const p = planillaAbierta;
    
    // Si no filtró equipo, mostrar columna equipo (REGLA DEL USUARIO)
    const mostrarColumnaEquipo = filtroEquipo === 'Todos' || p.equipoFiltro === 'Todos los Equipos';

    // Para la planilla abierta, también puedo filtrar internamente a las madres si el equipo estaba puesto
    const madresVisibles = p.listaMadres.filter(m => {
       if (filtroEquipo === 'Todos') return true;
       return m.equipo === filtroEquipo;
    });

    return (
      <div className="min-h-screen bg-slate-100 flex">
        <div className="flex-1 flex flex-col p-4 md:p-8 relative max-w-[1200px] mx-auto w-full">
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <div className="flex gap-3">
               <button onClick={() => setPlanillaAbierta(null)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2 rounded shadow border border-slate-300">
                 <ArrowLeft className="w-5 h-5" /> Atrás a la Búsqueda
               </button>
               <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2 rounded shadow border border-slate-700">
                 <Home className="w-5 h-5" /> Panel de Inicio
               </button>
             </div>
             <div className="flex flex-wrap gap-3">
               <button className="bg-slate-900 text-white font-bold px-4 py-2.5 rounded shadow flex items-center gap-2 text-sm hover:bg-black uppercase tracking-wider">
                 <Printer className="w-4 h-4"/> Imprimir
               </button>
               <button className="bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2.5 rounded shadow flex items-center gap-2 text-sm uppercase tracking-wider border border-red-900 transition-colors">
                 <FileDown className="w-4 h-4"/> PDF
               </button>
               <button className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2.5 rounded shadow flex items-center gap-2 text-sm uppercase tracking-wider border border-green-900 transition-colors">
                 <FileDown className="w-4 h-4"/> EXCEL
               </button>
             </div>
           </div>

           <div className="bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden print:shadow-none print:border-none">
             
             {/* ENCABEZADO EXIGIDO */}
             <div className="border-b-4 border-slate-800 p-8 bg-slate-50">
               <div className="flex items-center gap-3 mb-6">
                 <Building2 className="w-8 h-8 text-primary-600" />
                 <h2 className="text-xl font-black text-slate-900 tracking-wider">REPORTE OFICIAL DE ASISTENCIA FST</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Nombre del Taller / Capacitación</p>
                   <p className="text-base font-black text-slate-800 mt-1 uppercase">{p.nombreTaller}</p>
                 </div>
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Fecha Ejecutada</p>
                   <p className="text-base font-bold text-slate-800 mt-1">{p.fecha}</p>
                 </div>
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Hora / Intensidad</p>
                   <p className="text-base font-bold text-slate-800 mt-1">{p.hora}</p>
                 </div>
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Profesional(es) Responsables</p>
                   <p className="text-base font-bold text-slate-800 mt-1 text-primary-800">{p.responsables}</p>
                 </div>
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Número de Equipo Base</p>
                   <p className="text-base font-bold text-slate-800 mt-1">{p.equipoFiltro}</p>
                 </div>
                 <div className="border-b border-slate-200 pb-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Coordinadora a Cargo</p>
                   <p className="text-base font-bold text-slate-800 mt-1">{p.coordinadora}</p>
                 </div>
               </div>
             </div>

             {/* CUERPO CENTRAL DE LA PLANILLA */}
             <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-200/60 text-slate-700 text-xs font-bold uppercase tracking-widest border-b border-slate-300">
                         <th className="p-4 border-r border-slate-200">#</th>
                         <th className="p-4 border-r border-slate-200">NOMBRE DE LA MADRE SUSTITUTA</th>
                         <th className="p-4 border-r border-slate-200">NÚMERO DE DOCUMENTO</th>
                         <th className="p-4 border-r border-slate-200">MUNICIPIO</th>
                         {/* COLUMNA CONDICIONAL DE EQUIPO */}
                         {mostrarColumnaEquipo && (
                           <th className="p-4 border-r border-slate-200 text-primary-800 bg-primary-50">NÚMERO DE EQUIPO</th>
                         )}
                         <th className="p-4 text-center">Firma de Asistencia M.S.</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200 bg-white">
                      {madresVisibles.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                           <td className="p-4 border-r border-slate-200 font-bold text-slate-400 w-12 text-center">{idx + 1}</td>
                           <td className="p-4 border-r border-slate-200 font-bold text-slate-800 uppercase text-sm">{m.nombre}</td>
                           <td className="p-4 border-r border-slate-200 font-mono text-slate-600 font-bold">{m.documento}</td>
                           <td className="p-4 border-r border-slate-200 text-sm">{m.municipio}</td>
                           
                           {/* COLUMNA CONDICIONAL */}
                           {mostrarColumnaEquipo && (
                             <td className="p-4 border-r border-slate-200 text-sm font-bold text-primary-700 bg-primary-50/20">{m.equipo}</td>
                           )}

                           <td className="p-4 flex items-center justify-center">
                              {getStatusDeco(m.estado)}
                           </td>
                        </tr>
                      ))}
                      {madresVisibles.length === 0 && (
                        <tr>
                          <td colSpan={mostrarColumnaEquipo ? 6 : 5} className="p-10 text-center font-bold text-slate-500">
                            No hay madres registradas bajo las condiciones de este equipo en esta sesión.
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

  // ========== VISTA: BUSCADOR DE PLANILLAS ==========
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <div className="flex-1 flex flex-col p-4 md:p-8 relative max-w-7xl mx-auto w-full">
         <div className="flex gap-3 mb-6">
           <button onClick={() => navigate(-1)} className="text-slate-600 hover:text-black font-bold flex items-center gap-2 w-fit bg-white px-4 py-2.5 rounded shadow border border-slate-300">
             <ArrowLeft className="w-5 h-5" /> Volver Atrás
           </button>
           <button onClick={() => navigate('/dashboard')} className="text-white hover:bg-slate-800 font-bold flex items-center gap-2 w-fit bg-slate-900 px-4 py-2.5 rounded shadow border border-slate-700">
             <Home className="w-5 h-5" /> Panel de Inicio FST
           </button>
         </div>
         
         <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-800 mb-1 flex items-center gap-3"><Users className="w-8 h-8 text-primary-600"/> EXTRACCIÓN Y REGISTRO DE ASISTENCIA</h1>
            <p className="text-slate-600 font-bold text-sm">Buscador y visor de planillas de asistencia históricas de talleres realizados.</p>
         </div>

         {/* LOS 3 FILTROS EXIGIDOS */}
         <div className="bg-white p-6 rounded shadow border border-slate-300 mb-8 border-l-4 border-l-primary-500">
            <h3 className="text-sm font-black text-slate-800 mb-4 tracking-wide">🔍 MOTORES DE BÚSQUEDA DE PLANILLAS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="w-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1"><MapPin className="w-3 h-3"/> 1. Filtro de Municipio Fijo</label>
                <select 
                  value={filtroMunicipio}
                  onChange={(e) => setFiltroMunicipio(e.target.value)}
                  className="w-full border-2 border-slate-300 p-3 rounded font-bold text-slate-800 focus:border-primary-500 bg-slate-50 uppercase tracking-wide text-sm"
                >
                   <option value="Todos">MUNICIPIO: Múltiple / Nacional</option>
                   <option value="Ibagué">Ibagué</option>
                   <option value="Lérida">Lérida</option>
                   <option value="Chaparral">Chaparral</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1"><Users className="w-3 h-3"/> 2. Filtro de Grupo Zonal</label>
                <select 
                  value={filtroEquipo}
                  onChange={(e) => setFiltroEquipo(e.target.value)}
                  className="w-full border-2 border-slate-300 p-3 rounded font-bold text-slate-800 focus:border-primary-500 bg-slate-50 uppercase tracking-wide text-sm"
                >
                   <option value="Todos">EQUIPO: Listados Globales (Todos)</option>
                   <option value="Zonal 1">Zonal 1</option>
                   <option value="Zonal 2">Zonal 2</option>
                   <option value="Zonal 3">Zonal 3</option>
                </select>
              </div>

              <div className="w-full">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide flex items-center gap-1"><Calendar className="w-3 h-3"/> 3. Rastrear por Nombre Gral o Fecha</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-5 w-5 text-slate-400" />
                   </div>
                   <input 
                     type="text" 
                     value={filtroTexto}
                     onChange={(e) => setFiltroTexto(e.target.value)}
                     placeholder="Ej: '20/Oct/2026' o 'Taller Legal'..." 
                     className="w-full pl-10 border-2 border-slate-300 p-3 rounded font-bold focus:border-primary-500 bg-white shadow-inner text-sm" 
                   />
                </div>
              </div>

            </div>
         </div>

         {/* RESULTADOS DE PLANILLAS ENCONTRADAS */}
         <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-800 border-b border-slate-300 pb-2 mb-4">
              PLANILLAS DE ASISTENCIA {tieneFiltrosAplicados ? `(${planillasMostrar.length} encontradas)` : '(Últimas 3 diligenciadas)'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planillasMostrar.map(p => (
                <div key={p.id} onClick={() => setPlanillaAbierta(p)} className="bg-white rounded-xl shadow border border-slate-300 overflow-hidden hover:border-primary-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col">
                  <div className="bg-slate-800 p-3 border-b-4 border-primary-500 text-center">
                    <h4 className="font-black text-white text-xs tracking-widest uppercase">Detalles de Planilla</h4>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1 bg-slate-50">
                    <div className="text-[13px] font-bold text-slate-600 flex flex-col border-b border-slate-200 pb-1.5">
                       <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Nombre del Taller:</span>
                       <span className="text-slate-900 uppercase leading-tight line-clamp-2" title={p.nombreTaller}>{p.nombreTaller}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-600 flex flex-col border-b border-slate-200 pb-1.5">
                       <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Fecha y Hora:</span>
                       <span className="text-slate-900">{p.fecha}  |  {p.hora}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-600 flex justify-between border-b border-slate-200 pb-1.5 items-end mt-1">
                       <span>Municipio Base:</span>
                       <span className="text-slate-900">{p.municipio}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-600 flex justify-between border-b border-slate-200 pb-1.5">
                       <span>Apto para Equipo:</span>
                       <span className="text-primary-800">{p.equipoFiltro}</span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-600 flex justify-between border-b border-slate-200 pb-1.5">
                       <span>Responsables FST:</span>
                       <span className="text-slate-900 truncate max-w-[150px]" title={p.responsables}>{p.responsables}</span>
                    </div>
                    
                    <div className="mt-2 bg-white p-2.5 rounded border border-slate-200 shadow-sm flex-1">
                       <p className="text-[11px] font-black uppercase text-slate-800 mb-2 tracking-wider text-center border-b border-slate-100 pb-1.5">
                          TOTAL CONVOCADOS/REGISTRADOS: <span className="text-primary-600">{p.listaMadres.length}</span>
                       </p>
                       <div className="flex justify-between text-[11px] font-bold w-full text-center gap-1">
                          <div className="flex flex-col text-green-700 bg-green-50 px-1 py-1 rounded w-1/3 border border-green-100">
                            <span className="text-[9px] uppercase text-green-600 font-black mb-0.5">Asistió</span>
                            <span className="text-sm">{p.listaMadres.filter(m => m.estado === 'ASISTIÓ').length}</span>
                          </div>
                          <div className="flex flex-col text-red-700 bg-red-50 px-1 py-1 rounded w-1/3 border border-red-100">
                            <span className="text-[9px] uppercase text-red-600 font-black mb-0.5">Faltas</span>
                            <span className="text-sm">{p.listaMadres.filter(m => m.estado === 'FALTÓ').length}</span>
                          </div>
                          <div className="flex flex-col text-blue-700 bg-blue-50 px-1 py-1 rounded w-1/3 border border-blue-100">
                            <span className="text-[9px] uppercase text-blue-600 font-black mb-0.5">Excusas</span>
                            <span className="text-sm">{p.listaMadres.filter(m => m.estado === 'EXCUSA').length}</span>
                          </div>
                       </div>
                    </div>

                    <div className="mt-2">
                       <span className="block text-[11px] font-black bg-slate-200 text-slate-700 px-3 py-2.5 rounded w-full text-center group-hover:bg-primary-600 group-hover:text-white transition-colors uppercase tracking-widest shadow-sm">
                         Visualizar Planilla Oficial &rarr;
                       </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {planillasMostrar.length === 0 && (
                 <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-bold text-lg">No se han encontrado planillas de asistencia con estos filtros exactos.</p>
                    <p className="text-slate-400 text-sm mt-1">Borra un poco el buscador o cambia los menús desplegables.</p>
                 </div>
              )}
            </div>
         </div>

      </div>
    </div>
  );
}
