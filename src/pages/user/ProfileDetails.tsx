import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getProfileById, updateProfile } from '../../api/profilesService';
import { Profile, UserRole, FormDataProfile } from "../../types/index";



export function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, error: authError, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataProfile>({
    full_name: '',
    role: UserRole.Client, // Valeur par défaut
  });
  const [, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        try {
          setLoading(true);
          const fetchedProfile = await getProfileById(id);
          if (fetchedProfile) {
            setProfile(fetchedProfile);
            setFormData({
              full_name: fetchedProfile.full_name || '',
              role: fetchedProfile.role || UserRole.Client,
            });
            setLoading(false);
          }
        } catch (error) {
          setError('Erreur lors de la récupération du profil');
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (user && profile) {
      const isAdmin = user.role === UserRole.Admin;
      const isOwnProfile = user.id === profile.id;
      setCanEdit(isAdmin || isOwnProfile);
      console.log(
        `canEdit: ${isAdmin} (admin) || ${isOwnProfile} (own profile) => ${
          isAdmin || isOwnProfile
        }`
      );
    }
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value as UserRole });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData); // Log les données du formulaire
    try {
      if (id) {
        const updatedProfile = await updateProfile(id, formData as Partial<Profile>);
        console.log("Updated profile:", updatedProfile); // Log le profil mis à jour
        if (updatedProfile) {
          setProfile(updatedProfile); // Définir directement le profil mis à jour
          setIsEditing(false);
          alert("Profil mis à jour avec succès");
          await refreshUser(); // Rafraîchir le contexte d'authentification
        } else {
          alert("Erreur lors de la mise à jour du profil");
        }
      } else {
        alert("ID de profil non fourni");
      }
    } catch (err) {
      console.error("Error updating profile:", err); // Log l'erreur
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  if (authLoading || loading) return <div>Chargement...</div>;
  if (authError) return <div>{authError}</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Profil non trouvé</div>; // Gérer le cas où le profil est null

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Détails du Profil</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="full_name" className="block text-gray-700">Nom complet</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            disabled={!canEdit}
            className="mt-1 p-2 border w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700">Rôle</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={!canEdit}
            className="mt-1 p-2 border w-full"
          >
            <option value={UserRole.Client}>Client</option>
            <option value={UserRole.Admin}>Administrateur</option>
          </select>
        </div>
        {canEdit && (
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Mettre à jour
          </button>
        )}
      </form>
    </div>
  );
}
