import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NuevaReunion from './pages/NuevaReunion';
import GestorMadres from './pages/GestorMadres';
import GestorPersonal from './pages/GestorPersonal';
import Asistencia from './pages/Asistencia';
import RegistroAlertas from './pages/RegistroAlertas';
import RegistroAsistencias from './pages/RegistroAsistencias';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nueva-reunion" element={<NuevaReunion />} />
        <Route path="/gestor-madres" element={<GestorMadres />} />
        <Route path="/gestor-personal" element={<GestorPersonal />} />
        <Route path="/asistencia" element={<Asistencia />} />
        <Route path="/registro-alertas" element={<RegistroAlertas />} />
        <Route path="/registro-asistencias" element={<RegistroAsistencias />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
