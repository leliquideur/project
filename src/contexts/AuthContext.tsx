import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import supabase from "../lib/supabaseClient";
import { getProfileById } from "../api/profiles";

interface User {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
  // Ajoutez d'autres champs si nécessaire
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Erreur lors de la récupération de l'utilisateur :", error);
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
              full_name: userProfile.full_name,
            });
          } else {
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email!,
            });
          }
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        setError("Erreur inattendue");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        fetchUser();
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // La récupération de l'utilisateur sera gérée par l'écouteur d'état
    } catch (err: any) {
      console.error("Erreur lors de la connexion :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      console.error("Erreur lors de la déconnexion :", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
