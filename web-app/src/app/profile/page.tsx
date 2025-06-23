'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/auth';
import {
  getUserProfile,
  updateProfile,
  UserProfile,
} from '../../lib/user';
import {
  getPartnerId,
  deletePairing,
  clearPairCode,
} from '../../lib/pair';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!auth.currentUser) return;
      const data = await getUserProfile(auth.currentUser.uid);
      setProfile(data);
      if (data?.pair) {
        const partnerId = await getPartnerId(data.pair, auth.currentUser.uid);
        if (partnerId) {
          const p = await getUserProfile(partnerId);
          setPartnerName(p?.username || null);
        }
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const value =
      e.target.name === 'age'
        ? e.target.value === ''
          ? undefined
          : Number(e.target.value)
        : e.target.value;
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
    <div className="card flex flex-col gap-4">
      <input className="input" name="username" value={profile.username ?? ''} onChange={handleChange} placeholder="Username" />
      <input className="input" name="firstName" value={profile.firstName ?? ''} onChange={handleChange} placeholder="First name" />
      <input className="input" name="lastName" value={profile.lastName ?? ''} onChange={handleChange} placeholder="Last name" />
      <input className="input" name="age" type="number" value={profile.age ?? ''} onChange={handleChange} placeholder="Age" />
      {profile.pair && (
        <div className="text-sm flex items-center gap-2">
          <span>Paired with {partnerName || '...'}</span>
          <button
            className="underline ml-auto"
            onClick={async () => {
              if (!auth.currentUser || !profile.pair) return;
              await deletePairing(profile.pair);
              clearPairCode();
              setProfile({ ...profile, pair: undefined });
              setPartnerName(null);
            }}
          >
            Unpair
          </button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={handleSave}>Save</button>
    </div>
  );
}
