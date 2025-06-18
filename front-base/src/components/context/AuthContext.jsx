import { createContext, useContext, useState, useEffect } from "react"; // Añade useEffect

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado para saber si la carga inicial de auth ha terminado
  const [loading, setLoading] = useState(true); // <--- AÑADIDO: Inicia en true

  const [user, setUser] = useState(null); // Inicia en null, se llenará desde localStorage
  const [token, setToken] = useState(null); // Inicia en null
  const [password, setPassword] = useState(null); // Para la contraseña en memoria
  // const [pageSize, setPageSize] = useState(() => localStorage.getItem("pageSize")); // Puedes mantener esto si lo usas

  // Efecto para cargar el estado desde localStorage al montar
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("perfil");

      if (storedToken) {
        setToken(storedToken);
        // Podrías añadir validación del token aquí si es necesario
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error al cargar datos de autenticación desde localStorage:", error);
      // En caso de error, limpiar para evitar estado corrupto
      localStorage.removeItem("access_token");
      localStorage.removeItem("perfil");
      // setUser(null); // ya están en null
      // setToken(null);
    } finally {
      setLoading(false); // <--- AÑADIDO: Indica que la carga inicial ha terminado
    }
  }, []); // El array vacío [] significa que este efecto se ejecuta solo una vez al montar

  const login = (perfil, jwt, rawPassword = null /*, pageSize*/) => { // Quité pageSize si no lo usas en login directamente
    localStorage.setItem("access_token", jwt);
    localStorage.setItem("perfil", JSON.stringify(perfil));
    // if (pageSize) localStorage.setItem("pageSize", pageSize); // Si necesitas guardar pageSize
    
    console.log("Token JWT guardado:", jwt);
    setUser(perfil);
    setToken(jwt);
    // setPageSize(pageSize); // Si necesitas actualizar el estado
    setPassword(rawPassword); // solo en memoria
    // No necesitas setLoading(false) aquí porque login ocurre después de la carga inicial
  };
  
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("perfil");
    // localStorage.removeItem("pageSize"); // Si guardaste pageSize
    setUser(null);
    setToken(null);
    // setPageSize(null); // Si tenías pageSize en el estado
    setPassword(null); // limpiar también
    // setColegio(null); // Elimina si 'setColegio' no está definido
  };

  const isAuthenticated = !!token;

  // Pasamos 'loading' al contexto para que PrivateRoute lo pueda usar
  return (
    <AuthContext.Provider value={{ user, token, login, password, logout, isAuthenticated, loading }}> {/* <--- AÑADIDO 'loading' */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};