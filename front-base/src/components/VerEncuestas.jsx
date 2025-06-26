import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

const VerEncuestas = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDatosParaFiltrar = async () => {
            setLoading(true);
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                if (!session) throw new Error("Usuario no autenticado. No se puede cargar la lista de encuestas.");

                const token = session.access_token;

                const [encuestasRes, inscripcionesRes] = await Promise.all([
                    fetch(`${API_URL}/api/encuestas`),
                    fetch(`${API_URL}/api/perfil/mis-inscripciones`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!encuestasRes.ok || !inscripcionesRes.ok) {
                    throw new Error("Error al cargar los datos necesarios.");
                }
                
                const todasLasEncuestas = await encuestasRes.json();
                const misIdsDeTalleres = await inscripcionesRes.json();

                const encuestasFiltradas = todasLasEncuestas.filter(encuesta => {
                    if (!encuesta.taller_id) {
                        return true;
                    }
                    return misIdsDeTalleres.includes(encuesta.taller_id);
                });
                
                setEncuestas(encuestasFiltradas);

            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDatosParaFiltrar();
    }, [API_URL]);

    if (loading) return <p className="text-center p-10">Cargando encuestas disponibles...</p>;
    if (error) return <p className="text-center text-red-500 p-10">Error: {error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Encuestas Disponibles</h1>
            {encuestas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {encuestas.map(encuesta => (
                        <div key={encuesta.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">{encuesta.titulo}</h2>
                                <p className="text-gray-600 mb-4">{encuesta.descripcion}</p>
                            </div>
                            <Link 
                                to={`/encuesta/${encuesta.id}`} 
                                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                            >
                                Realizar Encuesta
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No hay encuestas disponibles para ti en este momento.</p>
            )}
        </div>
    );
};

export default VerEncuestas;