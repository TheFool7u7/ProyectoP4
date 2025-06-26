// En src/components/Reportes.jsx
// Código final del Dashboard de Reportes Estratégicos

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// ----- NUEVOS ELEMENTOS -----
import { Users, BookOpen, ClipboardCheck, MessageSquare } from 'lucide-react'; // Nuevos iconos para KPIs

const Reportes = () => {
    // La pestaña inicial ahora es el dashboard estratégico
    const [activeTab, setActiveTab] = useState('estrategico');

    // Estados para todos los reportes, incluyendo los nuevos
    const [reporteCarreras, setReporteCarreras] = useState([]);
    const [reporteAnos, setReporteAnos] = useState([]);
    const [reporteZonas, setReporteZonas] = useState([]);
    const [reportePreferencias, setReportePreferencias] = useState([]);
    const [reporteAnalisis, setReporteAnalisis] = useState([]);
    const [reporteKPIs, setReporteKPIs] = useState(null); 
    const [reporteCrecimiento, setReporteCrecimiento] = useState([]); 
    const [reporteFacilitadores, setReporteFacilitadores] = useState([]); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchReportes = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Acceso denegado.");
                const token = session.access_token;
                const headers = { 'Authorization': `Bearer ${token}` };

                // Se hacen todas las peticiones en paralelo para máxima eficiencia
                const responses = await Promise.all([
                    fetch(`${API_URL}/api/reportes/graduados-por-carrera`, { headers }),
                    fetch(`${API_URL}/api/reportes/graduados-por-ano`, { headers }),
                    fetch(`${API_URL}/api/reportes/graduados-por-zona`, { headers }),
                    fetch(`${API_URL}/api/reportes/preferencias-areas`, { headers }),
                    fetch(`${API_URL}/api/reportes/analisis-talleres`, { headers }),
                    fetch(`${API_URL}/api/reportes/resumen-kpis`, { headers }),
                    fetch(`${API_URL}/api/reportes/crecimiento-mensual`, { headers }),
                    fetch(`${API_URL}/api/reportes/desempeno-facilitadores`, { headers }),
                ]);

                if (responses.some(res => !res.ok)) {
                    throw new Error(`Error al cargar los reportes.`);
                }

                // Se procesa todas las respuestas JSON en paralelo
                const data = await Promise.all(responses.map(res => res.json()));

                setReporteCarreras(data[0]);
                setReporteAnos(data[1]);
                setReporteZonas(data[2]);
                setReportePreferencias(data[3]);
                setReporteAnalisis(data[4]);
                setReporteKPIs(data[5]);
                setReporteCrecimiento(data[6]);
                setReporteFacilitadores(data[7]);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReportes();
    }, [API_URL]);

    // Componente para tarjetas de Indicadores Clave (KPIs)
    const KPICard = ({ title, value, icon }) => (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center transition-transform hover:scale-105">
            <div className="bg-blue-100 p-4 rounded-full mr-4">{icon}</div>
            <div>
                <p className="text-gray-600 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value ?? '...'}</p>
            </div>
        </div>
    );

    // Componentes reutilizables
    const ReporteCard = ({ title, children }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>{children}</ResponsiveContainer>
            </div>
        </div>
    );

    const TabButton = ({ tabName, activeTab, onClick, children }) => (
        <button
            onClick={() => onClick(tabName)}
            className={`px-4 py-2 font-semibold rounded-md transition-colors ${activeTab === tabName
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            {children}
        </button>
    );

    if (loading) return <p className="text-center p-10">Cargando dashboard...</p>;
    if (error) return <p className="text-center text-red-500 p-10">Error: {error}</p>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Estratégico</h1>

            {/* ----- ESTRUCTURA DE PESTAÑAS ----- */}
            <div className="flex flex-wrap gap-2 border-b-2 pb-2 mb-6">
                <TabButton tabName="estrategico" activeTab={activeTab} onClick={setActiveTab}>Estratégico</TabButton>
                <TabButton tabName="analisis" activeTab={activeTab} onClick={setActiveTab}>Análisis de Talleres</TabButton>
                <TabButton tabName="graduados" activeTab={activeTab} onClick={setActiveTab}>Reportes de Graduados</TabButton>
                <TabButton tabName="preferencias" activeTab={activeTab} onClick={setActiveTab}>Preferencias</TabButton>
            </div>

            <div>
                {/* ----- PESTAÑA ESTRATÉGICA ----- */}
                {activeTab === 'estrategico' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard title="Total Graduados" value={reporteKPIs?.total_graduados} icon={<Users className="text-blue-500" />} />
                            <KPICard title="Talleres Activos" value={reporteKPIs?.total_talleres} icon={<BookOpen className="text-blue-500" />} />
                            <KPICard title="Total Inscripciones" value={reporteKPIs?.total_inscripciones} icon={<ClipboardCheck className="text-blue-500" />} />
                            <KPICard title="Total Encuestas" value={reporteKPIs?.total_encuestas} icon={<MessageSquare className="text-blue-500" />} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ReporteCard title="Crecimiento Mensual de la Plataforma">
                                <LineChart data={reporteCrecimiento}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="nuevos_graduados" stroke="#8884d8" name="Nuevos Graduados" />
                                </LineChart>
                            </ReporteCard>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Desempeño de Facilitadores</h2>
                                <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facilitador</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Talleres Dictados</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Estudiantes</th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasa de Asistencia Promedio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reporteFacilitadores.map(f => (
                                                <tr key={f.facilitador_id}>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{f.nombre_facilitador}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{f.cantidad_talleres}</td>
                                                    <td className="px-4 py-3 text-center text-gray-600">{f.total_estudiantes}</td>
                                                    <td className="px-4 py-3 text-center font-semibold text-gray-600">{parseFloat(f.tasa_asistencia_promedio || 0).toFixed(1)}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ----- PESTAÑA ANÁLISIS DE TALLERES ----- */}
                {activeTab === 'analisis' && (
                    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                        <h2 className="text-xl font-semibold mb-4">Análisis de Tasas de Inscripción y Participación</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taller</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Inscritos / Cupo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasa Inscripción</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Asistentes</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasa Participación</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {reporteAnalisis.map(taller => (
                                        <tr key={taller.taller_id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{taller.nombre_taller}</td>
                                            <td className="px-6 py-4 text-center">{taller.total_inscritos} / {taller.cupo_maximo || '∞'}</td>
                                            <td className="px-6 py-4 text-center">{parseFloat(taller.tasa_inscripcion || 0).toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-center">{taller.total_asistentes}</td>
                                            <td className="px-6 py-4 text-center">{parseFloat(taller.tasa_participacion || 0).toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ----- PESTAÑA REPORTES DE GRADUADOS ----- */}
                {activeTab === 'graduados' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <ReporteCard title="Graduados Registrados por Carrera">
                            <BarChart data={reporteCarreras} layout="vertical" margin={{ left: 120 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="carrera" width={120} interval={0} />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#8884d8" name="N° de Graduados" />
                            </BarChart>
                        </ReporteCard>
                        <ReporteCard title="Graduados por Año">
                            <LineChart data={reporteAnos}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ano" />
                                <YAxis /> <Tooltip /> <Legend />
                                <Line type="monotone" dataKey="cantidad" stroke="#ffc658" name="N° de Graduados" strokeWidth={2} />
                            </LineChart>
                        </ReporteCard>
                        <ReporteCard title="Graduados por Zona Geográfica">
                            <BarChart data={reporteZonas}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="zona" />
                                <YAxis allowDecimals={false} /> <Tooltip /> <Legend />
                                <Bar dataKey="cantidad" fill="#ff7300" name="N° de Graduados" />
                            </BarChart>
                        </ReporteCard>
                    </div>
                )}

                {/* ----- PESTAÑA PREFERENCIAS ----- */}
                {activeTab === 'preferencias' && (
                    <ReporteCard title="Preferencias por Área de Interés">
                        <PieChart>
                            <Pie data={reportePreferencias} dataKey="cantidad" nameKey="area" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                                {reportePreferencias.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ReporteCard>
                )}
            </div>
        </div>
    );
};

export default Reportes;