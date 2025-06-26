import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // Mientras carga la información del usuario, no mostramos nada.
    if (loading) {
        return <div className="flex h-screen items-center justify-center">Verificando acceso...</div>;
    }

    // Si el usuario está autenticado Y su rol es 'administrador',
    // le permitimos ver el contenido (en este caso, la página de Reportes).
    if (user && user.rol === 'administrador') {
        return children;
    }

    // Si no es administrador, lo redirigimos a la página de inicio.
    // Podrías también redirigirlo a una página de "Acceso Denegado".
    return <Navigate to="/home" replace />;
};

export default AdminRoute;