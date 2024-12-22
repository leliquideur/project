import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfiles } from '../../api/profiles';

export function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch (err) {
        setError('Failed to fetch profiles');
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, []);

  const filteredProfiles = roleFilter === 'all'
    ? profiles
    : profiles.filter(profile => profile.role === roleFilter);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Profiles</h1>
      <div className="mb-4">
        <label htmlFor="roleFilter" className="mr-2">Filter by role:</label>
        <select
          id="roleFilter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="admin">Admin</option>
          <option value="technician">Technician</option>
          <option value="client">Client</option>
        </select>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map(profile => (
          <li key={profile.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <p>{profile.email}</p>
            <p className="text-sm text-gray-600">{profile.role}</p>
            <Link to={`/profiles/${profile.id}`} className="text-blue-500 hover:underline">
              Voir le profil
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}