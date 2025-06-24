import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  username: string;
  email: string;
  /** permanent pairing code shown to other users */
  pairCode: string;
  firstName?: string;
  lastName?: string;
  /** birthday in ISO format YYYY-MM-DD */
  birthday?: string;
  photoURL?: string;
  pair?: string;
  lastActive?: Timestamp;
}

const users = collection(db, 'users');

function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
  ) as T;
}

export async function createUserProfile(id: string, profile: UserProfile) {
  await setDoc(doc(users, id), removeUndefined(profile));
}

export async function getUserByUsername(username: string) {
  const q = query(users, where('username', '==', username));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as UserProfile) };
  return null;
}

export async function getUserByPairCode(code: string) {
  const q = query(users, where('pairCode', '==', code));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...(snap.docs[0].data() as UserProfile) };
  return null;
}

export async function updatePresence(id: string) {
  // ensure the user document exists before updating presence
  await setDoc(
    doc(users, id),
    { lastActive: serverTimestamp() },
    { merge: true },
  );
}

export async function getUserProfile(id: string) {
  const snap = await getDoc(doc(users, id));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updatePair(id: string, pair: string | null) {
  await updateDoc(doc(users, id), { pair: pair ?? null });
}

export async function updateProfile(id: string, data: Partial<UserProfile>) {
  await updateDoc(doc(users, id), removeUndefined(data));
}
