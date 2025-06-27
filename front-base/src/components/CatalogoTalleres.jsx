import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag } from 'lucide-react';

const CatalogoTalleres = () => {
    const [talleres, setTalleres] = useState([]);
    const [allAreas, setAllAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAreas, setSelectedAreas] = useState(new Set());
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchFilteredTalleres = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('nombre', searchTerm);
            }
            if (selectedAreas.size > 0) {
                params.append('areas', Array.from(selectedAreas).join(','));
            }

            const response = await fetch(`${API_URL}/api/talleres/buscar?${params.toString()}`);
            if (!response.ok) throw new Error('No se pudieron cargar los talleres.');
            const data = await response.json();
            setTalleres(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [API_URL, searchTerm, selectedAreas]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [talleresRes, areasRes] = await Promise.all([
                    fetch(`${API_URL}/api/talleres/buscar`),
                    fetch(`${API_URL}/api/areas`)
                ]);
                if (!talleresRes.ok || !areasRes.ok) throw new Error('Error al cargar datos iniciales.');

                setTalleres(await talleresRes.json());
                setAllAreas(await areasRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [API_URL]);

    const handleAreaToggle = (areaId) => {
        const newSelectedAreas = new Set(selectedAreas);
        if (newSelectedAreas.has(areaId)) {
            newSelectedAreas.delete(areaId);
        } else {
            newSelectedAreas.add(areaId);
        }
        setSelectedAreas(newSelectedAreas);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchFilteredTalleres();
    };

    useEffect(() => {
        fetchFilteredTalleres();
    }, [selectedAreas, fetchFilteredTalleres]);


    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold mb-8">Catálogo de Talleres</h1>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="search-term" className="block text-sm font-medium text-gray-700">Buscar por nombre</label>
                        <div className="mt-1 relative">
                            <input
                                type="text"
                                id="search-term"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ej: Finanzas Personales"
                                className="w-full p-2 pl-10 border rounded-md"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">
                        Buscar
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por área de interés</label>
                    <div className="flex flex-wrap gap-2">
                        {allAreas.map(area => (
                            <button
                                key={area.id}
                                onClick={() => handleAreaToggle(area.id)}
                                className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full border-2 transition-colors ${selectedAreas.has(area.id)
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                    }`}
                            >
                                <Tag size={14} /> {area.nombre_area}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? <p className="text-center">Cargando...</p> : error ? <p className="text-red-500">{error}</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {talleres.length > 0 ? talleres.map(taller => (
                        <div key={taller.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            <div className="p-6 flex-grow">
                                <h2 className="text-xl font-bold mb-2">{taller.nombre}</h2>
                                <p className="text-sm text-gray-500 mb-2">Facilitador: {taller.facilitador?.nombre_completo || 'No asignado'}</p>
                                <p className="text-gray-700 text-sm">{taller.descripcion}</p>
                            </div>
                            <div className="p-6 bg-gray-50 border-t">
                                <Link to={`/taller/${taller.id}`} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full text-center block hover:bg-blue-700">
                                    Ver Detalles
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 col-span-full">No se encontraron talleres que coincidan con tu búsqueda.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CatalogoTalleres;