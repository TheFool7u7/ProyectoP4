import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './components/context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from "./components/routes/PrivateRoute";
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
import MisTalleres from './components/MisTalleres';
import AsistenciaTaller from './components/AsistenciaTaller';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/"
            element={<PrivateRoute><Layout /></PrivateRoute>}
          >
            <Route index element={<div className="p-4 text-xl">¡Bienvenido al sistema!</div>} />
            <Route path="home" element={<div className="p-4">Tablero de inicio</div>} />
            <Route path="catalogo-talleres" element={<CatalogoTalleres />} />
            <Route path="taller/:tallerId" element={<TallerDetalle />} />
            <Route path="mis-preferencias" element={<MisPreferencias />} />
            <Route path="mi-perfil" element={<MiPerfil />} />
            <Route path="graduados" element={<ListaGraduados />} />
            <Route path="graduados/registro" element={<RegistroGraduado />} />
            <Route path="areas-interes" element={<GestionAreas />} />
            <Route path="talleres" element={<GestionTalleres />} />
            <Route path="/taller/:tallerId/asistencia" element={<AsistenciaTaller />} />
            <Route path="mis-talleres" element={<MisTalleres />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);