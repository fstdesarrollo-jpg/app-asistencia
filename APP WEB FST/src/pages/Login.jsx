import { Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 m-4 rounded-2xl glass-panel animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
            <User className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Fundación Somos Todos FST</h1>
          <p className="text-slate-200">Sistema de Gestión y Asistencia</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Usuario / Correo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input type="text" className="input-premium pl-10 bg-white/90" placeholder="admin@fundacionst.org" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input type="password" className="input-premium pl-10 bg-white/90" placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="w-full btn-premium mt-8">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
