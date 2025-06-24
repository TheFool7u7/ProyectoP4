import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función reutilizable para buscar el perfil completo de un usuario
  const getFullUserProfile = async (sessionUser) => {
    try {
      const { data: profile } = await supabase
        .from('perfiles')
        .select('id, nombre_completo, rol')
        .eq('id', sessionUser.id)
        .single();

      if (!profile) {
        throw new Error("No se encontró un perfil para este usuario.");
      }

      const { data: graduadoData } = await supabase
        .from('graduados')
        .select('id')
        .eq('perfil_id', profile.id)
        .single();
      
      // Retorna el objeto de usuario combinado y completo
      return { ...sessionUser, ...profile, graduado_id: graduadoData?.id };

    } catch (error) {
      console.error("Error al buscar el perfil completo:", error);
      // Si falla, se retorna null para que el usuario no quede en un estado inconsistente
      return null;
    }
  };

  useEffect(() => {
    // Al cargar la app, se verifica si ya existe una sesión en el localStorage.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const fullUser = await getFullUserProfile(session.user);
        setUser(fullUser);
      }
      setLoading(false);
    });

    // El listener ahora solo se preocupa por el evento de SIGNED_OUT.
    // El SIGNED_IN se maneja de forma explícita en la función `signIn`.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // se crea el objeto `value` para el Provider
  const value = {
    signIn: async (credentials) => {
      // 1. Intenta autenticar al usuario
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) return { user: null, error }; // Si falla, devuelve el error

      // 2. Si tiene éxito, busca el perfil completo ANTES de terminar
      if (data.session) {
        const fullUser = await getFullUserProfile(data.session.user);
        setUser(fullUser); // Actualiza el estado global
        return { user: fullUser, error: null }; // Devuelve el usuario completo
      }
      
      return { user: null, error: new Error("No se pudo obtener la sesión.") };
    },
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