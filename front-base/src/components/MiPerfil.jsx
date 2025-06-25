import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from '../supabaseClient';
import { User, Mail, Phone, Home, Book, GraduationCap, Briefcase, FileText, Download, Upload, CheckCircle, Clock } from 'lucide-react';
import EditGraduadoModal from './EditGraduadoModal';

const MiPerfil = () => {
    const { user } = useAuth();
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [documentos, setDocumentos] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [documentType, setDocumentType] = useState('titulo_profesional');

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select(`*, graduado:graduados(*)`)
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data && data.graduado) {
                setPerfil(data);
                const graduadoId = data.graduado.id;

                const [docResponse, carrerasRes, talleresRes] = await Promise.all([
                    fetch(`${API_URL}/api/documentos/${graduadoId}`),
                    fetch(`${API_URL}/api/graduados/${graduadoId}/carreras`),
                    fetch(`${API_URL}/api/inscripciones/by-graduado/${graduadoId}`)
                ]);

                if (docResponse.ok) setDocumentos(await docResponse.json());
                if (carrerasRes.ok) setCarreras(await carrerasRes.json());
                if (talleresRes.ok) setInscripciones(await talleresRes.json());
            }
        } catch (error) {
            console.error("Error cargando el perfil completo:", error);
        } finally {
            setLoading(false);
        }
    }, [user, API_URL]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleDocumentView = async (filePath) => {
        try {
            if (!filePath) throw new Error("La ruta del archivo no está disponible.");
            const { data, error } = await supabase.storage
                .from('documentos-graduados')
                .createSignedUrl(filePath, 60);

            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            alert("Error al generar el enlace del documento: " + error.message);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("Por favor, selecciona un archivo para subir.");
            return;
        }
        setUploading(true);
        try {
            const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            // Se usa el ID del usuario autenticado (user.id) como nombre de la carpeta.
            const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documentos-graduados')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            const response = await fetch(`${API_URL}/api/documentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    graduado_id: perfil.graduado.id,
                    tipo_documento: documentType,
                    nombre_archivo: selectedFile.name,
                    url_archivo_storage: filePath
                }),
            });

            if (!response.ok) throw new Error('No se pudo guardar la referencia del documento.');

            alert("Documento subido y registrado con éxito.");
            fetchProfile();
            setSelectedFile(null);
        } catch (error) {
            alert("Error al subir el archivo: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const { graduado } = perfil || {};
    const talleresFinalizados = inscripciones.filter(t => ['asistio_completo', 'completado_certificado'].includes(t.estado));
    const talleresEnCurso = inscripciones.filter(t => !['asistio_completo', 'completado_certificado'].includes(t.estado));

    if (loading) return <div className="p-4 text-center">Cargando perfil...</div>;
    if (!perfil || !graduado) return <div className="p-4 text-center">No se encontraron datos del graduado.</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
                        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                            Editar Perfil
                        </button>
                    </div>
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Información Personal */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Información Personal</h2>
                                <div className="flex items-center"><User className="mr-3 text-gray-500" /><span>{graduado.nombre_completo}</span></div>
                                <div className="flex items-center"><Mail className="mr-3 text-gray-500" /><span>{graduado.correo_electronico}</span></div>
                                <div className="flex items-center"><Phone className="mr-3 text-gray-500" /><span>{graduado.telefono || 'No especificado'}</span></div>
                                <div className="flex items-center"><Home className="mr-3 text-gray-500" /><span>{graduado.direccion || 'No especificada'}</span></div>
                                <div className="flex items-center"><Briefcase className="mr-3 text-gray-500" /><span>{graduado.logros_adicionales || 'Sin logros adicionales'}</span></div>
                            </div>
                            {/* Documentos */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Mis Documentos</h2>
                                {documentos.length > 0 ? (
                                    <ul className="space-y-3">{documentos.map(doc => (
                                        <li key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                            <div className="flex items-center min-w-0"><FileText className="mr-3 text-blue-500 flex-shrink-0" /><div className="min-w-0"><p className="font-medium truncate" title={doc.nombre_archivo}>{doc.nombre_archivo}</p><p className="text-sm text-gray-500">{doc.tipo_documento.replace(/_/g, ' ')}</p></div></div>
                                            <button onClick={() => handleDocumentView(doc.url_archivo_storage)} className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 ml-2"><Download size={18} /></button>
                                        </li>
                                    ))}</ul>
                                ) : <p className="text-gray-500">No has subido ningún documento.</p>}
                                <div className="pt-4 border-t">
                                    <h3 className="font-semibold mb-2">Subir nuevo documento</h3>
                                    <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="w-full p-2 border rounded-md mb-2"><option value="titulo_profesional">Título Profesional</option><option value="cedula_identidad">Cédula de Identidad</option><option value="certificado_academico">Certificado Académico</option><option value="otro_relevante">Otro</option></select>
                                    <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2" />
                                    <button onClick={handleFileUpload} disabled={uploading || !selectedFile} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">{uploading ? 'Subiendo...' : <><Upload size={18} /> Subir Archivo</>}</button>
                                </div>
                            </div>
                        </div>
                        {/* Historial Académico */}
                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Historial Académico</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><GraduationCap className="mr-3" />Títulos Obtenidos</h3>{carreras.length > 0 ? (<ul className="space-y-3">{carreras.map(c => (<li key={c.id} className="border-l-4 border-blue-500 pl-4"><p className="font-bold">{c.nombre_carrera}</p><p className="text-sm text-gray-600">Finalizado en {c.ano_finalizacion}</p></li>))}</ul>) : <p className="text-gray-500">No hay títulos registrados.</p>}</div>
                                <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><CheckCircle className="mr-3 text-green-500" />Talleres Finalizados</h3>{talleresFinalizados.length > 0 ? (<ul className="space-y-2">{talleresFinalizados.map(ins => (<li key={ins.id} className="truncate" title={ins.talleres.nombre}>{ins.talleres.nombre}</li>))}</ul>) : <p className="text-gray-500">Aún no has finalizado talleres.</p>}</div>
                                <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center"><Clock className="mr-3 text-orange-500" />Talleres en Curso</h3>{talleresEnCurso.length > 0 ? (<ul className="space-y-2">{talleresEnCurso.map(ins => (<li key={ins.id} className="truncate" title={ins.talleres.nombre}>{ins.talleres.nombre}</li>))}</ul>) : <p className="text-gray-500">No tienes talleres en curso.</p>}</div>
                            </div>
                        </div>
                    </>
                </div>
            </div>
            {isModalOpen && (<EditGraduadoModal graduado={graduado} onClose={() => setIsModalOpen(false)} onSave={() => { fetchProfile(); setIsModalOpen(false); }} />)}
        </div>
    );
};

export default MiPerfil;
