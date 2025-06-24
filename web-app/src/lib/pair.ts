import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth } from './auth';
import { db } from './firebase';
import { getUserByPairCode, updatePair } from './user';

export interface PairRequest {
  requester: string;
  target: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: ReturnType<typeof serverTimestamp> | null;
}

export interface Pairing {
  users: string[];
}

const pairings = collection(db, 'pairings');
const requests = collection(db, 'pairRequests');
const notifications = collection(db, 'notifications');

export async function sendPairRequest(code: string) {
  const requester = auth.currentUser?.uid;
  if (!requester) throw new Error('Not authenticated');
  const targetUser = await getUserByPairCode(code);
  if (!targetUser) throw new Error('User not found');
  await addDoc(requests, { requester, target: targetUser.id, status: 'pending', createdAt: serverTimestamp() });
  await addDoc(notifications, { userId: targetUser.id, type: 'pairRequest', from: requester, createdAt: serverTimestamp(), read: false });
}

export async function acceptPairRequest(requestId: string, requester: string) {
  const user = auth.currentUser?.uid;
  if (!user) return;
  const id = [user, requester].sort().join('_');
  await setDoc(doc(pairings, id), { users: [user, requester] } as Pairing);
  await updatePair(user, id);
  await updatePair(requester, id);
  setPairCode(id);
  await addDoc(notifications, { userId: requester, type: 'pairAccepted', from: user, createdAt: serverTimestamp(), read: false });
  await deleteDoc(doc(requests, requestId));
}

export async function declinePairRequest(requestId: string, requester: string) {
  const user = auth.currentUser?.uid;
  if (!user) return;
  await addDoc(notifications, { userId: requester, type: 'pairDeclined', from: user, createdAt: serverTimestamp(), read: false });
  await deleteDoc(doc(requests, requestId));
}

export function subscribeToRequests(userId: string, callback: (req: (PairRequest & {id:string})[]) => void) {
  const q = query(requests, where('target', '==', userId));
  return onSnapshot(q, snap => {
    const out: (PairRequest & {id:string})[] = [];
    snap.forEach(d => out.push({ id: d.id, ...(d.data() as PairRequest) }));
    callback(out);
  });
}

export async function getPartnerId(pairId: string, userId: string) {
  const snap = await getDoc(doc(pairings, pairId));
  if (!snap.exists()) return null;
  const data = snap.data() as Pairing;
  const other = data.users.find(u => u !== userId);
  return other || null;
}

const pairKey = 'pairId';
export function setPairCode(id: string) {
  if (typeof window !== 'undefined') localStorage.setItem(pairKey, id);
}
export function clearPairCode() {
  if (typeof window !== 'undefined') localStorage.removeItem(pairKey);
}
export function getPairCode(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem(pairKey) : null;
}
