import { useLocation, Link, useNavigate } from 'react-router-dom';
import reactLogo from '../assets/react.svg'
import {
  LayoutGrid,
  BookOpen,
  Users,
  GraduationCap,
  LogOut,
  Menu
} from "lucide-react";
import { useEffect, useRef } from "react";

const Sidebar = ({ isMinimized, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const previousWidth = useRef(window.innerWidth);

  const menuItems = [
    { name: "Inicio", path: "/home", icon: LayoutGrid },
    { name: "Grupos", path: "/groups", icon: BookOpen },
    { name: "Estudiantes", path: "/students", icon: Users },
    { name: "Profesores", path: "/teachers", icon: GraduationCap },
    { name: "Salir", path: "/logout", icon: LogOut },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      const wasMinimized = isMinimized;
      if (currentWidth < 768 && !wasMinimized) {
        toggleSidebar();
      } else if (currentWidth >= 768 && wasMinimized) {
        toggleSidebar();
      }
      previousWidth.current = currentWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMinimized, toggleSidebar]);

  return (
    <aside
      className={`fixed md:static z-20 h-screen flex flex-col items-center justify-between ${
        isMinimized ? "w-20" : "w-64"
      } bg-white border-r shadow-sm p-4 transition-all duration-300`}
    >
      <div className="w-full">
        <Link to="/" className="text-2xl font-bold flex justify-center mb-6">
          <img
            src={reactLogo}
            height={isMinimized ? 40 : 100}
            width={isMinimized ? 40 : 100}
            alt="Logo"
          />
        </Link>
        <nav className="space-y-2">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => handleLinkClick(path)}
              className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith(path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
            >
              <Icon size={20} />
              {!isMinimized && <span>{name}</span>}
            </button>
          ))}
        </nav>
      </div>
      <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
        <Menu size={24} />
      </button>
    </aside>
  );
};

export default Sidebar;
