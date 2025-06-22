import React, { useState, useEffect } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import EditGraduadoModal from './EditGraduadoModal';

const ListaGraduados = () => {
    const [graduados, setGraduados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGraduado, setSelectedGraduado] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchGraduados = async () => {
            try {
                const response = await fetch(`${API_URL}/api/graduados`);
                if (!response.ok) throw new Error('La respuesta de la red no fue correcta');
                const data = await response.json();
                setGraduados(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGraduados();
    }, [API_URL]);

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este graduado?')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/graduados/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar el graduado.');
            setGraduados(graduados.filter(g => g.id !== id));
            alert('Graduado eliminado con éxito.');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleOpenEditModal = (graduado) => {
        setSelectedGraduado(graduado);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGraduado(null);
    };

    const handleGraduadoUpdated = (updatedGraduado) => {
        setGraduados(graduados.map(g => g.id === updatedGraduado.id ? updatedGraduado : g));
    };

    if (loading) return <div className="text-center p-4">Cargando graduados...</div>;
    if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Lista de Graduados</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {graduados.map((graduado) => (
                            <tr key={graduado.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{graduado.nombre_completo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{graduado.identificacion}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-4">
                                    <button onClick={() => handleOpenEditModal(graduado)} className="text-blue-600 hover:text-blue-900" title="Editar">
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(graduado.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EditGraduadoModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                graduado={selectedGraduado}
                onGraduadoUpdated={handleGraduadoUpdated}
            />
        </div>
    );
};

export default ListaGraduados;