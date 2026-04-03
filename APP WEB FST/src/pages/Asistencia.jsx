import { useState } from 'react';
import { QrCode, Search, UserCheck, UserX, MessageSquareWarning, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Asistencia() {
  const navigate = useNavigate();
  const [escaneando, setEscaneando] = useState(false);
  const [participantes, setParticipantes] = useState([
    { id: 1, nombre: 'Ana Rodríguez', documento: '1001001', estado: 'Pendiente' },
    { id: 2, nombre: 'María Gómez', documento: '1001002', estado: 'Pendiente' },
    { id: 3, nombre: 'Luisa Fernanda Pérez', documento: '1001003', estado: 'Pendiente' },
  ]);

  const simularEscaneoQR = () => {
    setEscaneando(true);
    setTimeout(() => {
      setEscaneando(false);
      marcarEstado(1, 'Asistió');
      alert('✅ ¡Código QR Leído Correctamente! \n\nAsistencia confirmada para: Ana Rodríguez.\n(En la Fase 2 este módulo abrirá la cámara de tu celular/computadora).');
    }, 2000);
  };

  const marcarEstado = (id, estado) => {
    if (estado === 'Excusada') {
       const excusa = window.prompt('Escribe el motivo de la excusa médica o personal de la inasistencia:');
       if (!excusa) return;
    }
    setParticipantes(participantes.map(p => p.id === id ? { ...p, estado } : p));
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
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Toma de Asistencia y QR</h1>
              <p className="text-slate-500 mt-1">Reunión actual: Capacitación Zonal 1 (Bloque 8:00 AM)</p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                  <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary-200">
                    <QrCode className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Escáner Biométrico / QR</h3>
                  <p className="text-sm text-slate-500 mb-6">Usa la cámara de tu dispositivo para leer los códigos de las Madres y Profesionales rápidamente y evitar planillas a mano.</p>
                  
                  <button 
                    onClick={simularEscaneoQR} 
                    disabled={escaneando}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 cursor-pointer ${escaneando ? 'bg-slate-200 text-slate-500 animate-pulse' : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 hover:bg-black'}`}
                  >
                    {escaneando ? 'Detectando Código...' : 'ABRIR CÁMARA'}
                  </button>
               </div>
               
               <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg mt-6 border-b-4 border-accent-500">
                  <h3 className="font-bold border-b border-slate-700 pb-3 mb-4 uppercase text-xs tracking-widest text-accent-500">Automatización</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                     El sistema ya sabe cómo debe reaccionar: Clic aquí en "Ausente" enviará un <strong>aviso de inasistencia</strong> interno. Marcar "Tiene Excusa" mandará el mensaje de acompañamiento. Marcar "Asistió" preparará el <strong>agradecimiento</strong> al concluir la reunión.
                  </p>
               </div>
            </div>

            <div className="lg:col-span-2">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                     <h2 className="text-xl font-bold text-slate-800">Listado FST de este Bloque</h2>
                     <div className="relative w-full sm:w-64">
                       <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input type="text" placeholder="Buscar para asistencia manual..." className="input-premium pl-9 text-sm w-full" />
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     {participantes.map(p => (
                       <div key={p.id} className="p-4 border border-slate-100 bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-primary-300 transition-colors shadow-sm">
                          <div>
                            <p className="font-bold text-slate-800 text-lg">{p.nombre}</p>
                            <p className="text-xs text-slate-500 font-mono mt-1 bg-white inline-block px-2 py-0.5 rounded border border-slate-200">C.C. {p.documento}</p>
                          </div>
                          
                          {p.estado === 'Pendiente' ? (
                            <div className="flex flex-wrap gap-2">
                               <button onClick={() => marcarEstado(p.id, 'Asistió')} className="flex items-center gap-1 px-4 py-2 bg-white text-green-700 hover:bg-green-600 hover:text-white rounded-xl text-sm font-bold transition-all border border-green-200 hover:border-transparent cursor-pointer shadow-sm">
                                 <UserCheck className="w-5 h-5" /> Llegó
                               </button>
                               <button onClick={() => marcarEstado(p.id, 'Ausente')} className="flex items-center gap-1 px-4 py-2 bg-white text-accent-600 hover:bg-accent-600 hover:text-white rounded-xl text-sm font-bold transition-all border border-red-200 hover:border-transparent cursor-pointer shadow-sm">
                                 <UserX className="w-5 h-5" /> Faltó
                               </button>
                               <button onClick={() => marcarEstado(p.id, 'Excusada')} className="flex items-center gap-1 px-4 py-2 bg-white text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-sm font-bold transition-all border border-amber-200 hover:border-transparent cursor-pointer shadow-sm">
                                 <MessageSquareWarning className="w-5 h-5" /> Excusa
                               </button>
                            </div>
                          ) : (
                            <span className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-sm ${
                              p.estado === 'Asistió' ? 'bg-green-100 text-green-700 border border-green-200' : 
                              p.estado === 'Ausente' ? 'bg-red-50 text-accent-600 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                               {p.estado === 'Asistió' && <UserCheck className="w-5 h-5" />}
                               {p.estado === 'Ausente' && <UserX className="w-5 h-5" />}
                               {p.estado === 'Excusada' && <MessageSquareWarning className="w-5 h-5" />}
                               <span className="uppercase">{p.estado}</span>
                            </span>
                          )}
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
