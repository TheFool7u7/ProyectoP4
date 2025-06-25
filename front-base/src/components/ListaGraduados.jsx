import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './context/AuthContext';
import { Search, Edit, Trash2 } from 'lucide-react';
import EditGraduadoModal from './EditGraduadoModal';

const ListaGraduados = () => {
    const [graduados, setGraduados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGraduado, setSelectedGraduado] = useState(null);
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    // funcion para cargar datos
    const fetchGraduados = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/graduados`);
            if (!response.ok) throw new Error('No se pudo cargar la lista de graduados.');
            const data = await response.json();
            setGraduados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGraduados();
    }, [API_URL]);


    const handleEdit = (graduado) => {
        setSelectedGraduado(graduado);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGraduado(null);
    };

    const handleGraduadoUpdated = () => {
        fetchGraduados();
        handleCloseModal();
    };
    
    // funcion para cargar roles
    const handleRoleChange = async (perfilId, nuevoRol) => {
        try {
            const response = await fetch(`${API_URL}/api/perfiles/${perfilId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rol: nuevoRol }),
            });
            if (!response.ok) throw new Error('Error al actualizar el rol');
            
            // Actualiza el estado local para reflejar el cambio inmediatamente
            setGraduados(prevGraduados =>
                prevGraduados.map(g =>
                    g.perfil_id === perfilId ? { ...g, perfiles: { ...g.perfiles, rol: nuevoRol } } : g
                )
            );
            alert('Rol actualizado con éxito.');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };


    const handleDelete = async (graduadoId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar a este graduado? Esta acción no se puede deshacer.')) {
            try {
                const response = await fetch(`${API_URL}/api/graduados/${graduadoId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Error al eliminar');
                fetchGraduados();
                alert('Graduado eliminado con éxito.');
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const filteredGraduados = useMemo(() =>
        graduados.filter(g =>
            (g.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.identificacion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.correo_electronico || '').toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [graduados, searchTerm]
    );

    if (loading) return <div>Cargando graduados...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Lista de Graduados</h1>
            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, identificación o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredGraduados.map(graduado => (
                            <tr key={graduado.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{graduado.nombre_completo}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{graduado.identificacion}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{graduado.correo_electronico}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {graduado.perfiles?.rol}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <select 
                                            value={graduado.perfiles?.rol || ''} 
                                            onChange={(e) => handleRoleChange(graduado.perfil_id, e.target.value)}
                                            className="p-1 border rounded-md text-sm"
                                        >
                                            <option value="graduado_usuario">Graduado</option>
                                            <option value="facilitador">Facilitador</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                        <button onClick={() => handleEdit(graduado)} className="text-indigo-600 hover:text-indigo-900"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(graduado.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <EditGraduadoModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    graduado={selectedGraduado}
                    onSave={handleGraduadoUpdated}
                />
            )}
        </div>
    );
};

export default ListaGraduados;
