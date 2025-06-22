import React, { useState, useEffect } from 'react';

const EditGraduadoModal = ({ isOpen, onClose, graduado, onGraduadoUpdated }) => {
    const [formData, setFormData] = useState({});
    const API_URL = import.meta.env.VITE_API_URL;

    // Este Effect se ejecuta cuando el 'graduado' que pasamos como prop cambia.
    // Se encarga de rellenar el formulario con los datos del graduado a editar.
    useEffect(() => {
        if (graduado) {
            setFormData(graduado);
        }
    }, [graduado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id) return;

        try {
            const response = await fetch(`${API_URL}/api/graduados/${formData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Error al actualizar');
            }

            onGraduadoUpdated(result.data); // Llama a la función del padre para actualizar la lista
            onClose(); // Cierra el modal
            alert('¡Graduado actualizado!');

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (!isOpen) return null; // Si no está abierto, no renderiza nada

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl z-50">
                <h2 className="text-2xl font-bold mb-4">Editar Graduado</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nombre_completo_edit" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" name="nombre_completo" id="nombre_completo_edit" value={formData.nombre_completo || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="identificacion_edit" className="block text-sm font-medium text-gray-700">Identificación</label>
                            <input type="text" name="identificacion" id="identificacion_edit" value={formData.identificacion || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="correo_electronico_edit" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <input type="email" name="correo_electronico" id="correo_electronico_edit" value={formData.correo_electronico || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="telefono_edit" className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" name="telefono" id="telefono_edit" value={formData.telefono || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGraduadoModal;