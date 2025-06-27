import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from './context/AuthContext';
import { CalendarDays, Upload, CheckCircle, Clock, Trash2, BookUser, Award, Download, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
    const [error, setError] = useState(null); // Añadido para manejar errores en la UI
    const [fechaSeleccionada, setFechaSeleccionada] = useState('');
    const [fileInputs, setFileInputs] = useState({});
    const [activeTab, setActiveTab] = useState('calificaciones'); // Pestaña predeterminada
    const [uploadingCert, setUploadingCert] = useState(false); // Estado para la subida de certificado

    const API_URL = import.meta.env.VITE_API_URL;
    const estadosPosiblesDiarios = ['asistio', 'no_asistio', 'no_se_impartio'];
    const estadosPosiblesGenerales = ['inscrito', 'asistio_completo', 'no_asistio', 'aprobado', 'reprobado', 'completado_certificado'];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null); // Limpiar errores previos
        try {
            const [tallerRes, inscritosRes, asistenciaRes] = await Promise.all([
                fetch(`${API_URL}/api/catalogo/talleres/${tallerId}`),
                fetch(`${API_URL}/api/talleres/${tallerId}/inscritos`),
                fetch(`${API_URL}/api/asistencia/${tallerId}`)
            ]);

            if (!tallerRes.ok || !inscritosRes.ok || !asistenciaRes.ok) {
                const errorText = await Promise.all([tallerRes.text(), inscritosRes.text(), asistenciaRes.text()]);
                throw new Error(`Error al cargar datos: ${errorText.join(' | ')}`);
            }

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
                // Seleccionar la primera fecha disponible si hoy no está en el rango
                setFechaSeleccionada(fechasDelTaller[0].toISOString().split('T')[0]);
            } else {
                setFechaSeleccionada(''); // No hay fechas válidas
            }
        } catch (err) {
            console.error("Error en fetchData:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [tallerId, API_URL]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDailyStatusChange = async (inscripcionId, fechaISO, nuevoEstado) => {
        const asistenciaKey = `${inscripcionId}_${fechaISO}`;
        const oldState = asistencia[asistenciaKey];
        setAsistencia(prev => ({ ...prev, [asistenciaKey]: nuevoEstado })); // Optimistic update
        try {
            const response = await fetch(`${API_URL}/api/asistencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inscripcion_id: inscripcionId, fecha_clase: fechaISO, estado: nuevoEstado })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Fallo al guardar la asistencia");
            }
        } catch (err) {
            alert("No se pudo guardar el cambio, por favor intente de nuevo: " + err.message);
            setAsistencia(prev => ({ ...prev, [asistenciaKey]: oldState })); // Revert optimistic update
        }
    };

    const handleGeneralStatusChange = async (inscripcionId, nuevoEstado) => {
        const oldInscrito = inscritos.find(insc => insc.id === inscripcionId);
        setInscritos(prev => prev.map(insc =>
            insc.id === inscripcionId ? { ...insc, estado: nuevoEstado } : insc
        )); // Optimistic update
        try {
            const response = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el estado general.');
            }
        } catch (err) {
            alert(err.message);
            setInscritos(prev => prev.map(insc =>
                insc.id === inscripcionId ? oldInscrito : insc
            )); // Revert optimistic update
        }
    };

    const handleFileChange = (inscripcionId, file) => setFileInputs(prev => ({ ...prev, [inscripcionId]: file }));

    const handleCertificateUpload = async (inscripcion) => {
        const file = fileInputs[inscripcion.id];
        if (!file) return alert("Por favor, selecciona un certificado.");

        setUploadingCert(true); // Iniciar estado de subida
        try {
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
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
                throw new Error(responseData.error || "No se pudo guardar la información del certificado.");
            }

            alert("Certificado asignado con éxito.");
            fetchData(); // Recargamos los datos para ver el certificado actualizado
            setFileInputs(prev => { // Limpiar el input de archivo
                const newInputs = { ...prev };
                delete newInputs[inscripcion.id];
                return newInputs;
            });
        } catch (err) {
            alert("Error: " + err.message);
            console.error("Error al subir certificado:", err);
        } finally {
            setUploadingCert(false); // Finalizar estado de subida
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
        if (!window.confirm(`¿Estás seguro de que quieres desinscribir a ${inscripcion.graduados.nombre_completo} de este taller?`)) return;
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
            fetchData(); // Recargar datos para reflejar la desinscripción
            alert("Graduado desinscrito con éxito.");
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const tabButtonClass = (tabName) => `
        flex items-center gap-2 py-3 px-6 text-base font-semibold rounded-t-lg
        transition-all duration-300 ease-in-out transform
        ${activeTab === tabName
            ? 'bg-opacity-95 text-[#1B1717] border-b-2 border-[#810100] shadow-md'
            : 'text-gray-500 hover:text-[#630000] hover:bg-opacity-70'
        }
    `;

    const statusBadgeClass = (status) => {
        switch (status) {
            case 'asistio': return 'bg-green-100 text-green-800';
            case 'no_asistio': return 'bg-red-100 text-red-800';
            case 'no_se_impartio': return 'bg-yellow-100 text-yellow-800';
            case 'inscrito': return 'bg-blue-100 text-blue-800';
            case 'aprobado': return 'bg-purple-100 text-purple-800';
            case 'reprobado': return 'bg-red-200 text-red-900';
            case 'completado_certificado': return 'bg-teal-100 text-teal-800';
            case 'asistio_completo': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)' }}>
            <Loader2 size={48} className="animate-spin text-[#EDEDDD]" />
            <p className="text-center p-10 text-[#EDEDDD] text-lg font-semibold">Cargando datos del taller...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)' }}>
            <AlertCircle size={48} className="text-red-400 mb-4" />
            <p className="text-center text-red-300 p-10 text-lg font-semibold">Error: {error}</p>
            <Link to="/talleres" className="mt-4 text-blue-300 hover:underline">Volver a Gestión de Talleres</Link>
        </div>
    );

    if (!taller) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)' }}>
            <AlertCircle size={48} className="text-yellow-400 mb-4" />
            <p className="text-center text-yellow-300 p-10 text-lg font-semibold">No se encontraron datos del taller.</p>
            <Link to="/talleres" className="mt-4 text-blue-300 hover:underline">Volver a Gestión de Talleres</Link>
        </div>
    );

    return (
        <div
            className="min-h-screen p-4 relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #1B1717 0%, #630000 50%, #810100 100%)'
            }}
        >
            <div
                className="relative z-10 w-full max-w-6xl mx-auto backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-10 opacity-0 animate-slideUp"
                style={{ backgroundColor: 'rgba(237, 237, 221, 0.95)' }}
            >
                {/* Header del Taller */}
                <div className="text-center mb-8 border-b pb-4" style={{ borderColor: '#630000' }}>
                    <h1 className="text-3xl font-bold mb-2 opacity-0 animate-fadeIn animation-delay-300" style={{ color: '#1B1717' }}>
                        Gestión del Taller: <span className="text-[#810100]">{taller.nombre}</span>
                    </h1>
                    <p className="text-sm opacity-70 animate-fadeIn animation-delay-500" style={{ color: '#1B1717' }}>
                        Administra la asistencia y las calificaciones de los graduados inscritos.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6 opacity-0 animate-fadeIn animation-delay-700" style={{ borderColor: '#630000' }}>
                    <button
                        onClick={() => setActiveTab('asistencia')}
                        className={tabButtonClass('asistencia')}
                        style={activeTab === 'asistencia' ? { backgroundColor: 'rgba(237, 237, 221, 0.9)', color: '#1B1717' } : { color: '#630000', backgroundColor: 'transparent' }}
                    >
                        <BookUser size={20} /> Asistencia Diaria
                    </button>
                    <button
                        onClick={() => setActiveTab('calificaciones')}
                        className={tabButtonClass('calificaciones')}
                        style={activeTab === 'calificaciones' ? { backgroundColor: 'rgba(237, 237, 221, 0.9)', color: '#1B1717' } : { color: '#630000', backgroundColor: 'transparent' }}
                    >
                        <Award size={20} /> Calificaciones y Certificados
                    </button>
                </div>

                {/* Contenido de Asistencia Diaria */}
                {activeTab === 'asistencia' && (
                    <div className="opacity-0 animate-slideInLeft animation-delay-800 p-4 rounded-xl border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        {getDatesInRange(taller.fecha_inicio, taller.fecha_fin).length > 0 ? (
                            <div className="mb-6">
                                <label htmlFor="fecha-selector" className="flex items-center text-lg font-bold mb-2" style={{ color: '#1B1717' }}>
                                    <CalendarDays className="mr-3 h-7 w-7 text-[#630000]" /> Selecciona la fecha de la clase:
                                </label>
                                <select
                                    id="fecha-selector"
                                    value={fechaSeleccionada}
                                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                                    className="w-full md:w-1/2 p-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#810100] transition-all duration-200"
                                    style={{ backgroundColor: 'white', borderColor: '#630000', color: '#1B1717' }}
                                >
                                    {getDatesInRange(taller.fecha_inicio, taller.fecha_fin).map(fecha => {
                                        const fechaISO = fecha.toISOString().split('T')[0];
                                        return <option key={fechaISO} value={fechaISO}>{fecha.toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</option>;
                                    })}
                                </select>
                            </div>
                        ) : <p className="text-gray-600 text-center">Las fechas del taller no están definidas o son inválidas.</p>}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md" style={{ backgroundColor: 'white' }}>
                                <thead style={{ backgroundColor: '#1B1717' }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Graduado</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Asistencia del Día</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inscritos.map(inscripcion => (
                                        <tr key={inscripcion.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{inscripcion.graduados.nombre_completo}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={asistencia[`${inscripcion.id}_${fechaSeleccionada}`] || ''}
                                                    onChange={(e) => handleDailyStatusChange(inscripcion.id, fechaSeleccionada, e.target.value)}
                                                    className="p-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#810100] transition-all duration-200"
                                                    style={{ borderColor: '#630000', color: '#1B1717' }}
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
                    </div>
                )}

                {/* Contenido de Calificaciones y Certificados */}
                {activeTab === 'calificaciones' && (
                    <div className="opacity-0 animate-slideInLeft animation-delay-800 p-4 rounded-xl border border-opacity-20" style={{ backgroundColor: 'rgba(237, 237, 221, 0.8)', borderColor: '#630000' }}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md" style={{ backgroundColor: 'white' }}>
                                <thead style={{ backgroundColor: '#1B1717' }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Graduado</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Estado General</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Certificado</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-[#EDEDDD] uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inscritos.map(inscripcion => (
                                        <tr key={inscripcion.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">{inscripcion.graduados.nombre_completo}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={inscripcion.estado || ''}
                                                    onChange={(e) => handleGeneralStatusChange(inscripcion.id, e.target.value)}
                                                    className={`p-2 border rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#810100] transition-all duration-200 ${statusBadgeClass(inscripcion.estado)}`}
                                                    style={{ borderColor: '#630000', color: '#1B1717' }}
                                                >
                                                    {estadosPosiblesGenerales.map(e => <option key={e} value={e}>{e.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inscripcion.estado === 'aprobado' && !inscripcion.url_certificado_storage && (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => handleFileChange(inscripcion.id, e.target.files[0])}
                                                            className="text-sm w-full file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-colors duration-200"
                                                        />
                                                        <button
                                                            onClick={() => handleCertificateUpload(inscripcion)}
                                                            disabled={uploadingCert || !fileInputs[inscripcion.id]}
                                                            className="flex-shrink-0 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-all duration-200 transform hover:scale-105"
                                                            title="Subir Certificado"
                                                        >
                                                            {uploadingCert ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                        </button>
                                                    </div>
                                                )}
                                                {inscripcion.url_certificado_storage && (
                                                    <button onClick={() => handleCertificateDownload(inscripcion.url_certificado_storage)}
                                                        className="text-green-600 font-bold flex items-center gap-1 hover:underline transition-colors duration-220 transform hover:scale-105"
                                                    >
                                                        <Download size={16} /> Ver Certificado
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleUnenrollStudent(inscripcion)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                                    title="Desinscribir Graduado"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center opacity-0 animate-fadeIn animation-delay-1000">
                    <Link to="/talleres"
                        className="font-semibold hover:underline transition-all duration-200 hover:scale-105 bg-transparent border-none cursor-pointer"
                        style={{ color: '#630000' }}
                    >
                        ← Volver a Gestión de Talleres
                    </Link>
                </div>
            </div>

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
                .animation-delay-1000 { animation-delay: 1000ms; }
            `}</style>
        </div>
    );
};

export default AsistenciaTaller;