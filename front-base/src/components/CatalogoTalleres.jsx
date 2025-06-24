import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const CatalogoTalleres = () => {
    const [talleres, setTalleres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchTalleresPublicados = async () => {
            try {
                const response = await fetch(`${API_URL}/api/catalogo/talleres`);
                if (!response.ok) {
                    throw new Error('No se pudo cargar el catálogo de talleres.');
                }
                const data = await response.json();
                setTalleres(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTalleresPublicados();
    }, [API_URL]);

    if (loading) return <p className="text-center p-4">Cargando talleres disponibles...</p>;
    if (error) return <p className="text-center p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">Catálogo de Talleres</h1>
            
            {talleres.length === 0 ? (
                <p className="text-center text-gray-500">No hay talleres publicados en este momento. ¡Vuelve pronto!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {talleres.map(taller => (
                        <div key={taller.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <div className="p-6 flex-grow">
                                <h2 className="text-xl font-bold mb-2 text-blue-700">{taller.nombre}</h2>
                                <p className="text-gray-600 text-sm mb-4">{taller.descripcion}</p>
                                
                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-blue-500" />
                                        <span>{new Date(taller.fecha_inicio).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-blue-500" />
                                        <span>Cupo: {taller.cupo_maximo} personas</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-500" />
                                        <span>Modalidad: {taller.modalidad}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4">
                                <Link to={`/taller/${taller.id}`} className="block w-full">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        Ver Detalles
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CatalogoTalleres;