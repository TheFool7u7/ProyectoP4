// En src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BookOpen, ClipboardList, Loader2, AlertCircle } from 'lucide-react'; // Añadido Loader2 y AlertCircle

const Dashboard = () => {
    const [talleres, setTalleres] = useState([]);
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null); // Limpiar errores anteriores
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

                if (!talleresRes.ok) {
                    throw new Error("Error al cargar los talleres disponibles.");
                }
                if (!encuestasRes.ok) {
                    throw new Error("Error al cargar las encuestas.");
                }
                if (!inscripcionesRes.ok) {
                    // Si no hay inscripciones, no es un error crítico, pero lo manejamos
                    const inscripcionErrorText = await inscripcionesRes.text();
                    console.warn("Advertencia al cargar inscripciones:", inscripcionErrorText);
                    // Procede sin misIdsDeTalleres o con un array vacío
                }

                const todosLosTalleres = await talleresRes.json();
                const todasLasEncuestas = await encuestasRes.json();
                const misIdsDeTalleres = inscripcionesRes.ok ? await inscripcionesRes.json() : [];


                const talleresDisponibles = todosLosTalleres.filter(taller => taller.publicado && !taller.cancelado);

                const encuestasFiltradas = todasLasEncuestas.filter(encuesta => {
                    if (!encuesta.taller_id) return true; // Encuestas no asociadas a taller son para todos
                    return misIdsDeTalleres.includes(encuesta.taller_id); // Encuestas asociadas a talleres en los que el usuario está inscrito
                });

                setTalleres(talleresDisponibles.slice(0, 3)); // Mostrar solo los primeros 3
                setEncuestas(encuestasFiltradas.slice(0, 3)); // Mostrar solo las primeras 3

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [API_URL]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)' }}>
            <Loader2 size={48} className="animate-spin text-[#EDEDDD]" />
            <p className="text-center p-10 text-[#EDEDDD] text-lg font-semibold">Cargando tu página de inicio...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)' }}>
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-center text-red-300 p-10 text-lg font-semibold">Error: {error}</p>
        </div>
    );

    return (
        <div
            className="min-h-screen p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)'
            }}
        >
            <div
                className="relative z-10 w-full max-w-7xl mx-auto backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-10 opacity-0 animate-slideUp"
                style={{ backgroundColor: 'rgba(237, 237, 221, 0.95)' }}
            >
                <h1
                    className="text-3xl font-bold mb-8 text-center opacity-0 animate-fadeIn animation-delay-300"
                    style={{ color: '#1B1717' }}
                >
                    Inicio
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                    {/* Próximos Talleres Card */}
                    <div className="opacity-0 animate-slideInLeft animation-delay-500 p-6 rounded-xl shadow-lg border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#1B1717' }}>
                            <BookOpen className="mr-3 text-[#630000]" size={28} /> Próximos Talleres
                        </h2>
                        {talleres.length > 0 ? (
                            <div className="space-y-4">
                                {talleres.map(taller => (
                                    <div key={taller.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: '#810100' }}>
                                        <h3 className="font-bold text-lg text-[#1B1717]">{taller.nombre}</h3>
                                        <p className="text-sm text-gray-600 mb-2">Inicia: {new Date(taller.fecha_inicio).toLocaleDateString()}</p>
                                        <p className="text-gray-700 text-sm truncate">{taller.descripcion}</p>
                                        {/* Podrías añadir un botón para ver detalles o inscribirse */}
                                        <Link to={`/taller/${taller.id}`} className="text-[#630000] font-semibold mt-3 inline-block text-sm hover:underline">Ver detalles</Link>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-600 text-center">No hay talleres disponibles.</p>}
                        <Link to="/catalogo-talleres"
                            className="inline-block mt-6 px-6 py-2 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #630000, #810100)',
                                boxShadow: '0 5px 15px rgba(129, 1, 0, 0.2)',
                                focusRingColor: '#810100'
                            }}
                        >
                            Ver todos los talleres &rarr;
                        </Link>
                    </div>

                    {/* Encuestas para Ti Card */}
                    <div className="opacity-0 animate-slideInLeft animation-delay-700 p-6 rounded-xl shadow-lg border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#1B1717' }}>
                            <ClipboardList className="mr-3 text-[#630000]" size={28} /> Encuestas para Ti
                        </h2>
                        {encuestas.length > 0 ? (
                            <div className="space-y-4">
                                {encuestas.map(encuesta => (
                                    <div key={encuesta.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200" style={{ borderColor: '#810100' }}>
                                        <h3 className="font-bold text-lg text-[#1B1717]">{encuesta.titulo}</h3>
                                        <p className="text-gray-700 text-sm truncate">{encuesta.descripcion}</p>
                                        <Link to={`/realizar-encuesta/${encuesta.id}`} className="text-[#630000] font-semibold mt-3 inline-block text-sm hover:underline">Realizar encuesta</Link>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-600 text-center">No tienes encuestas pendientes.</p>}
                        <Link to="/ver-encuestas" // Asumo esta ruta para ver todas las encuestas
                            className="inline-block mt-6 px-6 py-2 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #630000, #810100)',
                                boxShadow: '0 5px 15px rgba(129, 1, 0, 0.2)',
                                focusRingColor: '#810100'
                            }}
                        >
                            Ver todas las encuestas &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* shake solo si hay mensajes de error que lo usen, si no, se puede quitar */
                @keyframes shake {
                    0%, 100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                .animate-slideUp {
                    animation: slideUp 0.8s ease-out forwards;
                }

                .animate-slideInLeft {
                    animation: slideInLeft 0.6s ease-out forwards;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }

                .animate-shake {
                    animation: shake 0.5s ease-out forwards;
                }

                .animation-delay-300 { animation-delay: 300ms; }
                .animation-delay-500 { animation-delay: 500ms; }
                .animation-delay-700 { animation-delay: 700ms; }
            `}</style>
        </div>
    );
};

export default Dashboard;