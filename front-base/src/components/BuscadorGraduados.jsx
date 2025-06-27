import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import SearchBar from './SearchBar'; 

const BuscadorGraduados = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSearch = async (term) => {
        if (!term.trim()) {
            setResultados([]);
            setSearchPerformed(true);
            return;
        }

        setLoading(true);
        setError(null);
        setSearchPerformed(true);

        try {
            const response = await fetch(`${API_URL}/api/graduados/buscar?q=${encodeURIComponent(term)}`);
            if (!response.ok) {
                throw new Error('La búsqueda falló. Intenta de nuevo.');
            }
            const data = await response.json();
            setResultados(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold mb-6">Directorio de Graduados</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <SearchBar
                    searchTitle="Graduados por nombre o carrera"
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    onSearchSubmit={handleSearch}
                />

            </div>

            {loading && <p className="text-center">Buscando...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && searchPerformed && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Resultados de la Búsqueda</h2>
                    {resultados.length > 0 ? (
                        <div className="space-y-4">
                            {resultados.map(graduado => (
                                <Link
                                    key={graduado.id}
                                    to={`/perfil-publico/${graduado.id}`}
                                    className="block p-4 border rounded-lg hover:bg-gray-50 hover:shadow transition-all"
                                >
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 p-3 rounded-full mr-4">
                                            <User className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-blue-700">{graduado.nombre_completo}</p>
                                            <p className="text-sm text-gray-600">{graduado.correo_electronico}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No se encontraron graduados que coincidan con tu búsqueda.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuscadorGraduados;