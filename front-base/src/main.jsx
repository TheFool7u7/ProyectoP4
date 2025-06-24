import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Contexto de Autenticación
import { AuthProvider } from './components/context/AuthContext';

// Componentes de Rutas y Layout
import Layout from './components/Layout';
import PrivateRoute from "./components/routes/PrivateRoute";

// Vistas / Páginas
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import CatalogoTalleres from './components/CatalogoTalleres';
import TallerDetalle from './components/TallerDetalle';
import MisPreferencias from './components/MisPreferencias';
import GestionTalleres from './components/GestionTalleres';
import ListaGraduados from './components/ListaGraduados';
import RegistroGraduado from './components/RegistroGraduado';
import GestionAreas from './components/GestionAreas';
import MiPerfil from './components/MiPerfil';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* --- Rutas Privadas (requieren login y usan el Layout) --- */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* La página de inicio por defecto al entrar a la ruta raíz "/" */}
            <Route index element={<div className="p-4 text-xl">¡Bienvenido al sistema!</div>} />
            
            <Route path="home" element={<div>Tablero de inicio</div>} />
            <Route path="catalogo-talleres" element={<CatalogoTalleres />} />
            <Route path="taller/:tallerId" element={<TallerDetalle />} />
            <Route path="mis-preferencias" element={<MisPreferencias />} />
            <Route path="mi-perfil" element={<MiPerfil />} /> 
            
            {/* Rutas de Administrador */}
            <Route path="graduados" element={<ListaGraduados />} />
            <Route path="graduados/registro" element={<RegistroGraduado />} />
            <Route path="areas-interes" element={<GestionAreas />} />
            <Route path="talleres" element={<GestionTalleres />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);