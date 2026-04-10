import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rutinas from './pages/Rutinas';
import Progreso from './pages/Progreso';
import Mapa from './pages/Mapa';
import Comunidad from './pages/Comunidad';
import Objetivos from './pages/Objetivos';
import CoachIA from './pages/CoachIA';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AdminCentros from './pages/AdminCentros';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/rutinas" element={<Rutinas />} />
                  <Route path="/progreso" element={<Progreso />} />
                  <Route path="/mapa" element={<Mapa />} />
                  <Route path="/comunidad" element={<Comunidad />} />
                  <Route path="/objetivos" element={<Objetivos />} />
                  <Route path="/coach" element={<CoachIA />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin/centros" element={<AdminCentros />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
