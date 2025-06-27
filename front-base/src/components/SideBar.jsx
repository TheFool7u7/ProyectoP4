import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import {
    LayoutGrid, BookOpen, Users, GraduationCap, LogOut, Menu, UserPlus,
    Lightbulb, Star, ClipboardList, UserCircle, BookCheck, BarChart2, Search,
} from "lucide-react";

const Sidebar = ({ isMinimized, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        await signOut();
    };

    // Listas de enlaces base
    const graduateLinks = [
        { name: "Inicio", path: "/home", icon: LayoutGrid },
        { name: "Mi Perfil", path: "/mi-perfil", icon: UserCircle },
        { name: "Buscar Graduados", path: "/buscar-graduados", icon: Search },
        { name: "Catálogo de Talleres", path: "/catalogo-talleres", icon: BookOpen },
        { name: "Mis Talleres", path: "/mis-talleres", icon: BookCheck },
        { name: "Mis Preferencias", path: "/mis-preferencias", icon: Star },
        { name: "Encuestas", path: "/encuestas", icon: ClipboardList },
    ];

    const facilitatorLinks = [
        { name: "Gestionar Mis Talleres", path: "/talleres", icon: BookOpen },
        { name: "Gestionar Encuestas", path: "/gestion-encuestas", icon: ClipboardList },
    ];

    const adminLinks = [
        { name: "Ver Graduados", path: "/graduados", icon: Users },
        { name: "Registrar Graduado", path: "/graduados/registro", icon: UserPlus },
        { name: "Áreas de Interés", path: "/areas-interes", icon: Lightbulb },
        { name: "Reportes", path: "/reportes", icon: BarChart2 },
    ];

    let menuItems = graduateLinks;

    if (user?.rol === 'facilitador') {
        menuItems = [...menuItems, ...facilitatorLinks];
    } else if (user?.rol === 'administrador') {
        const adminTallerLink = { ...facilitatorLinks[0], name: "Gestionar Talleres" };
        const adminEncuestaLink = { ...facilitatorLinks[1], name: "Gestionar Encuestas" };
        menuItems = [...menuItems, adminTallerLink, adminEncuestaLink, ...adminLinks];
    }

    return (
        <aside
            className={`fixed md:static z-20 h-screen flex flex-col justify-between ${isMinimized ? "w-20" : "w-64"
                } shadow-xl p-4 transition-all duration-300`}
            style={{
                backgroundColor: 'rgba(237, 237, 221, 0.95)', // Fondo claro con transparencia
                borderRight: '1px solid rgba(99, 0, 0, 0.3)', // Borde sutil
            }}
        >
            {/* Contenedor del logo y los items de navegación (flexible para empujar el botón de salir) */}
            <div className="flex flex-col flex-grow">
                {/* Logo y Título */}
                <div className="mb-8 text-center">
                    {!isMinimized ? (
                        <>
                            <h2 className="text-2xl font-bold" style={{ color: '#1B1717' }}>S.R.G.G.</h2>
                            <p className="text-xs mt-1" style={{ color: '#630000' }}>Sistema de Registro y Gestión de Graduados</p>
                        </>
                    ) : (
                        <h2 className="text-2xl font-bold" style={{ color: '#1B1717' }}>SRGG</h2> // Versión minimizada
                    )}
                </div>

                {/* Navegación con scrollbar */}
                <nav className="flex-grow overflow-y-auto space-y-2 pr-2"> {/* pr-2 para dejar espacio para la scrollbar */}
                    {menuItems.map(({ name, path, icon: Icon }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                transition-all duration-200 transform
                                ${location.pathname === path
                                    ? "bg-gradient-to-r from-[#630000] to-[#810100] text-white shadow-md font-semibold" // Estilo activo
                                    : "bg-white bg-opacity-70 text-gray-700 hover:text-[#630000] hover:bg-opacity-90 hover:scale-[1.02]" // Inactivo con fondo y hover
                                }
                            `}
                            // No es necesario un estilo inline si ya está en className
                        >
                            <Icon size={20} style={location.pathname === path ? { color: 'white' } : { color: '#630000' }} />
                            {!isMinimized && <span className="text-sm font-medium">{name}</span>}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Botón de Salir - el flex-grow del div de arriba lo empuja hacia abajo */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                           transition-all duration-300 transform relative overflow-hidden mt-6" // mt-6 para un poco más de separación
                style={{
                    background: 'linear-gradient(135deg, #FF6B6B 0%, #E04343 100%)', // Gradiente rojo
                    color: 'white',
                    boxShadow: '0 5px 15px rgba(255, 107, 107, 0.3)',
                    border: '1px solid rgba(255, 107, 107, 0.5)'
                }}
            >
                <LogOut size={20} />
                {!isMinimized && <span>Salir</span>}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transform -skew-x-12 transition-opacity duration-500"></div>
            </button>
        </aside>
    );
};

export default Sidebar;