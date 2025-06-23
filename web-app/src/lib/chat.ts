import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './auth';
import { getPairCode } from './pair';
import { getUserProfile } from './user';

export interface Message {
  id?: string;
  text: string;
  sender: string;
  senderName?: string;
  createdAt: Timestamp;
}

export async function sendMessage(text: string) {
  const pair = getPairCode();
  if (!pair) return;
  const ref = collection(db, 'pairings', pair, 'messages');
  const sender = auth.currentUser?.uid || 'anonymous';
  const profile = auth.currentUser ? await getUserProfile(auth.currentUser.uid) : null;
  return addDoc(ref, {
    text,
    sender,
    senderName: profile?.username || 'anonymous',
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(callback: (messages: Message[]) => void) {
  const pair = getPairCode();
  if (!pair) return () => {};
  const ref = collection(db, 'pairings', pair, 'messages');
  const q = query(ref, orderBy('createdAt'));
  return onSnapshot(q, (snap) => {
    const msgs: Message[] = [];
    snap.forEach((d) => msgs.push({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }));
    callback(msgs);
  });
}
