import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://tqkuwuaejndsaxlcmvfx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxa3V3dWFlam5kc2F4bGNtdmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3NzcxMTksImV4cCI6MjA1MDM1MzExOX0.FsXaU08KgIjlQ_HAUL-mt3AlSJspy1GKcto8XNE0GeY";

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