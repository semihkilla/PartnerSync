import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './auth';
import { getPairCode } from './pair';

export interface Message {
  id?: string;
  text: string;
  sender: string;
  createdAt: Timestamp;
}

export function sendMessage(text: string) {
  const pair = getPairCode();
  if (!pair) return;
  const ref = collection(db, 'pairings', pair, 'messages');
  return addDoc(ref, {
    text,
    sender: auth.currentUser?.uid || 'anonymous',
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
