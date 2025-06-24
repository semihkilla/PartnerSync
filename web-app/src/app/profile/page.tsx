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
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const calcAge = (date?: string) => {
    if (!date) return null;
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / 31557600000); // year in ms
  };

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
    setProfile({ ...profile, [e.target.name]: e.target.value });
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

  const handleDelete = async () => {
    if (!auth.currentUser || !confirm('Delete account?')) return;
    const uid = auth.currentUser.uid;
    if (profile?.pair) await deletePairing(profile.pair);
    await deleteDoc(doc(db, 'users', uid));
    await deleteUser(auth.currentUser);
    clearPairCode();
    alert('Konto erfolgreich gelöscht');
    window.location.href = '/';
  };

  if (!profile) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="card flex flex-col gap-4">
      <input className="input" name="username" value={profile.username ?? ''} onChange={handleChange} placeholder="Username" />
      <input className="input" name="firstName" value={profile.firstName ?? ''} onChange={handleChange} placeholder="First name" />
      <input className="input" name="lastName" value={profile.lastName ?? ''} onChange={handleChange} placeholder="Last name" />
      <input className="input" name="birthday" type="date" value={profile.birthday ?? ''} onChange={handleChange} placeholder="Birthday" />
      {profile.birthday && (
        <span className="text-sm">Age: {calcAge(profile.birthday)}</span>
      )}
      <div className="flex items-center gap-2 text-sm">
        <span>Your Code: {profile.pairCode}</span>
        <button
          className="underline"
          onClick={() => {
            navigator.clipboard.writeText(profile.pairCode);
            alert('Code kopiert!');
          }}
        >
          Copy
        </button>
      </div>
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
      <button className="btn bg-red-600 hover:bg-red-700 mt-2" onClick={handleDelete}>Delete Account</button>
    </div>
  );
}
