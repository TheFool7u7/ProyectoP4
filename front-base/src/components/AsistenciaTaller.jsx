import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './context/AuthContext';
import { CalendarDays, Upload, CheckCircle, Trash2, BookUser, Award, Download } from 'lucide-react';

const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    if (!startDate || !endDate) return [];
    let currentDate = new Date(startDate);
    let finalDate = new Date(endDate);
    if (isNaN(currentDate.getTime()) || isNaN(finalDate.getTime())) return [];
    currentDate.setUTCHours(0, 0, 0, 0);
    finalDate.setUTCHours(0, 0, 0, 0);
    if (finalDate < currentDate) return [];
    let safety = 0;
    while (currentDate <= finalDate && safety < 365) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
        safety++;
    }
    return dates;
};

const AsistenciaTaller = () => {
    const { tallerId } = useParams();
    const { user } = useAuth();
    const [inscritos, setInscritos] = useState([]);
    const [taller, setTaller] = useState(null);
    const [asistencia, setAsistencia] = useState({});
    const [loading, setLoading] = useState(true);
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [fileInputs, setFileInputs] = useState({});
    const [activeTab, setActiveTab] = useState('calificaciones');

    const API_URL = import.meta.env.VITE_API_URL;
    const estadosPosiblesDiarios = ['asistio', 'no_asistio', 'no_se_impartio'];
    const estadosPosiblesGenerales = ['inscrito', 'asistio_completo', 'no_asistio', 'aprobado', 'reprobado', 'completado_certificado'];

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [tallerRes, inscritosRes, asistenciaRes] = await Promise.all([
                fetch(`${API_URL}/api/catalogo/talleres/${tallerId}`),
                fetch(`${API_URL}/api/talleres/${tallerId}/inscritos`),
                fetch(`${API_URL}/api/asistencia/${tallerId}`)
            ]);

            if (!tallerRes.ok || !inscritosRes.ok || !asistenciaRes.ok) throw new Error("Error al cargar datos.");

            const tallerData = await tallerRes.json();
            const inscritosData = await inscritosRes.json();
            const asistenciaData = await asistenciaRes.json();

            setTaller(tallerData);
            setInscritos(inscritosData);

            const asistenciaMap = {};
            asistenciaData.forEach(a => {
                const fechaKey = new Date(a.fecha_clase).toISOString().split('T')[0];
                asistenciaMap[`${a.inscripcion_id}_${fechaKey}`] = a.estado;
            });
            setAsistencia(asistenciaMap);

            const hoy = new Date();
            hoy.setUTCHours(0, 0, 0, 0);
            const fechasDelTaller = getDatesInRange(tallerData.fecha_inicio, tallerData.fecha_fin);
            const fechaDeHoyEnTaller = fechasDelTaller.find(f => f.getTime() === hoy.getTime());
            if (fechaDeHoyEnTaller) {
                setFechaSeleccionada(fechaDeHoyEnTaller.toISOString().split('T')[0]);
            } else if (fechasDelTaller.length > 0) {
                setFechaSeleccionada(fechasDelTaller[0].toISOString().split('T')[0]);
            }
        } catch (error) {
            console.error("Error en fetchData:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }, [tallerId, API_URL, setTaller, setInscritos, setAsistencia, setFechaSeleccionada, setLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDailyStatusChange = async (inscripcionId, fechaISO, nuevoEstado) => {
        const asistenciaKey = `${inscripcionId}_${fechaISO}`;
        const oldState = asistencia[asistenciaKey];
        setAsistencia(prev => ({ ...prev, [asistenciaKey]: nuevoEstado }));
        try {
            const response = await fetch(`${API_URL}/api/asistencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inscripcion_id: inscripcionId, fecha_clase: fechaISO, estado: nuevoEstado })
            });
            if (!response.ok) throw new Error("Fallo al guardar la asistencia");
        } catch (error) {
            alert("No se pudo guardar el cambio, por favor intente de nuevo.");
            setAsistencia(prev => ({ ...prev, [asistenciaKey]: oldState }));
        }
    };

    const handleGeneralStatusChange = async (inscripcionId, nuevoEstado) => {
        try {
            const response = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!response.ok) throw new Error('Error al actualizar el estado general.');
            setInscritos(prev => prev.map(insc =>
                insc.id === inscripcionId ? { ...insc, estado: nuevoEstado } : insc
            ));
        } catch (error) {
            alert(error.message);
        }
    };

    const handleFileChange = (inscripcionId, file) => setFileInputs(prev => ({ ...prev, [inscripcionId]: file }));

    // funcion de subida
    const handleCertificateUpload = async (inscripcion) => {
        const file = fileInputs[inscripcion.id];
        if (!file) return alert("Por favor, selecciona un certificado.");

        try {
            // Se "limpia" el nombre del archivo para quitar caracteres especiales.
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

            // Ahora se usa el nombre limpio para crear la ruta del archivo.
            const filePath = `certificados/${inscripcion.taller_id}/${inscripcion.graduados.id}_${Date.now()}_${cleanFileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage.from('certificados').upload(filePath, file);
            if (uploadError) throw uploadError;

            const response = await fetch(`${API_URL}/api/inscripciones/${inscripcion.id}/certificado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url_certificado_storage: uploadData.path,
                    fecha_emision_certificado: new Date().toISOString()
                })
            });

            const responseData = await response.json();
            if (!response.ok) {
                // Si la API devuelve un error, lo mostramos.
                throw new Error(responseData.error || "No se pudo guardar la información del certificado.");
            }

            alert("Certificado asignado con éxito.");
            fetchData(); // Recargamos los datos para ver el certificado
        } catch (error) {
            alert("Error: " + error.message);
            console.error("Error al subir certificado:", error); // Log para más detalles en consola.
        }
    };

    const handleCertificateDownload = async (filePath) => {
        try {
            if (!filePath) throw new Error("La ruta del archivo no está disponible.");
            const { data, error } = await supabase.storage.from('certificados').createSignedUrl(filePath, 60);
            if (error) throw error;
            window.open(data.signedUrl, '_blank');
        } catch (error) {
            alert("No se pudo generar el enlace de descarga seguro: " + error.message);
        }
    };

    const handleUnenrollStudent = async (inscripcion) => {
        if (!window.confirm(`¿Estás seguro de que quieres desinscribir a ${inscripcion.graduados.nombre_completo}?`)) return;
        try {
            const response = await fetch(`${API_URL}/api/inscripciones`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graduado_id: inscripcion.graduados.id, taller_id: tallerId })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "No se pudo procesar la solicitud.");
            }
            fetchData();
            alert("Graduado desinscrito con éxito.");
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) return <div className="p-4 text-center">Cargando...</div>;
    if (!taller) return <div className="p-4 text-center">No se encontraron datos del taller.</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto">
            <div className="border-b pb-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gestión del Taller: <span className="text-blue-700">{taller.nombre}</span></h1>
            </div>

            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('asistencia')}
                    className={`flex items-center gap-2 py-2 px-4 text-sm font-medium ${activeTab === 'asistencia' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <BookUser size={16} /> Asistencia Diaria
                </button>
                <button
                    onClick={() => setActiveTab('calificaciones')}
                    className={`flex items-center gap-2 py-2 px-4 text-sm font-medium ${activeTab === 'calificaciones' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Award size={16} /> Calificaciones y Certificados
                </button>
            </div>

            {activeTab === 'asistencia' && (
                <div>
                    {getDatesInRange(taller.fecha_inicio, taller.fecha_fin).length > 0 ? (
                        <div className="mb-6">
                            <label htmlFor="fecha-selector" className="flex items-center text-lg font-semibold text-gray-700 mb-2">
                                <CalendarDays className="mr-2 h-6 w-6 text-gray-500" /> Seleccione la fecha de la clase:
                            </label>
                            <select id="fecha-selector" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} className="w-full md:w-1/2 p-2 border rounded-md shadow-sm">
                                {getDatesInRange(taller.fecha_inicio, taller.fecha_fin).map(fecha => {
                                    const fechaISO = fecha.toISOString().split('T')[0];
                                    return <option key={fechaISO} value={fechaISO}>{fecha.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</option>;
                                })}
                            </select>
                        </div>
                    ) : <p className="text-gray-500">Las fechas del taller no están definidas.</p>}

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Graduado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistencia del Día</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inscritos.map(inscripcion => (
                                <tr key={inscripcion.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{inscripcion.graduados.nombre_completo}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={asistencia[`${inscripcion.id}_${fechaSeleccionada}`] || ''}
                                            onChange={(e) => handleDailyStatusChange(inscripcion.id, fechaSeleccionada, e.target.value)}
                                            className="p-1 border rounded-md text-sm w-full"
                                            disabled={!fechaSeleccionada}
                                        >
                                            <option value="" disabled>-- Seleccionar --</option>
                                            {estadosPosiblesDiarios.map(estado => (
                                                <option key={estado} value={estado}>{estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'calificaciones' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Graduado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado General</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {inscritos.map(inscripcion => (
                                <tr key={inscripcion.id}>
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{inscripcion.graduados.nombre_completo}</td>
                                    <td className="px-6 py-4">
                                        <select value={inscripcion.estado || ''} onChange={(e) => handleGeneralStatusChange(inscripcion.id, e.target.value)} className="p-1 border rounded-md text-sm w-full">
                                            {estadosPosiblesGenerales.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {inscripcion.estado === 'aprobado' && !inscripcion.url_certificado_storage && (
                                            <div className="flex items-center gap-2">
                                                <input type="file" accept=".pdf" onChange={(e) => handleFileChange(inscripcion.id, e.target.files[0])} className="text-sm w-full max-w-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                                <button onClick={() => handleCertificateUpload(inscripcion)} disabled={!fileInputs[inscripcion.id]} className="bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 disabled:bg-gray-300" title="Subir Certificado">
                                                    <Upload size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {inscripcion.url_certificado_storage && (
                                            <button onClick={() => handleCertificateDownload(inscripcion.url_certificado_storage)} className="text-green-600 font-bold flex items-center gap-1 hover:underline">
                                                <Download size={16} /> Ver Certificado
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleUnenrollStudent(inscripcion)} className="text-red-600 hover:text-red-800" title="Desinscribir Graduado">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-8">
                <Link to="/talleres" className="text-blue-600 hover:underline">← Volver a Gestión de Talleres</Link>
            </div>
        </div>
    );
};

export default AsistenciaTaller;