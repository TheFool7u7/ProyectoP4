import React, { useState } from 'react';

const RegistroGraduado = () => {
  const initialFormState = {
    nombre_completo: '',
    identificacion: '',
    correo_electronico: '',
    telefono: '',
    direccion: '',
    zona_geografica: '',
    carrera_cursada: '',
    ano_graduacion: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false); // Estado para la carga
  const [error, setError] = useState(null); // Estado para errores

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Se optiene la URL de la API desde las variables de entorno
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/api/graduados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error al registrar.');
      }

      alert('¡Graduado registrado con éxito!');
      setFormData(initialFormState); // Limpiar el formulario

    } catch (err) {
      setLoading(false);
      setError(err.message);
      console.error('Error en el envío del formulario:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Registro de Nuevo Graduado</h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Columna 1 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input type="text" name="nombre_completo" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700">Identificación (Cédula)</label>
            <input type="text" name="identificacion" id="identificacion" value={formData.identificacion} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input type="email" name="correo_electronico" id="correo_electronico" value={formData.correo_electronico} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
           <div>
            <label htmlFor="zona_geografica" className="block text-sm font-medium text-gray-700">Zona Geográfica (Ej: Pérez Zeledón)</label>
            <input type="text" name="zona_geografica" id="zona_geografica" value={formData.zona_geografica} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="carrera_cursada" className="block text-sm font-medium text-gray-700">Carrera Cursada</label>
            <input type="text" name="carrera_cursada" id="carrera_cursada" value={formData.carrera_cursada} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
          <div>
            <label htmlFor="ano_graduacion" className="block text-sm font-medium text-gray-700">Año de Graduación</label>
            <input type="number" name="ano_graduacion" id="ano_graduacion" value={formData.ano_graduacion} onChange={handleChange} required placeholder="Ej: 2023" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2" />
          </div>
        </div>
        
        {/* Mensaje de Error */}
        {error && (
          <div className="md:col-span-2 text-center p-2 bg-red-100 text-red-700 rounded-md">
            Error: {error}
          </div>
        )}

        {/* Botón de envío */}
        <div className="md:col-span-2 text-right">
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400">
            {loading ? 'Registrando...' : 'Registrar Graduado'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroGraduado;