import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('Erreur de connexion à Supabase:', error.message);
    } else {
      console.log('Connexion à Supabase réussie:', data);
      const user = data.session?.user;
      if (user) {
        console.log('Utilisateur connecté:', user);
      } else {
        console.log('Aucun utilisateur connecté.');
      }
    }
  });

export default supabase;