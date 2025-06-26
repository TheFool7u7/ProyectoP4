import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, BarChart2, MessageSquare, ArrowLeft } from 'lucide-react';

const ResultadosEncuesta = () => {
    const { encuestaId } = useParams();
    const [encuesta, setEncuesta] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [resultados, setResultados] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchResultados = async () => {
            setLoading(true);
            try {
                const [encuestaRes, preguntasRes, respuestasRes] = await Promise.all([
                    fetch(`${API_URL}/api/encuestas/${encuestaId}`),
                    fetch(`${API_URL}/api/encuestas/${encuestaId}/preguntas`),
                    fetch(`${API_URL}/api/encuestas/${encuestaId}/respuestas`)
                ]);

                if (!encuestaRes.ok || !preguntasRes.ok || !respuestasRes.ok) {
                    throw new Error('No se pudieron cargar los datos de resultados.');
                }

                const encuestaData = await encuestaRes.json();
                const preguntasData = await preguntasRes.json();
                const respuestasData = await respuestasRes.json();

                setEncuesta(encuestaData);
                setPreguntas(preguntasData);

                const resultadosAgregados = {};
                preguntasData.forEach(pregunta => {
                    const respuestasFiltradas = respuestasData.filter(r => r.pregunta_id === pregunta.id);
                    
                    if (['texto_abierto_corto', 'texto_abierto_largo'].includes(pregunta.tipo_pregunta)) {
                        resultadosAgregados[pregunta.id] = respuestasFiltradas.map(r => r.respuesta_texto).filter(Boolean);
                    
                    } else if (['seleccion_unica', 'seleccion_multiple', 'escala_1_5', 'escala_1_10', 'si_no'].includes(pregunta.tipo_pregunta)) {
                        const conteoOpciones = {};
                        
                        // Inicializar el contador para las opciones definidas
                        if (pregunta.opciones_respuesta) {
                             pregunta.opciones_respuesta.forEach(opcion => {
                                conteoOpciones[opcion.texto] = 0;
                            });
                        }

                        respuestasFiltradas.forEach(respuesta => {
                            const seleccion = respuesta.respuesta_seleccion;
                            if (Array.isArray(seleccion)) { // Para seleccion_multiple
                                seleccion.forEach(opcionSeleccionada => {
                                    if (conteoOpciones.hasOwnProperty(opcionSeleccionada)) {
                                        conteoOpciones[opcionSeleccionada]++;
                                    } else {
                                        conteoOpciones[opcionSeleccionada] = 1;
                                    }
                                });
                            } else if (seleccion) { // Para los demás tipos
                                if (conteoOpciones.hasOwnProperty(seleccion)) {
                                    conteoOpciones[seleccion]++;
                                } else {
                                    conteoOpciones[seleccion] = 1;
                                }
                            }
                        });
                        resultadosAgregados[pregunta.id] = conteoOpciones;
                    }
                });
                setResultados(resultadosAgregados);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResultados();
    }, [encuestaId, API_URL]);

    const renderIconoPregunta = (tipo) => {
    };

    if (loading) return <p className="text-center text-gray-500 mt-10">Cargando resultados...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl mx-auto my-10">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{encuesta?.titulo}</h1>
                    <p className="text-gray-600 mt-2">{encuesta?.descripcion}</p>
                </div>
                <Link to="/gestion-encuestas" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                    <ArrowLeft size={18} /> Volver
                </Link>
            </div>

            <div className="space-y-10">
                {preguntas.map((pregunta) => (
                    <div key={pregunta.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-4 mb-4">
                            {renderIconoPregunta(pregunta.tipo_pregunta)}
                            <h3 className="text-xl font-semibold text-gray-800">{pregunta.texto_pregunta}</h3>
                        </div>
                        
                        <div className="mt-4">
                            {pregunta.tipo_pregunta.includes('texto') && resultados[pregunta.id] && (
                                <ul className="space-y-3 list-disc list-inside bg-white p-4 rounded-md border">
                                    {resultados[pregunta.id].length > 0 ? (
                                        resultados[pregunta.id].map((texto, index) => (
                                            <li key={index} className="text-gray-700 italic">"{texto}"</li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No hay respuestas de texto.</p>
                                    )}
                                </ul>
                            )}

                            {!pregunta.tipo_pregunta.includes('texto') && resultados[pregunta.id] && (
                                <div className="space-y-3">
                                    {Object.entries(resultados[pregunta.id]).length > 0 ? Object.entries(resultados[pregunta.id]).map(([opcion, conteo]) => {
                                        const totalRespuestas = Object.values(resultados[pregunta.id]).reduce((a, b) => a + b, 0);
                                        const porcentaje = totalRespuestas > 0 ? ((conteo / totalRespuestas) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={opcion}>
                                                <div className="flex justify-between items-center mb-1 text-sm">
                                                    <span className="font-medium text-gray-700">{opcion}</span>
                                                    <span className="text-gray-500">{conteo} {conteo === 1 ? 'voto' : 'votos'} ({porcentaje}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${porcentaje}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    }) : <p className="text-gray-500">No hay respuestas para esta pregunta.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultadosEncuesta;