import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../lib/supabaseClient";
import { getProfileById } from "../api/profiles";

interface User {
  id: string;
  email: string;
  role?: string;
  // Ajoutez d'autres champs si nécessaire
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error(
            "Erreur lors de la récupération de l'utilisateur:",
            error
          );
          setError("Erreur de récupération de l'utilisateur");
          setLoading(false);
          return;
        }

        const supabaseUser = data.user;
        if (supabaseUser) {
          const userProfile = await getProfileById(supabaseUser.id);
          if (userProfile) {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email!,
              role: userProfile.role,
            });
          } else {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email!,
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur:", err);
        setError("Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Optionnel : Gérer les changements d'état d'authentification en temps réel
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        fetchUser();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
