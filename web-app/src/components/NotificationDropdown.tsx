'use client';
import { useState, useEffect, useRef } from "react";
import { auth } from "../lib/auth";
import {
  acceptPairRequest,
  declinePairRequest,
  subscribeToRequests,
  PairRequest,
} from "../lib/pair";
import {
  NotificationDoc,
  subscribeToNotifications,
  markNotificationRead,
  deleteNotification,
} from "../lib/notifications";
import { getUserProfile } from "../lib/user";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [requests, setRequests] = useState<(PairRequest & { id: string })[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const dropRef = useRef<HTMLDivElement>(null);

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
      const missing = requests.filter((r) => !usernames[r.requester]);
      const updates: Record<string, string> = {};
      for (const r of missing) {
        const p = await getUserProfile(r.requester);
        if (p?.username) updates[r.requester] = p.username;
      }
      if (Object.keys(updates).length) setUsernames((u) => ({ ...u, ...updates }));
    }
    fetchNames();
  }, [requests, usernames]);

  // Outside click schließen
  useEffect(() => {
    function close(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const unread = notifications.filter((n) => !n.read).length + requests.length;

  const renderNotification = (n: NotificationDoc) => {
    switch (n.type) {
      case "pairAccepted": return "Pair-Anfrage akzeptiert";
      case "pairDeclined": return "Pair-Anfrage abgelehnt";
      case "chatMessage": return "Neue Nachricht";
      case "heartRain": return "Heart Rain!";
      case "flowerRain": return "Flower Rain!";
      default: return n.type;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center justify-center w-10 h-10 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white focus:outline-none"
        aria-label="Benachrichtigungen"
      >
        {/* Bell Icon */}
        <svg className="w-6 h-6" fill="violet" viewBox="0 0 14 20">
          <path d="M12.133 10.632v-1.8A5.406 5.406 0 0 0 7.979 3.57.946.946 0 0 0 8 3.464V1.1a1 1 0 0 0-2 0v2.364a.946.946 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C1.867 13.018 0 13.614 0 14.807 0 15.4 0 16 .538 16h12.924C14 16 14 15.4 14 14.807c0-1.193-1.867-1.789-1.867-4.175ZM3.823 17a3.453 3.453 0 0 0 6.354 0H3.823Z" />
        </svg>
        {unread > 0 && (
          <div className="absolute top-0 right-0 block w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></div>
        )}
      </button>
      {/* Dropdown */}
      <div
        ref={dropRef}
        className={`absolute right-0 mt-3 z-50 w-[360px] bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-800 dark:divide-gray-700 transition ${
          open ? 'block' : 'hidden'
        }`}
      >
        <div className="block px-4 py-2 font-semibold text-center text-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-800 dark:text-white">
          Benachrichtigungen
        </div>
        <div className="max-h-96 overflow-y-auto">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="w-9 h-9 flex items-center justify-center bg-blue-200 rounded-full text-blue-700 font-bold">{(usernames[r.requester] ?? r.requester).substring(0, 2).toUpperCase()}</div>
              <span className="flex-1 text-gray-800 dark:text-gray-200 text-sm">
                Paaranfrage von <span className="font-bold">{usernames[r.requester] ?? r.requester}</span>
              </span>
              <button
                className="ml-1 px-3 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white shadow hover:bg-blue-700"
                onClick={() => acceptPairRequest(r.id, r.requester)}
              >Annehmen</button>
              <button
                className="ml-1 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-blue-700 hover:bg-gray-200"
                onClick={() => declinePairRequest(r.id, r.requester)}
              >Ablehnen</button>
            </div>
          ))}
          {notifications.map((n) => (
            <div key={n.id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
              <span className="text-gray-700 dark:text-gray-200 text-sm">{renderNotification(n)}</span>
              <div className="flex gap-2">
                {!n.read && (
                  <button className="text-xs text-blue-600 underline" onClick={() => markNotificationRead(n.id!)}>
                    Gelesen
                  </button>
                )}
                <button className="text-xs text-red-500" onClick={() => n.id && deleteNotification(n.id!)}>✕</button>
              </div>
            </div>
          ))}
          {requests.length === 0 && notifications.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">Keine Benachrichtigungen</p>
          )}
        </div>
      </div>
    </div>
  );
}
