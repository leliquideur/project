import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import supabase from "../../../lib/supabaseClient";
import { getProfileById } from "../../../api/profiles";
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  role?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur lors de la récupération de la session :", error);
        setError("Erreur de récupération de la session");
        setLoading(false);
        return;
      }

      if (session?.user) {
        const userProfile = await getProfileById(session.user.id);
        if (userProfile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            role: userProfile.role,
            full_name: userProfile.full_name,
          });
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email!,
          });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'utilisateur :", err);
      setError("Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          fetchUser();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // La session sera gérée par l'écouteur d'état
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

export function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Utilisateur non authentifié.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            title,
            description,
            priority,
            user_id: user.id,
            status: 'open',
            created_at: new Date(),
          },
        ]);

      if (error) {
        throw error;
      }

      navigate('/tickets');
    } catch (err: any) {
      console.error('Erreur lors de la création du ticket:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Créer un Ticket</h2>

        {error && (
          <div className="mb-4 text-red-500">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="Titre du ticket"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="Description détaillée"
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Priorité</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded ${
            loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold`}
        >
          {loading ? 'Création...' : 'Créer le Ticket'}
        </button>
      </form>
    </div>
  );
}