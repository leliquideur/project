import { create } from 'zustand';
import supabase from '../../lib/supabaseClient';
import type { Profile, UserRole } from '../../types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => {
    console.log('Utilisateur mis à jour:', user); // Ajoutez ce log
    set({ user });
  },
  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ loading: false });
      throw error;
    }
    if (data.user) {
      const { id, email, role } = data.user;
      if (!role) throw new Error('User role is undefined');
      const userProfile: Profile = {
        id,
        email: email as string,
        role: role as UserRole,
        full_name: null,
        created_at: '',
        updated_at: ''
      };
      console.log('Profil utilisateur:', userProfile); // Ajoutez ce log
      set({ user: userProfile, loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ loading: false });
      throw error;
    }
    set({ user: null, loading: false });
  },
}));