import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getProfileById, updateProfile } from '../../api/profilesService';
import { Profile } from "../../types/index";


export function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, error: authError, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
              role: fetchedProfile.role || '',
            });
          } else {
            setError('Profil non trouvé');
          }
        } catch (err: any) {
          setError("Impossible de charger le profil");
          console.error("Error fetching profile:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (user && profile) {
      const isAdmin = user.role === "admin";
      const isOwnProfile = user.id === profile.id;
      setCanEdit(isAdmin || isOwnProfile);
      console.log(
        `canEdit: ${isAdmin} (admin) || ${isOwnProfile} (own profile) => ${
          isAdmin || isOwnProfile
        }`
      );
    }
  }, [user, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      <h1 className="text-2xl font-bold mb-4">
        Profil de {profile.full_name || profile.email}
      </h1>
      {canEdit && (
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      )}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nom Complet</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          {user?.role === 'admin' && (
            <div className="mb-4">
              <label className="block text-gray-700">Rôle</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Enregistrer
          </button>
        </form>
      ) : (
        <div>
          <p><strong>Nom Complet:</strong> {profile.full_name || 'Non renseigné'}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Rôle:</strong> {profile.role || 'Utilisateur'}</p>
        </div>
      )}
    </div>
  );
}
