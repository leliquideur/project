import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchProfile, handleProfileSubmit } from '../../api/profilesService';
import { Profile } from "../../types/index";

export function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading, error: authError, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // État pour les messages
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchProfile(id, setLoading, (fetchedProfile) => {
        setProfile(fetchedProfile);
        setFormData({
          full_name: fetchedProfile?.full_name || '',
          role: fetchedProfile?.role || 'client',
        });
      }, setError);
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData); // Log les données du formulaire
    if (id) {
      await handleProfileSubmit(id, formData as Partial<Profile>, setProfile, setIsEditing, refreshUser, setMessage, setError);
    } else {
      setError("ID de profil non fourni");
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
      {message && <div className="mb-4 text-green-500">{message}</div>} {/* Afficher le message de succès */}
      {error && <div className="mb-4 text-red-500">{error}</div>} {/* Afficher le message d'erreur */}
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
              Nom complet
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {user?.role !== 'client' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                Rôle
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="client">Client</option>
                <option value="technician">Technicien</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Enregistrer
          </button>
        </form>
      ) : (
        <div>
          <p><strong>Nom complet:</strong> {profile.full_name}</p>
          <p><strong>Rôle:</strong> {profile.role}</p>
        </div>
      )}
    </div>
  );
}
