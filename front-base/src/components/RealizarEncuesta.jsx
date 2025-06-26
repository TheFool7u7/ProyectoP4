import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const RealizarEncuesta = () => {
    const { encuestaId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [encuesta, setEncuesta] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchEncuestaYPreguntas = async () => {
            setLoading(true);
            setError(null);
            try {
                const [encuestaRes, preguntasRes] = await Promise.all([
                    fetch(`${API_URL}/api/encuestas/${encuestaId}`),
                    fetch(`${API_URL}/api/encuestas/${encuestaId}/preguntas`)
                ]);

                if (!encuestaRes.ok || !preguntasRes.ok) {
                    throw new Error('No se pudo cargar la información de la encuesta.');
                }

                const encuestaData = await encuestaRes.json();
                const preguntasData = await preguntasRes.json();

                setEncuesta(encuestaData);
                setPreguntas(preguntasData);

                const respuestasIniciales = {};
                preguntasData.forEach(pregunta => {
                    if (pregunta.tipo_pregunta === 'seleccion_multiple') {
                        respuestasIniciales[pregunta.id] = [];
                    } else {
                        respuestasIniciales[pregunta.id] = '';
                    }
                });
                setRespuestas(respuestasIniciales);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (encuestaId) {
            fetchEncuestaYPreguntas();
        }
    }, [encuestaId, API_URL]);

    const handleRespuestaChange = (preguntaId, valor) => {
        setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
    };

    const handleCheckboxChange = (preguntaId, valor, isChecked) => {
        setRespuestas(prev => {
            const prevRespuestas = prev[preguntaId] || [];
            if (isChecked) {
                return { ...prev, [preguntaId]: [...prevRespuestas, valor] };
            } else {
                return { ...prev, [preguntaId]: prevRespuestas.filter(item => item !== valor) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = Object.entries(respuestas)
            .map(([preguntaId, valor]) => {
                const pregunta = preguntas.find(p => p.id === preguntaId);
                if (!pregunta) return null;

                const tieneValor = Array.isArray(valor) ? valor.length > 0 : !!valor;
                if (!tieneValor) return null;

                const esRespuestaDeTexto = ['texto_abierto_corto', 'texto_abierto_largo'].includes(pregunta.tipo_pregunta);

                return {
                    pregunta_id: preguntaId,
                    // Si es de texto, se guarda en respuesta_texto
                    respuesta_texto: esRespuestaDeTexto ? valor : null,
                    // Si no, se guarda como JSON en respuesta_seleccion
                    respuesta_seleccion: !esRespuestaDeTexto ? valor : null
                };
            })
            .filter(Boolean);

        if (payload.length === 0) {
            alert('Por favor, responde al menos una pregunta.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/encuestas/respuestas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    graduado_id: user?.graduado_id || user?.id,
                    respuestas: payload,
                    taller_id: encuesta?.taller_id || null
                })
            });

            if (!response.ok) {

                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
                }
                throw new Error(errorData.error || 'Hubo un problema al enviar tus respuestas.');
            }

            alert('¡Gracias por completar la encuesta!');
            navigate('/encuestas'); 

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };
    
    const renderPregunta = (pregunta) => {
        switch (pregunta.tipo_pregunta) {
            case 'texto_abierto_corto':
                return <input type="text" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} value={respuestas[pregunta.id] || ''} className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-500" placeholder="Escribe tu respuesta corta aquí..." />;
            case 'texto_abierto_largo':
                return <textarea onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} value={respuestas[pregunta.id] || ''} className="w-full p-3 border border-gray-300 rounded-md mt-2 focus:ring-2 focus:ring-blue-500" rows="4" placeholder="Escribe tu respuesta detallada aquí..." />;
            case 'seleccion_unica':
                return (
                    <div className="space-y-2 mt-2">
                        {(pregunta.opciones_respuesta || []).map((op, i) => (
                            <label key={i} className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border">
                                <input type="radio" name={pregunta.id} value={op.texto} checked={respuestas[pregunta.id] === op.texto} onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                <span className="ml-3 text-gray-800">{op.texto}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'seleccion_multiple':
                return (
                    <div className="space-y-2 mt-2">
                        {(pregunta.opciones_respuesta || []).map((op, i) => (
                            <label key={i} className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border">
                                <input type="checkbox" value={op.texto} checked={respuestas[pregunta.id]?.includes(op.texto) || false} onChange={(e) => handleCheckboxChange(pregunta.id, op.texto, e.target.checked)} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="ml-3 text-gray-800">{op.texto}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'escala_1_5':
            case 'escala_1_10':
                const limite = pregunta.tipo_pregunta === 'escala_1_5' ? 5 : 10;
                return (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-2 border rounded-lg">
                        {Array.from({ length: limite }, (_, i) => i + 1).map(num => (
                            <label key={num} className={`h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-all border-2 ${respuestas[pregunta.id] == num ? 'bg-blue-600 text-white border-blue-700 font-bold' : 'bg-white hover:bg-blue-100 border-gray-300'}`}>
                                <input type="radio" name={pregunta.id} value={num} checked={respuestas[pregunta.id] == num} onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} className="opacity-0 absolute" />
                                {num}
                            </label>
                        ))}
                    </div>
                );
            case 'si_no':
                return (
                    <div className="flex gap-4 mt-3">
                        <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center font-semibold ${respuestas[pregunta.id] === 'si' ? 'bg-blue-600 text-white border-blue-700' : 'hover:bg-gray-100'}`}>
                            <input type="radio" name={pregunta.id} value="si" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} className="opacity-0 absolute" />
                            Sí
                        </label>
                        <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center font-semibold ${respuestas[pregunta.id] === 'no' ? 'bg-blue-600 text-white border-blue-700' : 'hover:bg-gray-100'}`}>
                            <input type="radio" name={pregunta.id} value="no" onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)} className="opacity-0 absolute" />
                            No
                        </label>
                    </div>
                );
            default:
                return <p className="text-gray-500">Este tipo de pregunta no es soportado.</p>;
        }
    };


    if (loading) return <p className="text-center text-gray-500 mt-10">Cargando encuesta...</p>;
    if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto my-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{encuesta?.titulo}</h1>
            <p className="text-gray-600 mb-8">{encuesta?.descripcion}</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                {preguntas.map((pregunta, index) => (
                    <div key={pregunta.id} className="p-6 border border-gray-200 rounded-xl bg-gray-50/50">
                        <label className="block text-lg font-semibold text-gray-800 mb-4">
                            {index + 1}. {pregunta.texto_pregunta}
                        </label>
                        {renderPregunta(pregunta)}
                    </div>
                ))}
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all">
                    Enviar Respuestas
                </button>
            </form>
        </div>
    );
};

export default RealizarEncuesta;