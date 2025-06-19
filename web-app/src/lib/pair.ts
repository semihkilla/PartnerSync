import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Pairing {
  code: string;
  creator: string;
  partner?: string;
}

const pairings = collection(db, 'pairings');

export async function createPairing(code: string, userId: string) {
  await setDoc(doc(pairings, code), { code, creator: userId } as Pairing);
}

export async function joinPairing(code: string, userId: string) {
  const ref = doc(pairings, code);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await setDoc(ref, { ...(snap.data() as Pairing), partner: userId });
  }
}
