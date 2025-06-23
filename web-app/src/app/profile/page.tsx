'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/auth';
import { getUserProfile, updateProfile, UserProfile } from '../../lib/user';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!auth.currentUser) return;
      const data = await getUserProfile(auth.currentUser.uid);
      setProfile(data);
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const value =
      e.target.name === 'age' ? Number(e.target.value) : e.target.value;
    setProfile({ ...profile, [e.target.name]: value });
  };

  const handleSave = async () => {
    setError('');
    try {
      if (auth.currentUser && profile) {
        await updateProfile(auth.currentUser.uid, profile);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to save');
    }
  };

  if (!profile) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow mt-8 flex flex-col gap-3">
      <input className="input" name="username" value={profile.username} onChange={handleChange} placeholder="Username" />
      <input className="input" name="firstName" value={profile.firstName ?? ''} onChange={handleChange} placeholder="First name" />
      <input className="input" name="lastName" value={profile.lastName ?? ''} onChange={handleChange} placeholder="Last name" />
      <input className="input" name="age" type="number" value={profile.age ?? ''} onChange={handleChange} placeholder="Age" />
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={handleSave}>Save</button>
    </div>
  );
}
