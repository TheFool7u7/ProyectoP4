import { useLocation, Link, useNavigate } from 'react-router-dom';
import reactLogo from '../assets/react.svg';
import { useAuth } from "./context/AuthContext";
import {
  LayoutGrid, BookOpen, Users, GraduationCap, LogOut, Menu, UserPlus,
  Lightbulb, Star, ClipboardList, UserCircle
} from "lucide-react";

const Sidebar = ({ isMinimized, toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const handleLogout = async () => {
    await signOut();
  };

  // Se definen los enlaces para cada rol
  const graduateLinks = [
    { name: "Inicio", path: "/home", icon: LayoutGrid },
    { name: "Mi Perfil", path: "/mi-perfil", icon: UserCircle },
    { name: "Catálogo de Talleres", path: "/catalogo-talleres", icon: ClipboardList },
    { name: "Mis Preferencias", path: "/mis-preferencias", icon: Star },
  ];

  const adminLinks = [
    { name: "Ver Graduados", path: "/graduados", icon: Users },
    { name: "Registrar Graduado", path: "/graduados/registro", icon: UserPlus },
    { name: "Áreas de Interés", path: "/areas-interes", icon: Lightbulb },
    { name: "Gestionar Talleres", path: "/talleres", icon: BookOpen },
  ];

  // Se construye el menú final basado en el rol del usuario
  let menuItems = graduateLinks; // Por defecto,se muesntran los enlaces de graduado
  if (user?.rol === 'administrador') {
    menuItems = [...graduateLinks, ...adminLinks]; // Si es admin, se muestra todo
  }

  return (
    <aside
      className={`fixed md:static z-20 h-screen flex flex-col justify-between ${isMinimized ? "w-20" : "w-64"
        } bg-white border-r shadow-sm p-4 transition-all duration-300`}
    >
      <div className="w-full">
        {/* ... (logo) ... */}
        <nav className="space-y-2 mt-8">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
            // ... (estilos del botón)
            >
              <Icon size={20} />
              {!isMinimized && <span>{name}</span>}
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