import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './components/context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from "./components/routes/PrivateRoute";
import AdminRoute from "./components/routes/AdminRoute"
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
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';
import GestionEncuestas from './components/GestionEncuestas';
import VerEncuestas from './components/VerEncuestas';
import RealizarEncuesta from './components/RealizarEncuesta';
import ResultadosEncuesta from './components/ResultadosEncuesta';
import DiseñadorEncuesta from './components/DiseñadorEncuesta';
import PreviewEncuesta from './components/PreviewEncuesta';
import Reportes from './components/Reportes';
import Dashboard from './components/Dashboard';
import BuscadorGraduados from './components/BuscadorGraduados';
import PerfilPublico from './components/PerfilPublico';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route
            path="/"
            element={<PrivateRoute><Layout /></PrivateRoute>}
          >
            <Route index element={<Dashboard />} />
            <Route path="home" element={<Dashboard />} />
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
            <Route path="gestion-encuestas" element={<GestionEncuestas />} />
            <Route path="encuestas" element={<VerEncuestas />} />
            <Route path="encuesta/:encuestaId" element={<RealizarEncuesta />} />
            <Route path="encuesta/:encuestaId/resultados" element={<ResultadosEncuesta />} />
            <Route path="encuesta/builder/:encuestaId" element={<DiseñadorEncuesta />} />
            <Route path="encuesta/preview/:encuestaId" element={<PreviewEncuesta />} />
            <Route path="reportes" element={<AdminRoute><Reportes /></AdminRoute>} />
            <Route path="buscar-graduados" element={<BuscadorGraduados />} />
            <Route path="perfil-publico/:graduadoId" element={<PerfilPublico />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);