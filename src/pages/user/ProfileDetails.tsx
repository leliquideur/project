import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfileById, updateProfile } from '../../api/profiles';
import supabase from '../../lib/supabaseClient';

export function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    async function fetchCurrentUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      } else {
        const user = data.user;
        if (user) {
          // Récupérer le profil de l'utilisateur actuel pour obtenir le rôle
          const userProfile = await getProfileById(user.id);
          if (userProfile) {
            setCurrentUser({ ...user, role: userProfile.role });
            console.log('Utilisateur actuel avec rôle:', { ...user, role: userProfile.role });
          } else {
            setCurrentUser(user);
            console.log('Utilisateur actuel sans rôle supplémentaire:', user);
          }
        }
      }
    }

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (id) {
          const data = await getProfileById(id);
          console.log('Fetched profile:', data);
          setProfile(data);
          setFormData(data);
        } else {
          setError('ID de profil non fourni');
        }
      } catch (err) {
        setError('Impossible de charger le profil');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (currentUser && profile) {
      const isAdmin = currentUser.role === 'admin';
      const isOwnProfile = currentUser.id === profile.id;
      setCanEdit(isAdmin || isOwnProfile);
      console.log(`canEdit: ${isAdmin} (admin) || ${isOwnProfile} (own profile) => ${isAdmin || isOwnProfile}`);
    }
  }, [currentUser, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData); // Log les données du formulaire
    try {
      if (id) {
        const updatedProfile = await updateProfile(id, formData);
        console.log('Updated profile:', updatedProfile); // Log le profil mis à jour
        if (updatedProfile) {
          setProfile(updatedProfile); // Définir directement le profil mis à jour
          setIsEditing(false);
          alert('Profil mis à jour avec succès');
        } else {
          alert('Erreur lors de la mise à jour du profil');
        }
      } else {
        alert('ID de profil non fourni');
      }
    } catch (err) {
      console.error('Error updating profile:', err); // Log l'erreur
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Profil non trouvé</div>; // Gérer le cas où le profil est null

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profil de {profile.full_name || profile.email}</h1>
      {canEdit && (
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mb-4 p-2 bg-blue-500 text-white rounded"
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </button>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Informations de base</h2>
          <label className="block mb-2">
            <strong>Email :</strong>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              disabled={!isEditing}
            />
          </label>
          <label className="block mb-2">
            <strong>Nom complet :</strong>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              disabled={!isEditing}
            />
          </label>
          <label className="block mb-2">
            <strong>Rôle :</strong>
            <input
              type="text"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              disabled={!isEditing}
            />
          </label>
        </div>
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">Dates importantes</h2>
          <p><strong>Date de création :</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          <p><strong>Dernière mise à jour :</strong> {new Date(profile.updated_at).toLocaleDateString()}</p>
        </div>
        {isEditing && (
          <div className="col-span-1 md:col-span-2">
            <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
              Enregistrer les modifications
            </button>
          </div>
        )}
      </form>
    </div>
  );
}