import supabase from './supabaseClient';
import { Profile } from '../types';

const PROFILES_TABLE = 'profiles';

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
  const { data, error } = await supabase.from(PROFILES_TABLE).select('*');

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
  const { data, error } = await supabase.from(PROFILES_TABLE).select('*').eq('id', id).single();

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
  console.log(`Mise à jour du profil avec l'ID ${id} avec les données :`, updates); // Log des données envoyées
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
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
  const { data, error } = await supabase.from(PROFILES_TABLE).delete().eq('id', id).select('id').single();

  if (error) {
    console.error(`Erreur lors de la suppression du profil avec l'ID ${id} :`, error);
    throw error;
  }

  return data as { id: string };
}

/**
 * Récupère le full_name d'un profil par son ID.
 * @param id - L'ID du profil à récupérer.
 * @returns Une promesse contenant le full_name ou null si non trouvé.
 */
export async function getFullNameById(id: string): Promise<string | null> {
  const { data, error } = await supabase.from(PROFILES_TABLE).select('full_name').eq('id', id).single();

  if (error) {
    console.error(`Erreur lors de la récupération du full_name avec l'ID ${id} :`, error);
    throw error;
  }

  return data?.full_name || null;
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

/**
 * Récupère un profil par son ID et gère les états de chargement et d'erreur.
 * @param id - L'ID du profil à récupérer.
 * @param setLoading - Fonction pour définir l'état de chargement.
 * @param setProfile - Fonction pour définir le profil récupéré.
 * @param setError - Fonction pour définir l'état d'erreur.
 */
export async function fetchProfile(
  id: string,
  setLoading: (loading: boolean) => void,
  setProfile: (profile: Profile | null) => void,
  setError: (error: string | null) => void
) {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setError('Profil non trouvé');
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  } catch (err: any) {
    setError("Impossible de charger le profil");
    console.error("Error fetching profile:", err);
  } finally {
    setLoading(false);
  }
}

/**
 * Met à jour un profil et rafraîchit le contexte d'authentification.
 * @param id - L'ID du profil à mettre à jour.
 * @param formData - Les données du formulaire à mettre à jour.
 * @param setProfile - Fonction pour définir le profil mis à jour.
 * @param setIsEditing - Fonction pour définir l'état d'édition.
 * @param refreshUser - Fonction pour rafraîchir le contexte d'authentification.
 * @param setMessage - Fonction pour définir le message de succès.
 * @param setError - Fonction pour définir l'état d'erreur.
 */
export async function updateProfileAndRefresh(
  id: string,
  formData: Partial<Profile>,
  setProfile: (profile: Profile) => void,
  setIsEditing: (isEditing: boolean) => void,
  refreshUser: () => Promise<void>,
  setMessage: (message: string | null) => void,
  setError: (error: string | null) => void
) {
  try {
    const updatedProfile = await updateProfile(id, formData);
    if (updatedProfile) {
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage("Profil mis à jour avec succès");
      await refreshUser();
    } else {
      setError("Erreur lors de la mise à jour du profil");
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    setError("Erreur lors de la mise à jour du profil");
  }
}

/**
 * Gère la soumission du formulaire de profil.
 * @param id - L'ID du profil à mettre à jour.
 * @param formData - Les données du formulaire à mettre à jour.
 * @param setProfile - Fonction pour définir le profil mis à jour.
 * @param setIsEditing - Fonction pour définir l'état d'édition.
 * @param refreshUser - Fonction pour rafraîchir le contexte d'authentification.
 * @param setMessage - Fonction pour définir le message de succès.
 * @param setError - Fonction pour définir l'état d'erreur.
 */
export async function handleProfileSubmit(
  id: string,
  formData: Partial<Profile>,
  setProfile: (profile: Profile) => void,
  setIsEditing: (isEditing: boolean) => void,
  refreshUser: () => Promise<void>,
  setMessage: (message: string | null) => void,
  setError: (error: string | null) => void
) {
  try {
    await updateProfileAndRefresh(id, formData, setProfile, setIsEditing, refreshUser, setMessage, setError);
  } catch (err) {
    console.error("Error updating profile:", err);
    setError("Erreur lors de la mise à jour du profil : " + (err as any).message);
  }
}