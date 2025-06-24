import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface NotificationDoc {
  id?: string;
  userId: string;
  type: string;
  from?: string;
  read: boolean;
  createdAt: ReturnType<typeof serverTimestamp> | null;
}

const notifications = collection(db, 'notifications');

export function subscribeToNotifications(userId: string, callback: (n: NotificationDoc[]) => void) {
  const q = query(notifications, orderBy('createdAt'));
  return onSnapshot(q, snap => {
    const out: NotificationDoc[] = [];
    snap.forEach(d => {
      const data = d.data() as NotificationDoc;
      if (data.userId === userId) out.push({ id: d.id, ...data });
    });
    callback(out);
  });
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(notifications, id), { read: true });
}

export async function createNotification(data: Omit<NotificationDoc, 'id' | 'read' | 'createdAt'>) {
  await addDoc(notifications, { ...data, read: false, createdAt: serverTimestamp() });
}
