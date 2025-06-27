import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Mail, Phone, Home, Briefcase, FileText, Download, ArrowLeft, GraduationCap } from 'lucide-react';

const PerfilPublico = () => {
    const { graduadoId } = useParams();
    const [graduado, setGraduado] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchPublicProfile = useCallback(async () => {
        setLoading(true);
        try {
            const [graduadoRes, docRes, carrerasRes] = await Promise.all([
                fetch(`${API_URL}/api/graduados/${graduadoId}`),
                fetch(`${API_URL}/api/documentos/${graduadoId}`),
                fetch(`${API_URL}/api/graduados/${graduadoId}/carreras`),
            ]);
            
            if (!graduadoRes.ok) throw new Error("No se pudo cargar el perfil del graduado.");

            setGraduado(await graduadoRes.json());
            if (docRes.ok) setDocumentos(await docRes.json());
            if (carrerasRes.ok) setCarreras(await carrerasRes.json());

        } catch (error) {
            console.error("Error cargando el perfil público:", error);
        } finally {
            setLoading(false);
        }
    }, [graduadoId, API_URL]);

    useEffect(() => {
        fetchPublicProfile();
    }, [fetchPublicProfile]);

    const handleDocumentView = async (filePath) => {
        try {
            if (!filePath) throw new Error("La ruta del archivo no está disponible.");
            
            const { data, error } = await supabase.storage
                .from('documentos-graduados') 
                .createSignedUrl(filePath, 60); // 60 segundos de validez

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            alert("Error al generar el enlace del documento: " + error.message);
        }
    };

    if (loading) return <p className="p-4 text-center">Cargando perfil...</p>;
    if (!graduado) return <p className="p-4 text-center text-red-500">No se encontró el perfil de este graduado.</p>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <Link to="/graduados" className="flex items-center gap-2 text-blue-600 hover:underline mb-6">
                <ArrowLeft size={18} /> Volver a la lista de graduados
            </Link>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Perfil de Graduado</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Información Personal</h2>
                            <div className="flex items-center"><User className="mr-3 text-gray-500" /><span>{graduado.nombre_completo}</span></div>
                            <div className="flex items-center"><Mail className="mr-3 text-gray-500" /><span>{graduado.correo_electronico}</span></div>
                            <div className="flex items-center"><Phone className="mr-3 text-gray-500" /><span>{graduado.telefono || 'No especificado'}</span></div>
                            <div className="flex items-center"><Home className="mr-3 text-gray-500" /><span>{graduado.zona_geografica || 'No especificada'}</span></div>
                            <div className="flex items-center"><Briefcase className="mr-3 text-gray-500" /><span>{graduado.logros_adicionales || 'Sin logros adicionales'}</span></div>
                        </div>
                        {/* Documentos y Carreras */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Historial Académico</h2>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2 flex items-center"><GraduationCap className="mr-2"/> Carreras</h3>
                                {carreras.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1">{carreras.map(c => <li key={c.id}>{c.nombre_carrera} ({c.ano_finalizacion})</li>)}</ul>
                                ) : <p className="text-sm text-gray-500">No hay carreras registradas.</p>}
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2 flex items-center"><FileText className="mr-2"/> Documentos</h3>
                                {documentos.length > 0 ? (
                                    <ul className="space-y-2">{documentos.map(doc => (
                                        <li key={doc.id} className="flex items-center justify-between">
                                            <span>{doc.nombre_archivo}</span>
                                            <button onClick={() => handleDocumentView(doc.url_archivo_storage)} className="p-1.5 rounded-full hover:bg-gray-200" title="Ver/Descargar Documento">
                                                <Download size={16} />
                                            </button>
                                        </li>
                                    ))}</ul>
                                ) : <p className="text-sm text-gray-500">No hay documentos disponibles.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPublico;