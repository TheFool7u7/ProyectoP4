// front-base/src/components/routes/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  console.log('[PrivateRoute] Loading:', loading, 'IsAuthenticated:', isAuthenticated); // DEBUG

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl"> {/* Asegúrate que sea visible */}
        Verificando autenticación...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;