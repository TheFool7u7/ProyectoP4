import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mientras el contexto está verificando el estado de la sesión, no muestra nada o un "Cargando..."
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  // Cuando ya no está cargando, si el usuario NO está autenticado, lo redirige.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, muestra la página solicitada (el Layout con todo adentro).
  return children;
};

export default PrivateRoute;s