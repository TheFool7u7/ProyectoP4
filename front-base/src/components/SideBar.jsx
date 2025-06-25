import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext";
import {
    LayoutGrid, BookOpen, Users, GraduationCap, LogOut, Menu, UserPlus,
    Lightbulb, Star, ClipboardList, UserCircle, BookCheck
} from "lucide-react";

const Sidebar = ({ isMinimized, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        // La redirección ahora se maneja en el AuthContext o en un componente superior
    };

    // listas de enlaces base
    const graduateLinks = [
        { name: "Inicio", path: "/home", icon: LayoutGrid },
        { name: "Mi Perfil", path: "/mi-perfil", icon: UserCircle },
        { name: "Catálogo de Talleres", path: "/catalogo-talleres", icon: ClipboardList },
        { name: "Mis Talleres", path: "/mis-talleres", icon: BookCheck },
        { name: "Mis Preferencias", path: "/mis-preferencias", icon: Star },
    ];

    const facilitatorLinks = [
        { name: "Gestionar Mis Talleres", path: "/talleres", icon: BookOpen },
    ];

    const adminLinks = [
        { name: "Ver Graduados", path: "/graduados", icon: Users },
        { name: "Registrar Graduado", path: "/graduados/registro", icon: UserPlus },
        { name: "Áreas de Interés", path: "/areas-interes", icon: Lightbulb },
    ];

    let menuItems = graduateLinks; // Base para todos los usuarios logueados

    if (user?.rol === 'facilitador') {
        // Si es facilitador, se añade sus enlaces específicos
        menuItems = [...menuItems, ...facilitatorLinks];
    } else if (user?.rol === 'administrador') {
        // Si es admin, se añade los de facilitador (con nombre cambiado) Y los de admin
        const adminTallerLink = { ...facilitatorLinks[0], name: "Gestionar Talleres" };
        menuItems = [...menuItems, adminTallerLink, ...adminLinks];
    }

    return (
        <aside
            className={`fixed md:static z-20 h-screen flex flex-col justify-between ${isMinimized ? "w-20" : "w-64"
                } bg-white border-r shadow-sm p-4 transition-all duration-300`}
        >
            <div className="w-full">
                {/* logo */}
                <nav className="space-y-2 mt-8">
                    {menuItems.map(({ name, path, icon: Icon }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            // estilos del botón
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                useLocation().pathname === path 
                                ? "bg-blue-50 text-blue-700" 
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <Icon size={20} />
                            {!isMinimized && <span className="text-sm font-medium">{name}</span>}
                        </button>
                    ))}
                </nav>
            </div>
            {/* Botón de Salir */}
            <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-700 text-sm font-medium"
            >
                <LogOut size={20} />
                {!isMinimized && <span>Salir</span>}
            </button>
        </aside>
    );
};

export default Sidebar;