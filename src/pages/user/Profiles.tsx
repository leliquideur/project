import React, { useEffect, useState } from 'react';
import { getProfiles } from '../../api/profiles';

export function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfiles() {
      const data = await getProfiles();
      if (data.length > 0) {
        setProfiles(data);
      } else {
        setError('Failed to fetch profiles');
      }
      setLoading(false);
    }

    fetchProfiles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Profiles</h1>
      <ul>
        {profiles.map(profile => (
          <li key={profile.id}>
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            {/* Affichez d'autres informations de profil ici */}
          </li>
        ))}
      </ul>
    </div>
  );
}