import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './auth';
import { getPairCode, getPartnerId } from './pair';
import { getUserProfile } from './user';
import { createNotification } from './notifications';

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
  const docRef = await addDoc(ref, {
    text,
    sender,
    senderName: profile?.username || 'anonymous',
    createdAt: serverTimestamp(),
  });
  const partner = auth.currentUser ? await getPartnerId(pair, auth.currentUser.uid) : null;
  if (partner) {
    await createNotification({ userId: partner, type: 'chatMessage', from: sender });
  }
  return docRef;
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
