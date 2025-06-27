import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from '../supabaseClient';
import { User, Mail, Phone, Home, Globe, Book, GraduationCap, Briefcase, FileText, Download, Upload, CheckCircle, Clock, Trash2, AlertCircle, Loader2 } from 'lucide-react'; // Añadidos AlertCircle y Loader2
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
    const [uploadMessage, setUploadMessage] = useState(null); // Para mensajes de éxito en la carga
    const [uploadError, setUploadError] = useState(null); // Para mensajes de error en la carga

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
            setUploadError("Por favor, selecciona un archivo para subir.");
            return;
        }
        setUploading(true);
        setUploadMessage(null);
        setUploadError(null);

        try {
            const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo guardar la referencia del documento en la base de datos.');
            }

            setUploadMessage("Documento subido y registrado con éxito.");
            fetchProfile();
            setSelectedFile(null);
            setDocumentType('titulo_profesional');
        } catch (error) {
            setUploadError("Error al subir el archivo: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocumento = async (documentoId, filePath) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            if (filePath) {
                const { error: storageError } = await supabase.storage
                    .from('documentos-graduados')
                    .remove([filePath]);
                if (storageError) console.error("Error al eliminar del storage:", storageError.message);
            }

            // Eliminar de la base de datos
            const response = await fetch(`${API_URL}/api/documentos/${documentoId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "No se pudo eliminar el documento de la base de datos.");
            }

            setDocumentos(prevDocumentos => prevDocumentos.filter(doc => doc.id !== documentoId));
            alert("Documento eliminado con éxito.");

        } catch (error) {
            console.error("Error al eliminar el documento:", error);
            alert(error.message);
        }
    };

    const { graduado } = perfil || {};
    const talleresFinalizados = inscripciones.filter(t => ['asistio_completo', 'completado_certificado'].includes(t.estado));
    const talleresEnCurso = inscripciones.filter(t => !['asistio_completo', 'completado_certificado'].includes(t.estado));

    if (loading) return <div className="min-h-screen flex items-center justify-center p-4 text-center" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)', color: '#EDEDDD' }}>Cargando perfil...</div>;
    if (!perfil || !graduado) return <div className="min-h-screen flex items-center justify-center p-4 text-center" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)', color: '#EDEDDD' }}>No se encontraron datos del graduado.</div>;

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)'
            }}
        >
            <div
                className="relative z-10 w-full max-w-5xl backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-10 opacity-0 animate-slideUp"
                style={{ backgroundColor: 'rgba(237, 237, 221, 0.95)' }}
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: '#1B1717' }}
                    >
                        <User size={32} style={{ color: '#EDEDDD' }} />
                    </div>
                    <h1
                        className="text-3xl font-bold mb-2 opacity-0 animate-fadeIn animation-delay-300"
                        style={{ color: '#1B1717' }}
                    >
                        Mi Perfil
                    </h1>
                    <p
                        className="text-sm opacity-70 opacity-0 animate-fadeIn animation-delay-500"
                        style={{ color: '#630000' }}
                    >
                        Revisa y gestiona tu información personal, documentos y historial académico.
                    </p>
                </div>

                <div className="flex justify-end mb-6 opacity-0 animate-fadeIn animation-delay-700">
                    <button onClick={() => setIsModalOpen(true)}
                        className="py-2 px-6 rounded-xl font-medium text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50"
                        style={{
                            background: 'linear-gradient(135deg, #630000, #810100)',
                            boxShadow: '0 5px 15px rgba(129, 1, 0, 0.2)',
                            focusRingColor: '#810100'
                        }}
                    >
                        Editar Perfil
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-opacity duration-500"></div>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    {/* Información Personal */}
                    <div className="space-y-4 opacity-0 animate-slideInLeft animation-delay-800 p-6 rounded-xl border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        <h2 className="text-xl font-bold border-b pb-3 mb-3" style={{ color: '#1B1717', borderColor: '#630000' }}>Información Personal</h2>
                        <ProfileInfoItem icon={<User />} label="Nombre Completo" value={graduado.nombre_completo} />
                        <ProfileInfoItem icon={<Mail />} label="Correo Electrónico" value={graduado.correo_electronico} />
                        <ProfileInfoItem icon={<Phone />} label="Teléfono" value={graduado.telefono || 'No especificado'} />
                        <ProfileInfoItem icon={<Home />} label="Dirección" value={graduado.direccion || 'No especificada'} />
                        <ProfileInfoItem icon={<Globe />} label="Zona Geográfica" value={graduado.zona_geografica || 'No especificada'} />
                        <ProfileInfoItem icon={<Briefcase />} label="Logros Adicionales" value={graduado.logros_adicionales || 'Sin logros adicionales'} />
                    </div>

                    {/* Documentos */}
                    <div className="space-y-4 opacity-0 animate-slideInLeft animation-delay-900 p-6 rounded-xl border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        <h2 className="text-xl font-bold border-b pb-3 mb-3" style={{ color: '#1B1717', borderColor: '#630000' }}>Mis Documentos</h2>
                        {documentos.length > 0 ? (
                            <ul className="space-y-3">{documentos.map(doc => (
                                <li key={doc.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-200">
                                    <div className="flex items-center min-w-0 flex-grow">
                                        <FileText className="mr-3 text-blue-600 flex-shrink-0" size={20} />
                                        <div className="min-w-0">
                                            <p className="font-medium truncate text-gray-800" title={doc.nombre_archivo}>{doc.nombre_archivo}</p>
                                            <p className="text-sm text-gray-500">{doc.tipo_documento.replace(/_/g, ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-shrink-0 ml-2 space-x-2">
                                        <button onClick={() => handleDocumentView(doc.url_archivo_storage)}
                                            className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-all duration-200 transform hover:scale-110"
                                            title="Ver/Descargar"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button onClick={() => handleDeleteDocumento(doc.id, doc.url_archivo_storage)}
                                            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-all duration-200 transform hover:scale-110"
                                            title="Eliminar documento"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </li>
                            ))}</ul>
                        ) : <p className="text-gray-500">No has subido ningún documento.</p>}

                        <div className="pt-4 border-t border-gray-200 mt-4">
                            <h3 className="font-bold mb-3" style={{ color: '#1B1717' }}>Subir nuevo documento</h3>
                            <select value={documentType} onChange={e => setDocumentType(e.target.value)}
                                className="w-full p-3 border rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-[#810100] transition-all duration-200"
                                style={{ backgroundColor: 'white', borderColor: '#630000', color: '#1B1717' }}
                            >
                                <option value="titulo_profesional">Título Profesional</option>
                                <option value="cedula_identidad">Cédula de Identidad</option>
                                <option value="certificado_academico">Certificado Académico</option>
                                <option value="otro_relevante">Otro</option>
                            </select>
                            <input
                                type="file"
                                onChange={e => setSelectedFile(e.target.files[0])}
                                className="w-full text-sm text-gray-500
                                           file:mr-4 file:py-2 file:px-4
                                           file:rounded-full file:border-0
                                           file:text-sm file:font-semibold
                                           file:bg-blue-50 file:text-blue-700
                                           hover:file:bg-blue-100
                                           mb-3 cursor-pointer
                                           transition-all duration-200 ease-in-out"
                            />
                            {uploadError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-3 animate-shake">
                                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                                    <p className="text-red-600 text-sm">{uploadError}</p>
                                </div>
                            )}
                            {uploadMessage && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 mb-3 animate-slideInLeft">
                                    <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                    <p className="text-green-600 text-sm">{uploadMessage}</p>
                                </div>
                            )}
                            <button onClick={handleFileUpload} disabled={uploading || !selectedFile}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white
                                           transition-all duration-300 transform relative overflow-hidden
                                           focus:outline-none focus:ring-4 focus:ring-opacity-50
                                           ${uploading ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl active:scale-95'}"
                                style={{
                                    background: uploading
                                        ? 'linear-gradient(135deg, #9CA3AF, #6B7280)'
                                        : 'linear-gradient(135deg, #4CAF50, #66BB6A)', // Verde para subir
                                    boxShadow: uploading
                                        ? 'none'
                                        : '0 10px 30px rgba(76, 175, 80, 0.3)',
                                    focusRingColor: '#4CAF50'
                                }}
                            >
                                {uploading ? <><Loader2 size={18} className="animate-spin" /> Subiendo...</> : <><Upload size={18} /> Subir Archivo</>}
                                {!uploading && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-opacity duration-500"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Historial Académico */}
                    <div className="md:col-span-2 mt-8 pt-6 border-t border-opacity-20 opacity-0 animate-fadeIn animation-delay-1000" style={{ borderColor: '#630000' }}>
                        <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B1717' }}>Mi Historial Académico</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AcademicHistoryCard
                                title="Títulos Obtenidos"
                                icon={<GraduationCap className="text-blue-500" />}
                                items={carreras}
                                renderItem={(c) => (
                                    <li key={c.id} className="border-l-4 pl-4" style={{ borderColor: '#810100' }}>
                                        <p className="font-bold text-gray-800">{c.nombre_carrera}</p>
                                        <p className="text-sm text-gray-600">Finalizado en {c.ano_finalizacion}</p>
                                    </li>
                                )}
                                emptyMessage="No hay títulos registrados."
                            />
                            <AcademicHistoryCard
                                title="Talleres Finalizados"
                                icon={<CheckCircle className="text-green-500" />}
                                items={talleresFinalizados}
                                renderItem={(ins) => (
                                    <li key={ins.id} className="truncate text-gray-800" title={ins.talleres.nombre}>
                                        {ins.talleres.nombre}
                                    </li>
                                )}
                                emptyMessage="Aún no has finalizado talleres."
                            />
                            <AcademicHistoryCard
                                title="Talleres en Curso"
                                icon={<Clock className="text-orange-500" />}
                                items={talleresEnCurso}
                                renderItem={(ins) => (
                                    <li key={ins.id} className="truncate text-gray-800" title={ins.talleres.nombre}>
                                        {ins.talleres.nombre}
                                    </li>
                                )}
                                emptyMessage="No tienes talleres en curso."
                            />
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && (<EditGraduadoModal graduado={perfil.graduado} onClose={() => setIsModalOpen(false)} onSave={() => { fetchProfile(); setIsModalOpen(false); }} />)}

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
                .animation-delay-800 { animation-delay: 800ms; }
                .animation-delay-900 { animation-delay: 900ms; }
                .animation-delay-1000 { animation-delay: 1000ms; }
            `}</style>
        </div>
    );
};

// Componente auxiliar para elementos de información de perfil
const ProfileInfoItem = ({ icon, label, value }) => (
    <div className="flex items-center text-gray-800 text-base">
        <div className="mr-3 text-[#630000] flex-shrink-0">{icon}</div>
        <span className="font-medium">{label}:</span>
        <span className="ml-2">{value}</span>
    </div>
);

// Componente auxiliar para las tarjetas de historial académico
const AcademicHistoryCard = ({ title, icon, items, renderItem, emptyMessage }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-opacity-20" style={{ borderColor: '#630000', backgroundColor: 'rgba(237, 237, 221, 0.8)' }}>
        <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#1B1717' }}>
            {React.cloneElement(icon, { className: `${icon.props.className || ''} mr-3` })}
            {title}
        </h3>
        {items && items.length > 0 ? (
            <ul className="space-y-3">
                {items.map(renderItem)}
            </ul>
        ) : (
            <p className="text-gray-500">{emptyMessage}</p>
        )}
    </div>
);

export default MiPerfil;