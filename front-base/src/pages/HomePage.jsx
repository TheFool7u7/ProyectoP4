// front-base/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Para enlaces si los necesitas

const HomePage = () => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4">Bienvenido al Panel Principal</h1>
      <p className="text-gray-600 mb-6">
        Desde aquí podrás gestionar la información de los graduados, talleres, y otras funcionalidades del sistema.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ejemplo de tarjetas de acceso rápido */}
        <Link to="/students" className="block p-6 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
          <h2 className="text-xl font-bold mb-2">Gestionar Graduados</h2>
          <p>Ver, agregar, editar y eliminar registros de graduados.</p>
        </Link>
        <Link to="/groups" className="block p-6 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors">
          <h2 className="text-xl font-bold mb-2">Gestionar Grupos/Talleres</h2>
          <p>Administrar los talleres, inscripciones y contenido.</p>
        </Link>
        <Link to="/teachers" className="block p-6 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors">
          <h2 className="text-xl font-bold mb-2">Gestionar Profesores/Facilitadores</h2>
          <p>Administrar la información de los facilitadores.</p>
        </Link>
        {/* Agrega más tarjetas según sea necesario */}
      </div>
    </div>
  );
};

export default HomePage;