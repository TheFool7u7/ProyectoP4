import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom'; 
import { Plus, Pencil, Trash2, ClipboardCheck } from 'lucide-react';

const GestionTalleres = () => {
    const { user } = useAuth();
    const [talleres, setTalleres] = useState([]);
    const [facilitadores, setFacilitadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [allAreas, setAllAreas] = useState([]);
    const [currentTaller, setCurrentTaller] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [talleresRes, areasRes, facilitadoresRes] = await Promise.all([
                    fetch(`${API_URL}/api/talleres`),
                    fetch(`${API_URL}/api/areas`),
                    fetch(`${API_URL}/api/usuarios/facilitadores`)
                ]);
                if (!talleresRes.ok || !areasRes.ok || !facilitadoresRes.ok) throw new Error('Error al cargar los datos iniciales');
                
                const talleresData = await talleresRes.json();
                const areasData = await areasRes.json();
                const facilitadoresData = await facilitadoresRes.json();
                
                setTalleres(talleresData);
                setAllAreas(areasData);
                setFacilitadores(facilitadoresData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [API_URL]);

    const handleOpenModal = async (taller = null) => {
        if (taller) {
            setIsEditing(true);
            try {
                const response = await fetch(`${API_URL}/api/talleres/${taller.id}/areas`);
                if (!response.ok) throw new Error('No se pudieron cargar las áreas del taller.');
                const associatedAreaIds = await response.json();
                const formattedTaller = {
                    ...taller,
                    fecha_inicio: taller.fecha_inicio ? new Date(taller.fecha_inicio).toISOString().slice(0, 16) : '',
                    fecha_fin: taller.fecha_fin ? new Date(taller.fecha_fin).toISOString().slice(0, 16) : '',
                    areas_ids: associatedAreaIds
                };
                setCurrentTaller(formattedTaller);
            } catch (err) {
                alert(err.message);
                return;
            }
        } else {
            setIsEditing(false);
            setCurrentTaller({
                nombre: '', descripcion: '', objetivos: '', fecha_inicio: '', fecha_fin: '',
                cupo_maximo: 0, modalidad: 'Virtual', publicado: false, areas_ids: [],
                facilitador_perfil_id: user.rol === 'facilitador' ? user.id : ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTaller(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentTaller(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAreaChange = (areaId) => {
        const currentIds = new Set(currentTaller.areas_ids || []);
        if (currentIds.has(areaId)) {
            currentIds.delete(areaId);
        } else {
            currentIds.add(areaId);
        }
        setCurrentTaller(prev => ({ ...prev, areas_ids: Array.from(currentIds) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${API_URL}/api/talleres/${currentTaller.id}` : `${API_URL}/api/talleres`;
        const method = isEditing ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentTaller),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Falló la operación');
            if (isEditing) {
                setTalleres(talleres.map(t => t.id === result.id ? result : t));
            } else {
                setTalleres([...talleres, result]);
            }
            handleCloseModal();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este taller?')) return;
        try {
            const response = await fetch(`${API_URL}/api/talleres/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('No se pudo eliminar el taller.');
            setTalleres(talleres.filter(t => t.id !== id));
        } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    const talleresMostrados = user.rol === 'facilitador'
        ? talleres.filter(taller => taller.facilitador_perfil_id === user.id)
        : talleres;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {user.rol === 'facilitador' ? 'Mis Talleres Asignados' : 'Gestión de Talleres'}
                </h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Crear Taller
                </button>
            </div>

            <div className="overflow-x-auto">
                {loading ? <p className="text-center py-4">Cargando...</p> : error ? <p className="text-red-500 text-center py-4">{error}</p> :
                <>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publicado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {talleresMostrados.map(taller => (
                                <tr key={taller.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{taller.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(taller.fecha_inicio).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{taller.modalidad}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${taller.publicado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{taller.publicado ? 'Sí' : 'No'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                                        {/* 2. Se añade el Link que lleva a la página de asistencia del taller */}
                                        <Link to={`/taller/${taller.id}/asistencia`} className="text-green-600 hover:text-green-900" title="Ver Inscritos y Asistencia">
                                            <ClipboardCheck size={20} />
                                        </Link>
                                        <button onClick={() => handleOpenModal(taller)} className="text-blue-600 hover:text-blue-900" title="Editar Taller">
                                            <Pencil size={20} />
                                        </button>
                                        {user.rol === 'administrador' && (
                                            <button onClick={() => handleDelete(taller.id)} className="text-red-600 hover:text-red-900" title="Eliminar Taller">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {talleresMostrados.length === 0 && !loading && (
                        <p className="text-center text-gray-500 py-4">
                            {user.rol === 'facilitador' ? 'Aún no tienes talleres asignados.' : 'No hay talleres para mostrar.'}
                        </p>
                    )}
                </>
                }
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{isEditing ? 'Editar Taller' : 'Crear Nuevo Taller'}</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="nombre" value={currentTaller.nombre} onChange={handleChange} placeholder="Nombre del Taller" className="w-full p-2 border rounded" required />
                            <textarea name="descripcion" value={currentTaller.descripcion} onChange={handleChange} placeholder="Descripción" className="w-full p-2 border rounded" rows="3"></textarea>
                            <textarea name="objetivos" value={currentTaller.objetivos} onChange={handleChange} placeholder="Objetivos" className="w-full p-2 border rounded" rows="3"></textarea>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label>Fecha de Inicio</label><input type="datetime-local" name="fecha_inicio" value={currentTaller.fecha_inicio} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                                <div><label>Fecha de Fin</label><input type="datetime-local" name="fecha_fin" value={currentTaller.fecha_fin} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                                <div><label>Cupo Máximo</label><input type="number" name="cupo_maximo" value={currentTaller.cupo_maximo} onChange={handleChange} placeholder="0" className="w-full p-2 border rounded" /></div>
                                <div><label>Modalidad</label><select name="modalidad" value={currentTaller.modalidad} onChange={handleChange} className="w-full p-2 border rounded"><option>Virtual</option><option>Presencial</option><option>Híbrido</option></select></div>
                                <div>
                                    <label>Facilitador Asignado</label>
                                    {user.rol === 'administrador' ? (
                                        <select name="facilitador_perfil_id" value={currentTaller.facilitador_perfil_id || ''} onChange={handleChange} className="w-full p-2 border rounded" required>
                                            <option value="" disabled>-- Seleccione un facilitador --</option>
                                            {facilitadores.map(f => (
                                                <option key={f.id} value={f.id}>{f.nombre_completo}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input type="text" value={user.nombre_completo} className="w-full p-2 border rounded bg-gray-100" disabled />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de Interés Asociadas</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                                    {allAreas.map(area => (
                                        <label key={area.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={currentTaller.areas_ids?.includes(area.id) || false}
                                                onChange={() => handleAreaChange(area.id)}
                                            />
                                            <span className="text-sm">{area.nombre_area}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="publicado" checked={currentTaller.publicado || false} onChange={handleChange} id="publicado_check" className="h-4 w-4 rounded" />
                                <label htmlFor="publicado_check">Publicado</label>
                            </div>
                            <div className="flex justify-end gap-4 border-t pt-4 mt-4">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'Guardar Cambios' : 'Crear Taller'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionTalleres;