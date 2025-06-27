// En src/components/Dashboard.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, ClipboardList } from 'lucide-react';

const Dashboard = () => {
    const [talleres, setTalleres] = useState([]);
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                if (!session) throw new Error("Usuario no autenticado.");

                const token = session.access_token;

                const [talleresRes, encuestasRes, inscripcionesRes] = await Promise.all([
                    fetch(`${API_URL}/api/talleres`),
                    fetch(`${API_URL}/api/encuestas`),
                    fetch(`${API_URL}/api/perfil/mis-inscripciones`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!talleresRes.ok || !encuestasRes.ok || !inscripcionesRes.ok) {
                    throw new Error("Error al cargar los datos del dashboard.");
                }

                const todosLosTalleres = await talleresRes.json();
                const todasLasEncuestas = await encuestasRes.json();
                const misIdsDeTalleres = await inscripcionesRes.json();

                const talleresDisponibles = todosLosTalleres.filter(taller => taller.publicado && !taller.cancelado);

                const encuestasFiltradas = todasLasEncuestas.filter(encuesta => {
                    if (!encuesta.taller_id) return true;
                    return misIdsDeTalleres.includes(encuesta.taller_id);
                });

                setTalleres(talleresDisponibles.slice(0, 3));
                setEncuestas(encuestasFiltradas.slice(0, 3));

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [API_URL]);

    if (loading) return <p className="text-center p-10">Cargando tu página de inicio...</p>;
    if (error) return <p className="text-center text-red-500 p-10">Error: {error}</p>;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold mb-8">Inicio</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><BookOpen className="mr-3 text-blue-500" /> Próximos Talleres</h2>
                    {talleres.length > 0 ? (
                        <div className="space-y-4">
                            {talleres.map(taller => (
                                <div key={taller.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                    <h3 className="font-bold text-lg">{taller.nombre}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Inicia: {new Date(taller.fecha_inicio).toLocaleDateString()}</p>
                                    <p className="text-gray-700 text-sm truncate">{taller.descripcion}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500">No hay talleres disponibles.</p>}
                    <Link to="/catalogo-talleres" className="text-blue-600 font-semibold mt-6 inline-block hover:underline">Ver todos los talleres &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><ClipboardList className="mr-3 text-green-500" /> Encuestas para Ti</h2>
                    {encuestas.length > 0 ? (
                        <div className="space-y-4">
                            {encuestas.map(encuesta => (
                                <div key={encuesta.id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                                    <h3 className="font-bold text-lg">{encuesta.titulo}</h3>
                                    <p className="text-gray-700 text-sm truncate">{encuesta.descripcion}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500">No tienes encuestas pendientes.</p>}
                    <Link to="/encuestas" className="text-green-600 font-semibold mt-6 inline-block hover:underline">Ver todas las encuestas &rarr;</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;