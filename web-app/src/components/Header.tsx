"use client";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import { auth, onAuthChange, logOut } from "../lib/auth";
import NotificationDropdown from "./NotificationDropdown";
import { useRouter } from "next/navigation";
import { UserCircle, LogOut, Heart, MessageCircle, Users, ChevronDown } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(auth.currentUser);
  const [dropdown, setDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => onAuthChange(setUser), []);

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-primary-pink to-secondary-pink text-white px-8 py-4 flex justify-between items-center shadow-glow z-50">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight hover:scale-105 transition-transform">
        <Heart className="w-7 h-7 -mt-1" /> PartnerSync
      </Link>
      <nav className="flex gap-8 items-center text-lg font-semibold">
        {user && (
          <>
            <Link href="/pair" className="flex items-center gap-1 hover:opacity-90 transition-opacity">
              <Users className="w-5 h-5" /> Pair
            </Link>
            <Link href="/chat" className="flex items-center gap-1 hover:opacity-90 transition-opacity">
              <MessageCircle className="w-5 h-5" /> Chat
            </Link>
            <NotificationDropdown />
            <div className="relative">
              <button
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full font-semibold hover:bg-white/20 transition-colors shadow"
                onClick={() => setDropdown((v) => !v)}
                aria-label="Profile menu"
              >
                <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  <UserCircle className="w-6 h-6" />
                </span>
                Profile
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdown ? "rotate-180" : ""}`} />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-3 bg-card-bg/90 text-white rounded-2xl shadow-menu w-44 animate-fade-in-up z-50 border border-primary-pink/30 overflow-hidden">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-3 hover:bg-primary-pink/60 transition-colors"
                    onClick={() => setDropdown(false)}
                  >
                    <UserCircle className="w-5 h-5" /> Profile
                  </Link>
                  <button
                    onClick={async () => { await logOut(); setDropdown(false); router.push("/"); }}
                    className="flex w-full items-center gap-3 px-5 py-3 hover:bg-red-500/70 text-left transition-colors"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {!user && (
          <Link href="/login" className="hover:opacity-90 transition-opacity">
            <LogOut className="w-5 h-5" /> Login
          </Link>
        )}
      </nav>
    </header>
  );
}
