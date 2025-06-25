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

    // funcion para cambiar entre perfiles
    const handleRoleChange = async (perfilId, nuevoRol) => {
        try {
            const response = await fetch(`${API_URL}/api/perfiles/${perfilId}/rol`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rol: nuevoRol })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "No se pudo actualizar el rol.");
            }

            // se actualiza el estado local para ver el cambio al instante
            setGraduados(graduados.map(g => 
                g.perfil_id === perfilId ? { ...g, rol: nuevoRol } : g
            ));
            alert("Rol actualizado con éxito.");
        } catch (error) {
            console.error("Error al cambiar el rol:", error);
            alert(error.message);
        }
    };

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
            <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Lista de Graduados y Usuarios</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificación</th>
                            {/* columna rol */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Actual</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {graduados.map((graduado) => (
                            <tr key={graduado.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{graduado.nombre_completo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{graduado.identificacion}</td>
                                {/* celda rol */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        graduado.rol === 'administrador' ? 'bg-red-100 text-red-800' :
                                        graduado.rol === 'facilitador' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {graduado.rol ? graduado.rol.replace('_', ' ') : 'No asignado'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                                    {/* menu desplegable para rol añadido*/}
                                    {graduado.perfil_id && (
                                        <select 
                                            value={graduado.rol} 
                                            onChange={(e) => handleRoleChange(graduado.perfil_id, e.target.value)}
                                            className="p-1 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="graduado_usuario">Graduado</option>
                                            <option value="facilitador">Facilitador</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                    )}
                                    <button onClick={() => handleOpenEditModal(graduado)} className="text-blue-600 hover:text-blue-900" title="Editar Datos">
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(graduado.id)} className="text-red-600 hover:text-red-900" title="Eliminar Graduado">
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