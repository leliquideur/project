import supabase from '../lib/supabaseClient';

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }

  return data;
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching profile with id ${id}:`, error);
    return null;
  }

  return data;
}

export async function updateProfile(id: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('*') // Spécifiez les colonnes à sélectionner
    .single();  // Obtenez un objet unique

  if (error) {
    console.error(`Error updating profile with id ${id}:`, error);
    throw error;
  }

  return data; // Renvoie un objet unique au lieu d'un tableau
}