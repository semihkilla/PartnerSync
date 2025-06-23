import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { updatePair } from './user';

export interface Pairing {
  code: string;
  creator: string;
  partner?: string;
}

const pairings = collection(db, 'pairings');

export async function createPairing(code: string, userId: string) {
  await setDoc(doc(pairings, code), { code, creator: userId } as Pairing);
  await updatePair(userId, code);
}

export async function joinPairing(code: string, userId: string) {
  const ref = doc(pairings, code);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as Pairing;
    if (data.partner) return;
    await setDoc(ref, { ...data, partner: userId });
    await updatePair(userId, code);
  }
}

export async function getPairForUser(userId: string) {
  const q = query(pairings, where('creator', '==', userId));
  let snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;
  const q2 = query(pairings, where('partner', '==', userId));
  snap = await getDocs(q2);
  if (!snap.empty) return snap.docs[0].id;
  return null;
}

export async function getPartnerId(code: string, userId: string) {
  const snap = await getDoc(doc(pairings, code));
  if (!snap.exists()) return null;
  const data = snap.data() as Pairing;
  if (data.creator === userId) return data.partner || null;
  if (data.partner === userId) return data.creator;
  return null;
}

const pairCodeKey = 'pairCode';

export function setPairCode(code: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(pairCodeKey, code);
  }
}

export function getPairCode(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(pairCodeKey) : null;
}
