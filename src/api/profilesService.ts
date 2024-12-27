import supabase from './supabaseClient';
import { Profile } from '../types';

/**
 * Vérifie si un profil appartient au personnel (technicien ou administrateur).
 * @param profile - Le profil à vérifier.
 * @returns True si le profil est un technicien ou un administrateur, sinon false.
 */
export function isStaff(profile: Profile | null): boolean {
  return profile?.role === 'technician' || profile?.role === 'admin';
}

/**
 * Récupère tous les profils.
 * @returns Une promesse contenant un tableau de profils.
 */
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*');

  if (error) {
    console.error('Erreur lors de la récupération des profils :', error);
    throw error;
  }

  return data as Profile[];
}

/**
 * Récupère un profil par son ID.
 * @param id - L'ID du profil à récupérer.
 * @returns Une promesse contenant le profil ou null si non trouvé.
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();

  if (error) {
    console.error(`Erreur lors de la récupération du profil avec l'ID ${id} :`, error);
    throw error;
  }

  return data as Profile;
}

/**
 * Met à jour les informations d'un profil.
 * @param id - L'ID du profil à mettre à jour.
 * @param updates - Les champs à mettre à jour.
 * @returns Une promesse contenant le profil mis à jour.
 */
export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error(`Erreur lors de la mise à jour du profil avec l'ID ${id} :`, error);
    throw error;
  }

  return data as Profile;
}

/**
 * Supprime un profil par son ID.
 * @param id - L'ID du profil à supprimer.
 * @returns Une promesse contenant les données de suppression.
 */
export async function deleteProfile(id: string): Promise<{ id: string }> {
  const { data, error } = await supabase.from('profiles').delete().eq('id', id).select('id').single();

  if (error) {
    console.error(`Erreur lors de la suppression du profil avec l'ID ${id} :`, error);
    throw error;
  }

  return data as { id: string };
}

/**
 * Récupère le profil courant de l'utilisateur authentifié.
 * @returns Une promesse contenant le profil ou null si non authentifié.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Utilisateur non authentifié :', error);
    throw new Error('Utilisateur non authentifié');
  }

  try {
    const profile = await getProfileById(user.id);
    if (!profile) {
      throw new Error('Profil non trouvé');
    }
    return profile;
  } catch (err: any) {
    console.error('Erreur lors de la récupération du profil :', err);
    throw err;
  }
}