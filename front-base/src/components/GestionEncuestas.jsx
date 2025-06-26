import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, ListPlus, BarChartHorizontal } from 'lucide-react';

const GestionEncuestas = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEncuesta, setCurrentEncuesta] = useState(null);
    const [listaTalleres, setListaTalleres] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;
    const tiposDeEncuesta = ['satisfaccion_taller', 'evaluacion_impacto', 'satisfaccion_general_plataforma'];

    const fetchEncuestas = async () => {
        setLoading(true);
        try {
            const encuestasRes = await fetch(`${API_URL}/api/encuestas?creada_por_perfil_id=${user.id}`);
            if (!encuestasRes.ok) throw new Error('Error al recargar las encuestas');
            const encuestasData = await encuestasRes.json();
            setEncuestas(encuestasData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [encuestasRes, talleresRes] = await Promise.all([
                    fetch(`${API_URL}/api/encuestas?creada_por_perfil_id=${user.id}`),
                    fetch(`${API_URL}/api/talleres`)
                ]);

                if (!encuestasRes.ok || !talleresRes.ok) throw new Error('Error al cargar los datos iniciales');

                setEncuestas(await encuestasRes.json());
                setListaTalleres(await talleresRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [API_URL, user.id]);

    const handleOpenModal = (encuesta = null) => {
        if (encuesta) {
            setIsEditing(true);
            setCurrentEncuesta(encuesta);
        } else {
            setIsEditing(false);
            setCurrentEncuesta({
                titulo: '',
                descripcion: '',
                taller_id: '',
                tipo: tiposDeEncuesta[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEncuesta(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentEncuesta(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing ? `${API_URL}/api/encuestas/${currentEncuesta.id}` : `${API_URL}/api/encuestas`;
        const method = isEditing ? 'PUT' : 'POST';
        const body = { ...currentEncuesta, creada_por_perfil_id: user.id };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Falló la operación');

            fetchEncuestas();
            handleCloseModal();

        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta encuesta?')) return;
        try {
            const response = await fetch(`${API_URL}/api/encuestas/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('No se pudo eliminar la encuesta.');
            setEncuestas(encuestas.filter(enc => enc.id !== id));
        } catch (err) {
            alert(`Error al eliminar: ${err.message}`);
        }
    };

    if (loading) return <p>Cargando encuestas...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Encuestas</h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                    <Plus size={20} />
                    Crear Encuesta
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taller Asociado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {encuestas.map(encuesta => (
                            <tr key={encuesta.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{encuesta.titulo}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{encuesta.tipo.replace(/_/g, ' ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {listaTalleres.find(t => t.id === encuesta.taller_id)?.nombre || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-4">
                                    <Link to={`/encuesta/${encuesta.id}/resultados`} className="text-yellow-600 hover:text-yellow-900" title="Ver Resultados">
                                        <BarChartHorizontal size={20} />
                                    </Link>
                                    <Link to={`/encuesta/preview/${encuesta.id}`} className="text-green-600 hover:text-green-900" title="Vista Previa">
                                        <Eye size={20} />
                                    </Link>
                                    <Link to={`/encuesta/builder/${encuesta.id}`} className="text-purple-600 hover:text-purple-900" title="Diseñar Preguntas">
                                        <ListPlus size={20} />
                                    </Link>
                                    <button onClick={() => handleOpenModal(encuesta)} className="text-blue-600 hover:text-blue-900" title="Editar Encuesta">
                                        <Pencil size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(encuesta.id)} className="text-red-600 hover:text-red-900" title="Eliminar Encuesta">
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl z-50">
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Encuesta' : 'Crear Nueva Encuesta'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="titulo" value={currentEncuesta.titulo || ''} onChange={handleChange} placeholder="Título de la Encuesta" className="w-full p-2 border rounded" required />
                            <textarea name="descripcion" value={currentEncuesta.descripcion || ''} onChange={handleChange} placeholder="Descripción" className="w-full p-2 border rounded" rows="3"></textarea>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo de Encuesta</label>
                                    <select name="tipo" id="tipo" value={currentEncuesta.tipo || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" required >
                                        {tiposDeEncuesta.map(tipo => (
                                            <option key={tipo} value={tipo}>
                                                {tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="taller_id" className="block text-sm font-medium text-gray-700">Taller Asociado (Opcional)</label>
                                    <select name="taller_id" id="taller_id" value={currentEncuesta.taller_id || ''} onChange={handleChange} className="w-full p-2 border rounded mt-1" >
                                        <option value="">Sin Taller Asociado</option>
                                        {listaTalleres.map(taller => (
                                            <option key={taller.id} value={taller.id}>
                                                {taller.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                                <button type="button" onClick={handleCloseModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">{isEditing ? 'Guardar Cambios' : 'Crear Encuesta'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEncuestas;