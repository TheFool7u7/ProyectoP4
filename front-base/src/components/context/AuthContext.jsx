import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("perfil"))
  );
  const [password, setPassword] = useState(null);
  const [pageSize, setPageSize] = useState(() => localStorage.getItem("pageSize"));
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  const login = (perfil, jwt,  pageSize, rawPassword = null) => {
    localStorage.setItem("access_token", jwt);
    localStorage.setItem("perfil", JSON.stringify(perfil));
    console.log(jwt)
    setUser(perfil);
    setToken(jwt);
  
    setPassword(rawPassword); // solo en memoria
  };
  
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    setColegio(null);
    setPassword(null); // limpiar también
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, password, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
