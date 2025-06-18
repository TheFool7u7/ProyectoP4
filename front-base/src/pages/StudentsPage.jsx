// front-base/src/pages/AddStudentPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext'; // Ajusta la ruta

const AddStudentPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    nombre_completo: '',
    identificacion: '',
    correo_electronico: '',
    carrera_cursada: '',
    ano_graduacion: '',
    telefono: '',
    direccion: '',
    zona_geografica: '',
    logros_adicionales: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setLoading(true);

    // Validación simple de campos requeridos
    if (!formData.nombre_completo || !formData.identificacion || !formData.correo_electronico || !formData.carrera_cursada || !formData.ano_graduacion) {
      setError('Los campos con asterisco (*) son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/graduados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          ano_graduacion: parseInt(formData.ano_graduacion) || null // Asegura que sea número o null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status} al crear el graduado.`);
      }

      setSuccessMessage('¡Graduado agregado exitosamente!');
      // Opcional: limpiar formulario o redirigir
      setFormData({ // Limpiar formulario
        nombre_completo: '', identificacion: '', correo_electronico: '',
        carrera_cursada: '', ano_graduacion: '', telefono: '',
        direccion: '', zona_geografica: '', logros_adicionales: '',
      });
      // Opcional: redirigir después de un tiempo o con un botón
      // setTimeout(() => navigate('/students'), 2000); 

    } catch (err) {
      console.error("Error creating student:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Agregar Nuevo Graduado</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{successMessage}</div>}

        {/* Nombre Completo */}
        <div>
          <label htmlFor="nombre_completo" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
          <input type="text" name="nombre_completo" id="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Identificación */}
        <div>
          <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">Identificación (Cédula/DNI) <span className="text-red-500">*</span></label>
          <input type="text" name="identificacion" id="identificacion" value={formData.identificacion} onChange={handleChange} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Correo Electrónico */}
        <div>
          <label htmlFor="correo_electronico" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
          <input type="email" name="correo_electronico" id="correo_electronico" value={formData.correo_electronico} onChange={handleChange} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Carrera Cursada */}
        <div>
          <label htmlFor="carrera_cursada" className="block text-sm font-medium text-gray-700 mb-1">Carrera Cursada <span className="text-red-500">*</span></label>
          <input type="text" name="carrera_cursada" id="carrera_cursada" value={formData.carrera_cursada} onChange={handleChange} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Año de Graduación */}
        <div>
          <label htmlFor="ano_graduacion" className="block text-sm font-medium text-gray-700 mb-1">Año de Graduación <span className="text-red-500">*</span></label>
          <input type="number" name="ano_graduacion" id="ano_graduacion" value={formData.ano_graduacion} onChange={handleChange} required
            placeholder="Ej: 2023"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        
        {/* Teléfono (Opcional) */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Dirección (Opcional) */}
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Zona Geográfica (Opcional) */}
        <div>
          <label htmlFor="zona_geografica" className="block text-sm font-medium text-gray-700 mb-1">Zona Geográfica</label>
          <input type="text" name="zona_geografica" id="zona_geografica" value={formData.zona_geografica} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        
        {/* Logros Adicionales (Opcional) */}
        <div>
          <label htmlFor="logros_adicionales" className="block text-sm font-medium text-gray-700 mb-1">Logros Adicionales</label>
          <textarea name="logros_adicionales" id="logros_adicionales" rows="3" value={formData.logros_adicionales} onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div className="flex items-center justify-end space-x-3">
            <button type="button" onClick={() => navigate('/students')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm">
                Cancelar
            </button>
            <button type="submit" disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {loading ? 'Guardando...' : 'Guardar Graduado'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;