import React, { useState } from 'react';

const RegistroGraduado = () => {
    const initialFormState = {
        nombre_completo: '',
        identificacion: '',
        email: '',
        password: '',
        carrera_cursada: '',
        ano_graduacion: '',
        // Se pueden añadir más campos aquí, ademas se deben de agregar en el backent
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/api/graduados/admin-create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.details || 'Ocurrió un error');

            setSuccess(`¡Usuario ${result.data.email} creado con éxito!`);
            setFormData(initialFormState); // Limpiar el formulario

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Registrar Nuevo Graduado (Admin)</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="nombre_completo" placeholder="Nombre Completo" value={formData.nombre_completo} onChange={handleChange} required className="p-2 border rounded" />
                    <input type="text" name="identificacion" placeholder="Identificación" value={formData.identificacion} onChange={handleChange} required className="p-2 border rounded" />
                    <input type="email" name="email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} required className="p-2 border rounded" />
                    <input type="password" name="password" placeholder="Contraseña Temporal" value={formData.password} onChange={handleChange} required className="p-2 border rounded" />
                    <input type="text" name="carrera_cursada" placeholder="Carrera Cursada" value={formData.carrera_cursada} onChange={handleChange} className="p-2 border rounded" />
                    <input type="number" name="ano_graduacion" placeholder="Año de Graduación" value={formData.ano_graduacion} onChange={handleChange} className="p-2 border rounded" />
                </div>

                {error && <p className="text-red-600 text-center">{error}</p>}
                {success && <p className="text-green-600 text-center">{success}</p>}

                <div className="text-right">
                    <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400">
                        {loading ? 'Creando Usuario...' : 'Crear Graduado y Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistroGraduado;