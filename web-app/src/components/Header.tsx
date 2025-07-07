"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, onAuthChange, logOut } from "../lib/auth";
import {
  watchUserProfile,
  UserProfile,
} from "../lib/user";
import NotificationDropdown from "./NotificationDropdown";
import { Users, MessageCircle } from "lucide-react";

/* -------------------------------------------------------------------------- */

const THEME_OPTIONS = [
  { key: "header-gradient-pinkblue", name: "Pink ↔ Blau", preview: "theme-pinkblue-preview" },
  { key: "header-gradient-pink",     name: "Pink",        preview: "theme-pink-preview" },
  { key: "header-gradient-blue",     name: "Blau",        preview: "theme-blue-preview" },
];

function getInitials(p?: UserProfile | null) {
  if (!p) return "";
  const first = p.firstName?.trim()[0] ?? "";
  const last  = p.lastName?.trim()[0]  ?? "";
  if (first && last) return (first + last).toUpperCase();
  return p.username?.slice(0, 2).toUpperCase() ?? "";
}

/* -------------------------------------------------------------------------- */

export default function Header() {
  const [user,    setUser]    = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme,   setTheme]   = useState("header-gradient-pinkblue");
  const [open,    setOpen]    = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router      = useRouter();
  const pathname    = usePathname();

  /* ---------- Theme ------------------------------------------------------------------ */
  useEffect(() => {
    const t = localStorage.getItem("louvibe-theme");
    if (t && THEME_OPTIONS.some((o) => o.key === t)) setTheme(t);
  }, []);
  useEffect(() => localStorage.setItem("louvibe-theme", theme), [theme]);

  /* ---------- Auth + Realtime Profile ------------------------------------------------- */
  useEffect(() => {
    setLoading(true);
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthChange((u) => {
      setUser(u);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }

      unsubProfile = watchUserProfile(u.uid, (p) => {
        setProfile(p);
        setLoading(false);
      });
    });

    return () => {
      unsubProfile?.();
      unsubAuth();
    };
  }, []);

  /* ---------- Klick-Outside ----------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* ---------- Lade-Skeleton ----------------------------------------------------------- */
  if (loading) {
    return (
      <nav className={theme}>
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="animate-pulse w-32 h-9 bg-gray-200 rounded" />
          <div className="animate-pulse w-10 h-10 bg-gray-200 rounded-full" />
        </div>
      </nav>
    );
  }

  // Neu: unterscheiden, ob profile.photoURL je gesetzt war
  const avatarUrl =
    profile && profile.photoURL !== undefined
      ? profile.photoURL  // kann auch "", dann wird kein <img> gerendert
      : user?.photoURL || "";

  const minimal = pathname === "/signup" || pathname === "/complete-signup";

  return (
    <nav className={theme}>
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo ------------------------------------------------------------------ */}
        <Link href="/" className="flex items-center gap-3 select-none">
          <img src="/LouVibeLogo.png" className="h-9 rounded" alt="Logo" />
          <span className="text-2xl font-bold tracking-tight text-white">
            PartnerSync
          </span>
        </Link>

        {/* Rechts ---------------------------------------------------------------- */}
        {minimal ? (
          <Link href="/login" className="header-nav-btn">
            Login
          </Link>
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link href="/pair" className="header-nav-btn flex items-center gap-2">
              <Users className="w-5 h-5" /> Pair
            </Link>
            <Link href="/chat" className="header-nav-btn flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Chat
            </Link>

            <NotificationDropdown />

            {/* Avatar ----------------------------------------------------------- */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className="ml-1 w-12 h-12 rounded-full border-2 border-blue-100 hover:border-blue-300 shadow"
                aria-label="Profil-Menü"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="w-full h-full rounded-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center rounded-full bg-pink-400 text-xl font-bold text-white">
                    {getInitials(profile)}
                  </span>
                )}
              </button>

              {open && (
                <div className="profile-dropdown">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-semibold">
                      {profile?.firstName} {profile?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profile?.email}
                    </p>
                  </div>

                  <ul className="py-2">
                    <li>
                      <Link href="/profile" className="dropdown-item">
                        Profil
                      </Link>
                    </li>
                    <li>
                      <button
                        className="dropdown-item"
                        onClick={async () => {
                          await logOut();
                          setOpen(false);
                          router.push("/");
                        }}
                      >
                        Logout
                      </button>
                    </li>

                    <li className="px-4 pt-2 pb-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Header-Theme
                    </li>
                    <li className="px-4 pb-3 flex gap-2">
                      {THEME_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          title={opt.name}
                          onClick={() => setTheme(opt.key)}
                          className={`theme-circle ${opt.preview} ${
                            theme === opt.key
                              ? "ring-2 ring-blue-500 scale-110"
                              : "border-gray-200 hover:ring-2 hover:ring-blue-400"
                          }`}
                        />
                      ))}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/login" className="header-nav-btn">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
