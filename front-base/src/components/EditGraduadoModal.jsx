import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Asegúrate de que este import sea correcto

const EditGraduadoModal = ({ graduado, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [carreras, setCarreras] = useState([]);
    const [carreraActual, setCarreraActual] = useState({ nombre_carrera: '', ano_finalizacion: '' });
    const [loading, setLoading] = useState(false);
    const [documentos, setDocumentos] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (graduado) {
            setFormData({
                nombre_completo: graduado.nombre_completo || '',
                identificacion: graduado.identificacion || '',
                telefono: graduado.telefono || '',
                direccion: graduado.direccion || '',
                zona_geografica: graduado.zona_geografica || '',
                logros_adicionales: graduado.logros_adicionales || '',
            });

            const fetchCarreras = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/graduados/${graduado.id}/carreras`);
                    if (response.ok) {
                        const data = await response.json();
                        setCarreras(data);
                    }
                } catch (error) {
                    console.error("Error al cargar carreras:", error);
                }
            };
            
            const fetchDocumentos = async () => {
                setLoadingDocs(true);
                try {
                    const response = await fetch(`${API_URL}/api/documentos/${graduado.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        // El `url_archivo_storage` ahora debería ser solo la RUTA del archivo, no la URL completa
                        setDocumentos(data);
                    }
                } catch (error) {
                    console.error("Error al cargar documentos:", error);
                } finally {
                    setLoadingDocs(false);
                }
            };

            fetchCarreras();
            fetchDocumentos(); 
        }
    }, [graduado, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCarreraChange = (e) => {
        const { name, value } = e.target;
        setCarreraActual(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCarrera = async () => {
        if (!carreraActual.nombre_carrera || !carreraActual.ano_finalizacion) return;
        const response = await fetch(`${API_URL}/api/graduados/carreras`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...carreraActual, graduado_id: graduado.id })
        });
        if (response.ok) {
            const nuevaCarrera = await response.json();
            setCarreras(prev => [...prev, nuevaCarrera]);
            setCarreraActual({ nombre_carrera: '', ano_finalizacion: '' });
        } else alert("Error al añadir la carrera.");
    };

    const handleRemoveCarrera = async (carreraId) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta carrera?")) return;
        const response = await fetch(`${API_URL}/api/graduados/carreras/${carreraId}`, { method: 'DELETE' });
        if (response.ok) setCarreras(prev => prev.filter(c => c.id !== carreraId));
        else alert("Error al eliminar la carrera.");
    };

    // --- NUEVA FUNCIÓN AÑADIDA ---
    const handleDocumentView = async (filePath) => {
        try {
            if (!filePath) {
                alert("La ruta del archivo no está disponible.");
                return;
            }
            // Genera una URL firmada que será válida por 60 segundos
            const { data, error } = await supabase.storage
                .from('documentos-graduados') // Asegúrate que este es el nombre de tu bucket
                .createSignedUrl(filePath, 60); // 60 segundos de validez

            if (error) throw error;
            window.open(data.signedUrl, '_blank'); // Abre el documento en una nueva pestaña
        } catch (error) {
            alert("Error al generar el enlace del documento: " + error.message);
            console.error("Error al generar URL firmada:", error);
        }
    };

    const handleDeleteDocumento = async (documentoId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento? Esta acción es permanente.")) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/documentos/${documentoId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudo eliminar el documento.');
            }
            alert("Documento eliminado con éxito.");
            setDocumentos(prev => prev.filter(doc => doc.id !== documentoId)); 
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/graduados/${graduado.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('No se pudo actualizar la información personal.');
            alert('Perfil actualizado con éxito.');
            onSave();
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!graduado) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">Editar Perfil del Graduado</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Columna de Información Personal */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Información Personal</h3>
                            <div><label className="block text-sm font-medium">Nombre Completo</label><input type="text" name="nombre_completo" value={formData.nombre_completo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required /></div>
                            <div><label className="block text-sm font-medium">Identificación</label><input type="text" name="identificacion" value={formData.identificacion || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required /></div>
                            <div><label className="block text-sm font-medium">Teléfono</label><input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium">Dirección</label><input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium">Zona Geográfica</label><input type="text" name="zona_geografica" value={formData.zona_geografica || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" /></div>
                            <div><label className="block text-sm font-medium">Logros Adicionales</label><textarea name="logros_adicionales" value={formData.logros_adicionales || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" rows="2"></textarea></div>
                        </div>

                        {/* Columna de Carreras y Documentos */}
                        <div className="space-y-6">
                            {/* Sección de Títulos */}
                            <div>
                                <h3 className="font-semibold text-lg border-b pb-2">Títulos Obtenidos</h3>
                                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2">
                                    {carreras.map(c => (
                                        <div key={c.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                            <span>{c.nombre_carrera} ({c.ano_finalizacion})</span>
                                            <button type="button" onClick={() => handleRemoveCarrera(c.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                                    <input name="nombre_carrera" value={carreraActual.nombre_carrera} onChange={handleCarreraChange} placeholder="Nombre de Carrera" className="p-2 border rounded flex-grow"/>
                                    <input type="number" name="ano_finalizacion" value={carreraActual.ano_finalizacion} onChange={handleCarreraChange} placeholder="Año" className="p-2 border rounded w-24"/>
                                    <button type="button" onClick={handleAddCarrera} className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 shrink-0"><PlusCircle size={22}/></button>
                                </div>
                            </div>
                            
                            {/* --- Sección de Documentos --- */}
                            <div>
                                <h3 className="font-semibold text-lg border-b pb-2">Documentos Adjuntos</h3>
                                <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2">
                                    {loadingDocs ? <p>Cargando documentos...</p> : 
                                        documentos.length > 0 ? documentos.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                                {/* --- CAMBIO APLICADO AQUÍ --- */}
                                                <button type="button" onClick={() => handleDocumentView(doc.url_archivo_storage)} className="flex items-center gap-2 text-blue-600 hover:underline truncate bg-transparent border-none p-0 cursor-pointer text-left w-full" title={doc.nombre_archivo}>
                                                    <FileText size={18} />
                                                    <span className="truncate">{doc.nombre_archivo}</span>
                                                </button>
                                                <button type="button" onClick={() => handleDeleteDocumento(doc.id)} className="text-red-500 hover:text-red-700 shrink-0 ml-2"><Trash2 size={18} /></button>
                                            </div>
                                        )) : <p className="text-gray-500">No hay documentos adjuntos.</p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400">Cancelar</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGraduadoModal;