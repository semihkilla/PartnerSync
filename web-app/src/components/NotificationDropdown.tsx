'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/auth';
import { acceptPairRequest, declinePairRequest, subscribeToRequests, setPairCode, PairRequest } from '../lib/pair';
import { NotificationDoc, subscribeToNotifications, markNotificationRead, deleteNotification } from '../lib/notifications';
import { getUserProfile } from '../lib/user';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [requests, setRequests] = useState<(PairRequest & {id:string})[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;
    const unsubN = subscribeToNotifications(u.uid, setNotifications);
    const unsubR = subscribeToRequests(u.uid, setRequests);
    return () => {
      unsubN();
      unsubR();
    };
  }, []);

  useEffect(() => {
    async function fetchNames() {
      const missing = requests.filter(r => !usernames[r.requester]);
      const updates: Record<string, string> = {};
      for (const r of missing) {
        const p = await getUserProfile(r.requester);
        if (p?.username) updates[r.requester] = p.username;
      }
      if (Object.keys(updates).length) setUsernames(u => ({ ...u, ...updates }));
    }
    fetchNames();
  }, [requests, usernames]);

  const unread = notifications.filter(n => !n.read).length + requests.length;

  const renderNotification = (n: NotificationDoc) => {
    switch(n.type){
      case 'pairAccepted': return 'Pair request accepted';
      case 'pairDeclined': return 'Pair request declined';
      case 'chatMessage': return 'New message';
      default: return n.type;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        🔔
        {unread>0 && (
          <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl shadow p-2 space-y-2 z-20">
          {requests.map(r => (
            <div key={r.id} className="text-sm flex items-center gap-2">
              <span className="flex-1">Pair request from {usernames[r.requester] ?? r.requester}</span>
              <button className="btn px-2 py-1 text-xs" onClick={() => acceptPairRequest(r.id, r.requester)}>✓</button>
              <button className="btn px-2 py-1 text-xs" onClick={() => declinePairRequest(r.id, r.requester)}>✕</button>
            </div>
          ))}
          {notifications.map(n => (
            <div key={n.id} className="text-sm flex justify-between items-center">
              <span>{renderNotification(n)}</span>
              <div className="flex gap-1">
                {!n.read && (
                  <button
                    className="underline text-xs"
                    onClick={() => {
                      if (n.type === 'pairAccepted' && n.from && auth.currentUser) {
                        const id = [auth.currentUser.uid, n.from].sort().join('_');
                        setPairCode(id);
                      }
                      markNotificationRead(n.id!);
                    }}
                  >
                    Mark
                  </button>
                )}
                <button
                  className="underline text-xs text-red-600"
                  onClick={() => n.id && deleteNotification(n.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {requests.length===0 && notifications.length===0 && <p className="text-center text-sm">No notifications</p>}
        </div>
      )}
    </div>
  );
}
