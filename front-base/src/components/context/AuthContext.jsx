import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange se encarga de todo: carga inicial, login, logout.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Esta función se llamará cuando el estado de auth cambie.
        if (session?.user) {
          const { data: profile } = await supabase
            .from('perfiles')
            .select('id, nombre_completo, rol')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            const { data: graduadoData } = await supabase
              .from('graduados')
              .select('id')
              .eq('perfil_id', profile.id)
              .single();
            setUser({ ...profile, graduado_id: graduadoData?.id });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Se limpia el listener cuando el componente se desmonte.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    signUp: (data) => supabase.auth.signUp(data),
    user,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);