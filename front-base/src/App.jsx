// front-base/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import PrivateRoute from "./components/routes/PrivateRoute"; // Componente para proteger rutas

// Importa tus componentes de página
import HomePage from './pages/HomePage'; // Debes crear este componente
import StudentsPage from './pages/StudentsPage'; // El que te ayudé a crear
import AddStudentPage from './pages/AddStudentPage'; // Para el formulario de agregar
// import GroupsPage from './pages/GroupsPage'; // Si necesitas
// import TeachersPage from './pages/TeachersPage'; // Si necesitas

import './App.css'; // Estilos globales o específicos de App

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas anidadas bajo PrivateRoute y que usan Layout */}
      <Route element={<PrivateRoute />}> {/* El wrapper que verifica autenticación */}
        <Route path="/" element={<Layout />}> {/* Layout como padre de las vistas internas */}
          {/* Redirección por defecto si está autenticado y va a "/" */}
          <Route index element={<Navigate to="/home" replace />} />
          
          <Route path="home" element={<HomePage />} />
          {/* <Route path="groups" element={<GroupsPage />} /> */}
          <Route path="groups" element={<div className="p-4">Página de Grupos (En construcción)</div>} />
          
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/new" element={<AddStudentPage />} />
          {/* Ejemplo para editar: <Route path="students/edit/:studentId" element={<EditStudentPage />} /> */}

          {/* <Route path="teachers" element={<TeachersPage />} /> */}
          <Route path="teachers" element={<div className="p-4">Página de Profesores (En construcción)</div>} />
          
          {/* Catch-all para rutas no encontradas DENTRO del layout */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>

      {/* Catch-all general para rutas no encontradas y no autenticadas (si no es /login) */}
      {/* Podrías tener una página 404 más elaborada */}
      <Route path="*" element={
        <div className="flex flex-col justify-center items-center min-h-screen">
          <h1 className="text-4xl font-bold">404 - Página No Encontrada</h1>
          <p className="mt-4">Lo sentimos, la página que buscas no existe.</p>
          <Link to="/login" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ir a Iniciar Sesión
          </Link>
        </div>
      } />
    </Routes>
  );
}

export default App;