import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, Trash2 } from 'lucide-react';

const EditGraduadoModal = ({ isOpen, onClose, graduado, onGraduadoUpdated }) => {
    const [formData, setFormData] = useState({});
    const [documents, setDocuments] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (graduado) {
            setFormData(graduado);
            const fetchDocuments = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/documentos/${graduado.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setDocuments(data);
                    }
                } catch (error) {
                    console.error("Error al cargar documentos:", error);
                    setDocuments([]);
                }
            };
            fetchDocuments();
        }
    }, [graduado, isOpen, API_URL]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.id) return;
        try {
            // Se envían todos los datos del formulario, incluyendo los nuevos campos
            const response = await fetch(`${API_URL}/api/graduados/${formData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al actualizar');
            onGraduadoUpdated(result); // Actualiza la lista en el componente padre
            alert('¡Datos del graduado actualizados!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDownload = async (filePath, fileName) => {
        try {
            const { data, error } = await supabase.storage
                .from('documentos-graduados')
                .createSignedUrl(filePath, 60);

            if (error) throw error;

            const response = await fetch(data.signedUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = blobUrl;
            link.setAttribute('download', fileName || 'download');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

        } catch (error) {
            alert("No se pudo descargar el archivo: " + error.message);
            console.error("Error al descargar:", error);
        }
    };

    const handleDocumentDelete = async (docId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este documento?")) {
            return;
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl z-50 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Editar Graduado</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna 1 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="nombre_completo_edit" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" name="nombre_completo" id="nombre_completo_edit" value={formData.nombre_completo || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="identificacion_edit" className="block text-sm font-medium text-gray-700">Identificación</label>
                            <input type="text" name="identificacion" id="identificacion_edit" value={formData.identificacion || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                            <p className="mt-1 block w-full p-2 bg-gray-100 rounded-md text-gray-600">{formData.correo_electronico || 'No disponible'}</p>
                        </div>
                        <div>
                            <label htmlFor="telefono_edit" className="block text-sm font-medium text-gray-700">Teléfono</label>
                            <input type="tel" name="telefono" id="telefono_edit" value={formData.telefono || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>

                    {/* Columna 2 */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="direccion_edit" className="block text-sm font-medium text-gray-700">Dirección</label>
                            <input type="text" name="direccion" id="direccion_edit" value={formData.direccion || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="zona_geografica_edit" className="block text-sm font-medium text-gray-700">Zona Geográfica</label>
                            <input type="text" name="zona_geografica" id="zona_geografica_edit" value={formData.zona_geografica || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="carrera_cursada_edit" className="block text-sm font-medium text-gray-700">Carrera Cursada</label>
                            <input type="text" name="carrera_cursada" id="carrera_cursada_edit" value={formData.carrera_cursada || ''} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="ano_graduacion_edit" className="block text-sm font-medium text-gray-700">Año de Graduación</label>
                            <input type="number" name="ano_graduacion" id="ano_graduacion_edit" value={formData.ano_graduacion || ''} onChange={handleChange} required placeholder="Ej: 2023" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Guardar Cambios</button>
                    </div>
                </form>

                <hr className="my-6 border-t" />

                {/* Sección de documentos*/}
                <div>
                    <h3 className="text-xl font-bold mb-4">Gestión de Documentos</h3>
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold">Documentos Subidos:</h4>
                        {documents.length > 0 ? (
                            <ul className="border rounded-md divide-y">
                                {documents.map(doc => (
                                    <li key={doc.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                        <span className='text-sm'>{doc.nombre_archivo} ({doc.tipo_documento.replace('_', ' ')})</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleDownload(doc.url_archivo_storage, doc.nombre_archivo)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"><Download size={16} /> Ver</button>
                                            <button onClick={() => handleDocumentDelete(doc.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium"><Trash2 size={16} /> Borrar</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">No hay documentos subidos para este graduado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGraduadoModal;