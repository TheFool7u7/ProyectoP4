import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from '../supabaseClient';
import { Edit, Save, XCircle, UploadCloud, Download, Trash2, Loader2 } from 'lucide-react';

const MiPerfil = () => {
    const { user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    // Estados para la edición del perfil
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({});
    const [originalProfileData, setOriginalProfileData] = useState({});

    // Estados para la gestión de documentos
    const [documents, setDocuments] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documentType, setDocumentType] = useState('curriculum'); // Tipo por defecto
    const [uploading, setUploading] = useState(false);
    const [downloadingDocId, setDownloadingDocId] = useState(null);

    // Cargar datos iniciales del perfil y documentos
    useEffect(() => {
        if (user) {
            const fetchGraduadoData = async () => {
                const { data } = await supabase.from('graduados').select('*').eq('perfil_id', user.id).single();
                setProfileData(data || {});
                setOriginalProfileData(data || {});
            };

            const fetchDocuments = async () => {
                const { data } = await supabase.from('documentos_graduados').select('*').eq('graduado_id', user.graduado_id);
                setDocuments(data || []);
            };

            fetchGraduadoData();
            fetchDocuments();
        }
    }, [user]);

    //editar el perfil
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setProfileData(originalProfileData);
        setIsEditing(false);
    };

    const handleSaveChanges = async () => {
        const { id, perfil_id, correo_electronico, ...updateData } = profileData;
        const { error } = await supabase.from('graduados').update(updateData).eq('id', user.graduado_id);
        if (error) {
            alert("Error al guardar los cambios: " + error.message);
        } else {
            alert("Perfil actualizado con éxito");
            setOriginalProfileData(profileData);
            setIsEditing(false);
        }
    };

    // --- subir archivos
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !user?.id) return alert("Por favor, selecciona un archivo.");
        setUploading(true);
        const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;
        try {
            const { data: uploadData, error: uploadError } = await supabase.storage.from('documentos-graduados').upload(filePath, selectedFile);
            if (uploadError) throw uploadError;
            const metadata = { graduado_id: user.graduado_id, tipo_documento: documentType, nombre_archivo: selectedFile.name, url_archivo_storage: uploadData.path };
            const { data: dbData, error: dbError } = await supabase.from('documentos_graduados').insert([metadata]).select();
            if (dbError) throw dbError;
            setDocuments([...documents, dbData[0]]);
            setSelectedFile(null);
            document.getElementById('file-input-perfil').value = ''; // Limpia el input visualmente
            alert('¡Documento subido con éxito!');
        } catch (error) {
            alert("Error al subir el archivo: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // descargar archivos
    const handleDownload = async (filePath, fileName) => {
        try {
            // 1. se generamos la URL firmada y segura
            const { data, error } = await supabase.storage
                .from('documentos-graduados')
                .createSignedUrl(filePath, 60); // Válida por 60 segundos

            if (error) throw error;

            // 2. se usa 'fetch' para obtener los datos del archivo desde la URL segura
            const response = await fetch(data.signedUrl);
            const blob = await response.blob(); // se convierte la respuesta en un objeto de archivo (blob)

            // 3. se crea una URL local en el navegador para este objeto
            const blobUrl = window.URL.createObjectURL(blob);

            // 4. se crea un enlace <a> invisible en la memoria
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', fileName || 'download'); // se le asigna el nombre original

            // 5. se añade, se simula el clic y se elimina
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 6. se libera la memoria del navegador revocando la URL del objeto
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            alert("No se pudo descargar el archivo: " + error.message);
            console.error("Error al descargar:", error);
        }
    };

    //borrar documentos
    const handleDocumentDelete = async (docId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
        try {
            const response = await fetch(`${API_URL}/api/documentos/${docId}`, { method: 'DELETE' });
            if (response.ok) {
                setDocuments(documents.filter(doc => doc.id !== docId));
                alert("Documento eliminado con éxito.");
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Ocurrió un error.");
            }
        } catch (error) {
            alert("Error al eliminar el documento: " + error.message);
        }
    };

    if (!user) return <div className="text-center p-8">Cargando perfil...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-4">
            {/* Sección de Datos Personales con edición */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={handleCancelEdit} className="bg-gray-200 text-gray-800 py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors"><XCircle size={16} /> Cancelar</button>
                            <button onClick={handleSaveChanges} className="bg-green-600 text-white py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-green-700 transition-colors"><Save size={16} /> Guardar</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white py-1 px-3 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition-colors"><Edit size={16} /> Editar</button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div><label className="font-semibold text-gray-600 block mb-1">Nombre:</label> {isEditing ? <input name="nombre_completo" value={profileData.nombre_completo || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.nombre_completo}</span>}</div>
                    <div><label className="font-semibold text-gray-600 block mb-1">Identificación:</label> {isEditing ? <input name="identificacion" value={profileData.identificacion || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.identificacion}</span>}</div>
                    <div><label className="font-semibold text-gray-600 block mb-1">Correo:</label> <span className="text-gray-500 bg-gray-100 p-2 rounded-md block">{user.email}</span></div>
                    <div><label className="font-semibold text-gray-600 block mb-1">Teléfono:</label> {isEditing ? <input name="telefono" value={profileData.telefono || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.telefono}</span>}</div>
                    <div><label className="font-semibold text-gray-600 block mb-1">Carrera:</label> {isEditing ? <input name="carrera_cursada" value={profileData.carrera_cursada || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.carrera_cursada}</span>}</div>
                    <div><label className="font-semibold text-gray-600 block mb-1">Año Graduación:</label> {isEditing ? <input type="number" name="ano_graduacion" value={profileData.ano_graduacion || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.ano_graduacion}</span>}</div>
                    <div className="md:col-span-2"><label className="font-semibold text-gray-600 block mb-1">Dirección:</label> {isEditing ? <input name="direccion" value={profileData.direccion || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.direccion}</span>}</div>
                    <div className="md:col-span-2"><label className="font-semibold text-gray-600 block mb-1">Zona Geográfica:</label> {isEditing ? <input name="zona_geografica" value={profileData.zona_geografica || ''} onChange={handleInputChange} className="p-2 border rounded w-full" /> : <span className="text-gray-900">{profileData.zona_geografica}</span>}</div>
                </div>
            </div>

            {/* Sección de Documentos */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Mis Documentos</h3>
                <div className="bg-gray-50 p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-center mb-6">
                    <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full md:w-auto p-2 border rounded-md">
                        <option value="curriculum">Currículum</option>
                        <option value="titulo_profesional">Título Profesional</option>
                        <option value="cedula_identidad">Cédula de Identidad</option>
                        <option value="otro_relevante">Otro</option>
                    </select>
                    <input type="file" id="file-input-perfil" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    <button onClick={handleFileUpload} disabled={uploading || !selectedFile} className="w-full md:w-auto bg-green-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center justify-center gap-2 shrink-0">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        {uploading ? 'Subiendo...' : 'Subir'}
                    </button>
                </div>

                <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Documentos Subidos:</h4>
                    {documents.length > 0 ? (
                        <ul className="border rounded-md divide-y">
                            {documents.map(doc => (
                                <li key={doc.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-700">{doc.nombre_archivo}</span>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => handleDownload(doc.url_archivo_storage, doc.nombre_archivo)} disabled={downloadingDocId === doc.id} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium disabled:opacity-50">
                                            {downloadingDocId === doc.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            {downloadingDocId === doc.id ? 'Descargando...' : 'Descargar'}
                                        </button>
                                        <button onClick={() => handleDocumentDelete(doc.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium">
                                            <Trash2 size={16} /> Borrar
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">No tienes documentos subidos.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiPerfil;