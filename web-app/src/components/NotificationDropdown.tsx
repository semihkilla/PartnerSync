"use client";
import { useState, useEffect } from "react";
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
import { Bell } from "lucide-react";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDoc[]>([]);
  const [requests, setRequests] = useState<(PairRequest & { id: string })[]>([]);
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

  const unread = notifications.filter((n) => !n.read).length + requests.length;

  const renderNotification = (n: NotificationDoc) => {
    switch (n.type) {
      case "pairAccepted":
        return "Pair request accepted";
      case "pairDeclined":
        return "Pair request declined";
      case "chatMessage":
        return "New message";
      case "heartRain":
        return "💖 Partner sent you Heart Rain!";
      case "flowerRain":
        return "🌸 Partner sent you Flower Rain!";
      default:
        return n.type;
    }
  };

  // Special: Heart/Flower rain notification → "accept" to show animation
  const showRain = (type: "heartRain" | "flowerRain") => {
    // Add DOM animation to body
    const emj = type === "heartRain" ? "💖" : "🌸";
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.pointerEvents = "none";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "100vw";
    container.style.height = "100vh";
    container.style.zIndex = "99999";
    document.body.appendChild(container);

    const interval = setInterval(() => {
      const el = document.createElement("div");
      el.textContent = emj;
      el.style.position = "absolute";
      el.style.left = Math.random() * window.innerWidth + "px";
      el.style.fontSize = Math.random() * 40 + 32 + "px";
      el.style.opacity = Math.random() * 0.7 + 0.3 + "";
      el.style.top = "-32px";
      el.style.transition = "top 2s linear, opacity 2s";
      container.appendChild(el);
      setTimeout(() => {
        el.style.top = window.innerHeight + "px";
        el.style.opacity = "0";
      }, 20);
      setTimeout(() => el.remove(), 2100);
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      container.remove();
    }, 2200);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="relative p-2">
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card-bg/95 rounded-2xl shadow-menu p-3 space-y-3 z-50 border border-primary-pink/40 animate-fade-in-up">
          {requests.map((r) => (
            <div key={r.id} className="text-sm flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <span className="flex-1">Pair request from <span className="font-bold text-primary-pink">{usernames[r.requester] ?? r.requester}</span></span>
              <button className="btn px-3 py-1 text-xs" onClick={() => acceptPairRequest(r.id, r.requester)}>Accept</button>
              <button className="btn px-3 py-1 text-xs bg-gray-500 hover:bg-gray-700" onClick={() => declinePairRequest(r.id, r.requester)}>Decline</button>
            </div>
          ))}
          {notifications.map((n) => (
            <div key={n.id} className="text-sm flex justify-between items-center bg-white/10 rounded-xl px-3 py-2">
              <span>{renderNotification(n)}</span>
              <div className="flex gap-1">
                {["heartRain", "flowerRain"].includes(n.type) && (
                  <button
                    className="btn px-3 py-1 text-xs"
                    onClick={() => {
                      markNotificationRead(n.id!);
                      showRain(n.type as "heartRain" | "flowerRain");
                    }}
                  >
                    Show
                  </button>
                )}
                {!n.read && !["heartRain", "flowerRain"].includes(n.type) && (
                  <button
                    className="underline text-xs"
                    onClick={() => markNotificationRead(n.id!)}
                  >
                    Mark as read
                  </button>
                )}
                <button className="underline text-xs text-red-600" onClick={() => n.id && deleteNotification(n.id!)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && notifications.length === 0 && <p className="text-center text-sm text-gray-400">No notifications</p>}
        </div>
      )}
    </div>
  );
}
