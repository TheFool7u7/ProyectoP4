import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Layout from './components/Layout';
import { AuthProvider } from './components/context/AuthContext';
import PrivateRoute from "./components/routes/PrivateRoute";
import Login from "./components/Login";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route path="home" element={<div>Tablero de inicio</div>} />
          <Route path="login" element={<Login/>} />
          <Route path="groups" element={<div>Grupos</div>} />
          <Route path="students" element={<div>Estudiantes</div>} />
          <Route path="teachers" element={<div>Profesores</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);