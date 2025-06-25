import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from '../supabaseClient';
import { Award, Download, Clock, XCircle } from 'lucide-react';

const MisTalleres = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchMisTalleres = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/inscripciones/${user.id}`);
            if (!response.ok) throw new Error('No se pudieron cargar tus talleres.');
            const data = await response.json();
            setInscripciones(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMisTalleres();
    }, [user, API_URL]);

    const handleDownload = async (filePath) => {
        try {
            if (!filePath) throw new Error("La ruta del archivo no está disponible.");
            const { data, error } = await supabase.storage.from('certificados').createSignedUrl(filePath, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            alert("Error al generar el enlace de descarga: " + error.message);
        }
    };

    //funcion para anular inscripcion 
    const handleUnenroll = async (inscripcionId, nombreTaller) => {
        if (!window.confirm(`¿Estás seguro de que quieres anular tu inscripción al taller "${nombreTaller}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo anular la inscripción.');
            }
            
            alert('Inscripción anulada exitosamente.');
            // Volvemos a cargar los talleres para que la lista se actualice
            fetchMisTalleres(); 
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const getStatusBadge = (estado) => {
        const statusMap = {
            'inscrito': 'bg-blue-100 text-blue-800',
            'completado_certificado': 'bg-green-100 text-green-800',
            'aprobado': 'bg-yellow-100 text-yellow-800',
        };
        const defaultClass = 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[estado] || defaultClass}`}>
                {estado ? estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No definido'}
            </span>
        );
    };

    if (loading) return <div className="text-center p-8">Cargando tus talleres...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Talleres</h1>
            {inscripciones.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inscripciones.map(inscripcion => (
                        <div key={inscripcion.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-gray-900">{inscripcion.talleres.nombre}</h2>
                                    {getStatusBadge(inscripcion.estado)}
                                </div>
                                <p className="text-gray-600 text-sm mb-4">{inscripcion.talleres.descripcion}</p>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Clock size={16} className="mr-2" />
                                    Inicia: {new Date(inscripcion.talleres.fecha_inicio).toLocaleDateString()}
                                </div>
                            </div>

                            {/* seccion de acciones*/}
                            <div className="bg-gray-50 p-4 border-t space-y-2">
                                {inscripcion.estado === 'completado_certificado' && inscripcion.url_certificado_storage && (
                                    <button 
                                        onClick={() => handleDownload(inscripcion.url_certificado_storage)}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-300"
                                    >
                                        <Award size={18} />
                                        Descargar Certificado
                                    </button>
                                )}

                                {inscripcion.estado === 'inscrito' && (
                                    <button
                                        onClick={() => handleUnenroll(inscripcion.id, inscripcion.talleres.nombre)}
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300"
                                    >
                                        <XCircle size={18} />
                                        Anular Inscripción
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-8">Aún no te has inscrito a ningún taller.</p>
            )}
        </div>
    );
};

export default MisTalleres;