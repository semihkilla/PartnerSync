import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  username: string;
  email: string;
  pairCode: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  anniversary?: string;
  gender?: string;
  photoURL?: string;
  pair?: string;
  lastActive?: Timestamp;
}

const users = collection(db, 'users');

function removeUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
  ) as T;
}

export async function createUserProfile(uid: string, profile: UserProfile) {
  await setDoc(doc(users, uid), removeUndefined(profile));
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(users, uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function watchUserProfile(
  uid: string,
  cb: (profile: UserProfile | null) => void,
) {
  return onSnapshot(doc(users, uid), (s) =>
    cb(s.exists() ? (s.data() as UserProfile) : null),
  );
}

export async function updatePresence(uid: string) {
  await setDoc(
    doc(users, uid),
    { lastActive: serverTimestamp() },
    { merge: true },
  );
}

export async function updateProfile(uid: string, data: Partial<UserProfile>) {
  await updateDoc(doc(users, uid), removeUndefined(data));
}

export async function updatePair(uid: string, pair: string | null) {
  await updateDoc(doc(users, uid), { pair: pair ?? null });
}

export async function getUserByUsername(username: string) {
  const q = query(users, where('username', '==', username));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...(snap.docs[0].data() as UserProfile) };
}

export async function getUserByPairCode(code: string) {
  const q = query(users, where('pairCode', '==', code));
  const snap = await getDocs(q);
  return snap.empty ? null : { id: snap.docs[0].id, ...(snap.docs[0].data() as UserProfile) };
}

export async function isUsernameAvailable(username: string) {
  if (!username) return false;
  const snap = await getDocs(query(users, where('username', '==', username)));
  return snap.empty;
}

// Username-check für Profilbearbeitung (eigener Username wird akzeptiert)
export async function isUsernameAvailableExceptSelf(
  username: string,
  uid:      string,
) {
  if (!username) return false;
  const snap = await getDocs(
    query(users, where("username", "==", username)),
  );
  return snap.empty || snap.docs[0].id === uid;
}

export async function isEmailRegistered(email: string) {
  if (!email) return false;
  const snap = await getDocs(query(users, where('email', '==', email)));
  return !snap.empty;
}
