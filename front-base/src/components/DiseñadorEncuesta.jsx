import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlusCircle, Trash2, ArrowLeft } from 'lucide-react';

const DiseñadorEncuesta = () => {
    const { encuestaId } = useParams();
    const [encuesta, setEncuesta] = useState(null);
    const [preguntas, setPreguntas] = useState([]);
    const [nuevaPregunta, setNuevaPregunta] = useState({
        texto_pregunta: '',
        tipo_pregunta: 'texto_abierto_corto',
        opciones_respuesta: [],
    });
    const [opcionActual, setOpcionActual] = useState('');
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    const tiposDePregunta = [
        'texto_abierto_corto', 'texto_abierto_largo', 'escala_1_5',
        'escala_1_10', 'seleccion_unica', 'seleccion_multiple', 'si_no'
    ];

    const fetchDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [encuestaRes, preguntasRes] = await Promise.all([
                fetch(`${API_URL}/api/encuestas/${encuestaId}`),
                fetch(`${API_URL}/api/encuestas/${encuestaId}/preguntas`),
            ]);
            if (!encuestaRes.ok || !preguntasRes.ok) throw new Error("No se pudo cargar la encuesta o las preguntas");
            setEncuesta(await encuestaRes.json());
            setPreguntas((await preguntasRes.json()).sort((a, b) => a.orden - b.orden));
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [encuestaId, API_URL]);

    useEffect(() => { fetchDatos(); }, [fetchDatos]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'tipo_pregunta' && !['seleccion_unica', 'seleccion_multiple'].includes(value)) {
            setNuevaPregunta(prev => ({ ...prev, [name]: value, opciones_respuesta: [] }));
        } else {
            setNuevaPregunta(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddOpcion = () => {
        if (!opcionActual.trim()) return;
        const nuevaOpcion = { id: `op${Date.now()}`, texto: opcionActual };
        setNuevaPregunta(prev => ({ ...prev, opciones_respuesta: [...(prev.opciones_respuesta || []), nuevaOpcion] }));
        setOpcionActual('');
    };

    const handleRemoveOpcion = (opcionId) => {
        setNuevaPregunta(prev => ({ ...prev, opciones_respuesta: prev.opciones_respuesta.filter(op => op.id !== opcionId) }));
    };

    const handleSubmitPregunta = async (e) => {
        e.preventDefault();
        try {
            const body = { ...nuevaPregunta, orden: (preguntas.length || 0) + 1 };
            const response = await fetch(`${API_URL}/api/encuestas/${encuestaId}/preguntas`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error("No se pudo guardar la pregunta");
            fetchDatos();
            setNuevaPregunta({ texto_pregunta: '', tipo_pregunta: 'texto_abierto_corto', opciones_respuesta: [] });
        } catch (error) { alert(error.message); }
    };

    const handleDeletePregunta = async (preguntaId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta pregunta?")) return;
        try {
            const response = await fetch(`${API_URL}/api/encuestas/preguntas/${preguntaId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error("No se pudo eliminar la pregunta");
            fetchDatos();
        } catch (error) { alert(error.message); }
    };

    const renderPreguntaPreview = (pregunta) => {
        switch (pregunta.tipo_pregunta) {
            case 'texto_abierto_corto':
                return <input type="text" className="w-full p-2 border rounded mt-2 bg-gray-100" placeholder="Respuesta corta..." readOnly />;
            case 'texto_abierto_largo':
                return <textarea className="w-full p-2 border rounded mt-2 bg-gray-100" rows="3" placeholder="Respuesta larga..." readOnly />;
            case 'seleccion_unica':
            case 'seleccion_multiple':
                return (
                    <div className="space-y-2 mt-2">
                        {(pregunta.opciones_respuesta || []).map(op => (
                            <label key={op.id} className="flex items-center p-3 rounded-md bg-gray-100 cursor-not-allowed">
                                <input type={pregunta.tipo_pregunta === 'seleccion_unica' ? 'radio' : 'checkbox'} name={`${pregunta.id}-preview`} className="h-4 w-4" disabled />
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
                return null;
        }
    };

    if (loading) return <p>Cargando diseñador...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <Link to="/gestion-encuestas" className="flex items-center gap-2 text-blue-600 hover:underline mb-4">
                <ArrowLeft size={18} /> Volver a Gestión
            </Link>
            <h1 className="text-2xl font-bold mb-2">Diseñador de Encuesta: <span className="text-blue-700">{encuesta?.titulo}</span></h1>

            <form onSubmit={handleSubmitPregunta} className="bg-gray-50 p-4 rounded-lg space-y-4 mb-8">
                <h2 className="text-lg font-semibold">Añadir Nueva Pregunta</h2>
                <textarea name="texto_pregunta" value={nuevaPregunta.texto_pregunta} onChange={handleInputChange} placeholder="Texto de la pregunta" className="w-full p-2 border rounded" required />
                <select name="tipo_pregunta" value={nuevaPregunta.tipo_pregunta} onChange={handleInputChange} className="w-full p-2 border rounded">
                    {tiposDePregunta.map(tipo => <option key={tipo} value={tipo}>{tipo.replace(/_/g, ' ')}</option>)}
                </select>

                {['seleccion_unica', 'seleccion_multiple'].includes(nuevaPregunta.tipo_pregunta) && (
                    <div className="p-2 border rounded-md space-y-2">
                        <label className="font-medium">Opciones de Respuesta</label>
                        {(nuevaPregunta.opciones_respuesta || []).map(op => (
                            <div key={op.id} className="flex justify-between items-center bg-white p-1 rounded">
                                <span>{op.texto}</span>
                                <button type="button" onClick={() => handleRemoveOpcion(op.id)} className="text-red-500"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <input type="text" value={opcionActual} onChange={(e) => setOpcionActual(e.target.value)} placeholder="Texto de la opción" className="flex-grow p-1 border rounded" />
                            <button type="button" onClick={handleAddOpcion} className="bg-blue-500 text-white p-2 rounded"><PlusCircle size={18} /></button>
                        </div>
                    </div>
                )}
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full">Añadir Pregunta</button>
            </form>

            {/* Lista de preguntas existentes CON VISTA PREVIA */}
            <div>
                <h2 className="text-xl font-semibold mb-4 mt-8 border-t pt-6">Preguntas Actuales</h2>
                <div className="space-y-4">
                    {preguntas.map((pregunta, index) => (
                        <div key={pregunta.id} className="p-4 bg-white rounded-lg shadow-sm border relative">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-800 pr-10">{index + 1}. {pregunta.texto_pregunta}</p>
                                <button onClick={() => handleDeletePregunta(pregunta.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{pregunta.tipo_pregunta}</span>

                            <div className="mt-4">
                                {renderPreguntaPreview(pregunta)}
                            </div>
                        </div>
                    ))}
                    {preguntas.length === 0 && <p className="text-gray-500 text-center py-8">Aún no hay preguntas en esta encuesta.</p>}
                </div>
            </div>
        </div>
    );
};

export default DiseñadorEncuesta;