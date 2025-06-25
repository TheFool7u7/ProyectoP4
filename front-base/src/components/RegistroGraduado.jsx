import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const RegistroGraduado = () => {
    // Estado unificado para todos los datos del graduado
    const [formData, setFormData] = useState({
        nombre_completo: '',
        identificacion: '',
        correo_electronico: '',
        password: '', // Nuevo campo para la contraseña
        telefono: '',
        direccion: '',
        zona_geografica: '',
        logros_adicionales: '',
    });

    const [carreras, setCarreras] = useState([]);
    const [carreraActual, setCarreraActual] = useState({ nombre_carrera: '', ano_finalizacion: '' });
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCarreraChange = (e) => {
        const { name, value } = e.target;
        setCarreraActual(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCarrera = () => {
        if (!carreraActual.nombre_carrera || !carreraActual.ano_finalizacion) {
            alert('Por favor, completa los datos de la carrera.');
            return;
        }
        setCarreras(prev => [...prev, carreraActual]);
        setCarreraActual({ nombre_carrera: '', ano_finalizacion: '' });
    };

    const handleRemoveCarrera = (index) => {
        setCarreras(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.correo_electronico || !formData.password) {
            alert('El correo electrónico y la contraseña son obligatorios.');
            return;
        }
        if (carreras.length === 0) {
            alert('Debes añadir al menos una carrera al perfil del graduado.');
            return;
        }
        setLoading(true);

        // Se preparan los datos para enviar a la API
        const payload = {
            email: formData.correo_electronico,
            password: formData.password,
            nombre_completo: formData.nombre_completo,
            identificacion: formData.identificacion,
            telefono: formData.telefono,
            direccion: formData.direccion,
            zona_geografica: formData.zona_geografica,
            logros_adicionales: formData.logros_adicionales,
            carreras: carreras // Se adjunta la lista de carreras
        };

        try {
            // Se llama al nuevo endpoint unificado
            const response = await fetch(`${API_URL}/api/graduados/admin-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.details || result.error || 'Ocurrió un error desconocido.');
            }

            alert('¡Graduado y usuario registrados exitosamente!');
            // Limpiar todo el formulario
            setFormData({
                nombre_completo: '',
                identificacion: '',
                correo_electronico: '',
                password: '',
                telefono: '',
                direccion: '',
                zona_geografica: '',
                logros_adicionales: '',
            });
            setCarreras([]);

        } catch (error) {
            console.error(error);
            alert(`Error al registrar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Registrar Nuevo Graduado</h2>

            {/* Campos del graduado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Nombre Completo" required className="p-2 border rounded" />
                <input name="identificacion" value={formData.identificacion} onChange={handleChange} placeholder="Identificación" required className="p-2 border rounded" />
                <input type="email" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} placeholder="Correo Electrónico" required className="p-2 border rounded" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" required className="p-2 border rounded" />
                <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" className="p-2 border rounded" />
                <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" className="p-2 border rounded" />
                <input name="zona_geografica" value={formData.zona_geografica} onChange={handleChange} placeholder="Zona Geográfica" className="p-2 border rounded" />
                <textarea name="logros_adicionales" value={formData.logros_adicionales} onChange={handleChange} placeholder="Logros Adicionales" className="p-2 border rounded md:col-span-2" rows="2"></textarea>
            </div>

            {/* Sección dinámica de carreras */}
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Carreras Cursadas</h3>
                <div className="space-y-2">
                    {carreras.map((c, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                            <span>{c.nombre_carrera} ({c.ano_finalizacion})</span>
                            <button type="button" onClick={() => handleRemoveCarrera(index)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4 mt-4">
                    <input name="nombre_carrera" value={carreraActual.nombre_carrera} onChange={handleCarreraChange} placeholder="Nombre de la Carrera" className="p-2 border rounded flex-grow" />
                    <input type="number" name="ano_finalizacion" value={carreraActual.ano_finalizacion} onChange={handleCarreraChange} placeholder="Año" className="p-2 border rounded w-24" />
                    <button type="button" onClick={handleAddCarrera} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                        <PlusCircle size={22} />
                    </button>
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {loading ? 'Registrando...' : 'Registrar Graduado'}
            </button>
        </form>
    );
};

export default RegistroGraduado;
