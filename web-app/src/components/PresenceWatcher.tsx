'use client';
import { useEffect } from 'react';
import { onAuthChange } from '../lib/auth';
import { updatePresence } from '../lib/user';

export default function PresenceWatcher() {
  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) updatePresence(user.uid);
    });
    return () => unsub();
  }, []);
  return null;
}
