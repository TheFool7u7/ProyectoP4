import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Calendar, Users, MapPin, Target, CheckCircle, Info } from 'lucide-react';

const TallerDetalle = () => {
    const { tallerId } = useParams(); // Lee el ID del taller desde la URL
    const { user, isAuthenticated } = useAuth(); // Obtiene el usuario logueado

    const [taller, setTaller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inscripcion, setInscripcion] = useState({ status: 'idle', message: '' });

    const API_URL = import.meta.env.VITE_API_URL;

    // Carga los detalles del taller
    useEffect(() => {
        const fetchTaller = async () => {
            try {
                const response = await fetch(`${API_URL}/api/catalogo/talleres/${tallerId}`);
                if (!response.ok) throw new Error('Taller no encontrado o no disponible.');
                const data = await response.json();
                setTaller(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTaller();
    }, [tallerId, API_URL]);

    // Maneja el clic en el botón de inscripción
    const handleInscripcion = async () => {
        // Se verifica que el usuario esté autenticado y tenga un ID de graduado asociado
        if (!isAuthenticated || !user?.graduado_id) {
            alert('Debes iniciar sesión como graduado para poder inscribirte.');
            return;
        }

        setInscripcion({ status: 'loading', message: '' });
        try {
            // se usa user.graduado_id, que es el ID de la tabla 'graduados'
            const response = await fetch(`${API_URL}/api/inscripciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graduado_id: user.graduado_id, taller_id: taller.id }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'No se pudo procesar la inscripción.');

            setInscripcion({ status: 'success', message: '¡Felicidades! Te has inscrito correctamente.' });
        } catch (err) {
            setInscripcion({ status: 'error', message: err.message });
        }
    };

    if (loading) return <p className="text-center p-8">Cargando detalles del taller...</p>;
    if (error) return <p className="text-center p-8 text-red-500">Error: {error}</p>;
    if (!taller) return <p>Taller no encontrado.</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{taller.nombre}</h1>
            <p className="text-gray-600 mb-6">{taller.descripcion}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800">Detalles Generales</h3>
                    <p className="flex items-start gap-3"><Calendar className="text-blue-500 mt-1" size={20} /> <span><strong>Inicio:</strong> {new Date(taller.fecha_inicio).toLocaleString()}</span></p>
                    <p className="flex items-start gap-3"><Calendar className="text-blue-500 mt-1" size={20} /> <span><strong>Fin:</strong> {new Date(taller.fecha_fin).toLocaleString()}</span></p>
                    <p className="flex items-start gap-3"><MapPin className="text-blue-500 mt-1" size={20} /> <span><strong>Modalidad:</strong> {taller.modalidad}</span></p>
                    <p className="flex items-start gap-3"><Users className="text-blue-500 mt-1" size={20} /> <span><strong>Cupo:</strong> {taller.cupo_maximo} personas</span></p>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800">Objetivos del Taller</h3>
                    <p className="flex items-start gap-3"><Target className="text-blue-500 mt-1" size={20} /> <span>{taller.objetivos || 'No especificados.'}</span></p>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
                {inscripcion.status === 'success' && (
                    <div className="text-center text-green-600 font-bold flex items-center justify-center gap-2">
                        <CheckCircle /> {inscripcion.message}
                    </div>
                )}
                {inscripcion.status === 'error' && (
                    <div className="text-center text-red-600 font-bold flex items-center justify-center gap-2">
                        <Info /> {inscripcion.message}
                    </div>
                )}
                {inscripcion.status !== 'success' && (
                    <button
                        onClick={handleInscripcion}
                        disabled={inscripcion.status === 'loading'}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400">
                        {inscripcion.status === 'loading' ? 'Procesando...' : '¡Inscribirme Ahora!'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TallerDetalle;