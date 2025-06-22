import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("perfil"))
  );
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  // La función de login ahora guarda el objeto 'perfil' completo
  const login = (perfil, jwt) => {
    localStorage.setItem("access_token", jwt);
    localStorage.setItem("perfil", JSON.stringify(perfil));
    setUser(perfil);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);