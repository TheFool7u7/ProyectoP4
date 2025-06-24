import React, { useState, useEffect } from 'react';
import { Trash2, Pencil } from 'lucide-react';

const GestionAreas = () => {
    const [areas, setAreas] = useState([]);
    const [newArea, setNewArea] = useState({ nombre_area: '', descripcion: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await fetch(`${API_URL}/api/areas`);
                if (!response.ok) throw new Error('Error al cargar las áreas');
                const data = await response.json();
                setAreas(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAreas();
    }, [API_URL]);

    const handleNewAreaChange = (e) => {
        const { name, value } = e.target;
        setNewArea(prevState => ({ ...prevState, [name]: value }));
    };
    const handleNewAreaSubmit = async (e) => {
        e.preventDefault();
        if (!newArea.nombre_area.trim()) return alert('El nombre del área es obligatorio.');
        try {
            const response = await fetch(`${API_URL}/api/areas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newArea),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'No se pudo crear el área');
            setAreas([...areas, result]);
            setNewArea({ nombre_area: '', descripcion: '' });
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que quieres eliminar esta área?')) return;
        try {
            const response = await fetch(`${API_URL}/api/areas/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar');
            setAreas(areas.filter(a => a.id !== id));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleOpenEditModal = (area) => {
        setEditingArea(area);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingArea(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingArea(prevState => ({ ...prevState, [name]: value }));
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!editingArea || !editingArea.nombre_area.trim()) return alert('El nombre es obligatorio');

        try {
            const response = await fetch(`${API_URL}/api/areas/${editingArea.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_area: editingArea.nombre_area,
                    descripcion: editingArea.descripcion,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar');

            setAreas(areas.map(a => a.id === result.id ? result : a));
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Añadir Nueva Área de Interés</h2>
                <form onSubmit={handleNewAreaSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="nombre_area" className="block text-sm font-medium text-gray-700">Nombre del Área</label>
                        <input type="text" name="nombre_area" id="nombre_area" value={newArea.nombre_area} onChange={handleNewAreaChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                        <input type="text" name="descripcion" id="descripcion" value={newArea.descripcion} onChange={handleNewAreaChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="md:col-span-1">
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                            Añadir Área
                        </button>
                    </div>
                </form>
            </div>
            {/* Tabla de Áreas*/}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Áreas de Interés Existentes</h2>
                {loading && <p>Cargando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {areas.map((area) => (
                                    <tr key={area.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{area.nombre_area}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{area.descripcion}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                            <button onClick={() => handleOpenEditModal(area)} className="text-blue-600 hover:text-blue-900" title="Editar">
                                                <Pencil size={20} />
                                            </button>
                                            <button onClick={() => handleDelete(area.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && editingArea && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg z-50">
                        <h2 className="text-xl font-bold mb-4">Editar Área de Interés</h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="edit_nombre_area" className="block text-sm font-medium text-gray-700">Nombre del Área</label>
                                    <input type="text" name="nombre_area" id="edit_nombre_area" value={editingArea.nombre_area} onChange={handleEditChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                                <div>
                                    <label htmlFor="edit_descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <input type="text" name="descripcion" id="edit_descripcion" value={editingArea.descripcion} onChange={handleEditChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAreas;