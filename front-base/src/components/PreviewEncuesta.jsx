import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';

const PreviewEncuesta = () => {
    const { encuestaId } = useParams();
    const [encuesta, setEncuesta] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [encuestaRes, preguntasRes] = await Promise.all([
                fetch(`${API_URL}/api/encuestas/${encuestaId}`),
                fetch(`${API_URL}/api/encuestas/${encuestaId}/preguntas`),
            ]);
            if (!encuestaRes.ok || !preguntasRes.ok) throw new Error("No se pudo cargar la encuesta");

            setEncuesta(await encuestaRes.json());
            setPreguntas(await preguntasRes.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [encuestaId, API_URL]);

    useEffect(() => {
        fetchDatos();
    }, [fetchDatos]);

    const renderPreguntaPreview = (pregunta) => {
        switch (pregunta.tipo_pregunta) {
            case 'texto_abierto_corto':
                return <input type="text" className="w-full p-2 border rounded mt-2 bg-gray-100" placeholder="Respuesta corta..." readOnly />;

            case 'texto_abierto_largo':
                return <textarea className="w-full p-2 border rounded mt-2 bg-gray-100" rows="3" placeholder="Respuesta larga..." readOnly />;

            case 'seleccion_unica':
                return (
                    <div className="space-y-2 mt-2">
                        {(pregunta.opciones_respuesta || []).map(op => (
                            <label key={op.id} className="flex items-center p-3 rounded-md bg-gray-100 cursor-not-allowed">
                                <input type="radio" name={pregunta.id} className="h-4 w-4" disabled />
                                <span className="ml-3 text-gray-700">{op.texto}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'seleccion_multiple':
                return (
                    <div className="space-y-2 mt-2">
                        {(pregunta.opciones_respuesta || []).map(op => (
                            <label key={op.id} className="flex items-center p-3 rounded-md bg-gray-100 cursor-not-allowed">
                                <input type="checkbox" className="h-4 w-4 rounded" disabled />
                                <span className="ml-3 text-gray-700">{op.texto}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'escala_1_5':
            case 'escala_1_10':
                const limite = pregunta.tipo_pregunta === 'escala_1_5' ? 5 : 10;
                return (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-2 border rounded-lg bg-gray-50">
                        {Array.from({ length: limite }, (_, i) => i + 1).map(num => (
                            <span key={num} className="h-10 w-10 border-2 rounded-full flex items-center justify-center bg-white text-gray-600">{num}</span>
                        ))}
                    </div>
                );

            case 'si_no':
                return (
                    <div className="flex gap-4 mt-3">
                        <div className="flex-1 p-4 border rounded-lg text-center font-semibold bg-gray-100 cursor-not-allowed">Sí</div>
                        <div className="flex-1 p-4 border rounded-lg text-center font-semibold bg-gray-100 cursor-not-allowed">No</div>
                    </div>
                );

            default:
                return <p className="text-gray-500">Vista previa no disponible.</p>;
        }
    };

    if (loading) return <p className="text-center p-10">Cargando vista previa...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3"><Eye className="text-blue-500" /> Vista Previa: {encuesta?.titulo}</h1>
                    <p className="text-gray-600 mt-1">{encuesta?.descripcion}</p>
                </div>
                <Link to="/gestion-encuestas" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                    <ArrowLeft size={18} /> Volver
                </Link>
            </div>

            <div className="space-y-6">
                {preguntas.map((pregunta, index) => (
                    <div key={pregunta.id} className="p-4 border rounded-lg bg-gray-50/50">
                        <label className="block text-lg font-medium text-gray-800">{index + 1}. {pregunta.texto_pregunta}</label>
                        {renderPreguntaPreview(pregunta)}
                    </div>
                ))}
                {preguntas.length === 0 && <p className="text-gray-500 text-center py-10">Esta encuesta aún no tiene preguntas. Añádelas desde el diseñador.</p>}
            </div>
        </div>
    );
};

export default PreviewEncuesta;