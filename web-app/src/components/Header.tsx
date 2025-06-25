'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange, logOut } from '../lib/auth';
import NotificationDropdown from './NotificationDropdown';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState(auth.currentUser);
  const router = useRouter();

  useEffect(() => onAuthChange((u) => setUser(u)), []);

  return (
    <header className="fixed top-0 left-0 w-full bg-pink-400 text-white px-6 py-4 flex justify-between items-center shadow-lg z-10">
      <Link href="/" className="font-extrabold text-xl hover:scale-105 transition-transform">
        💖 PartnerSync
      </Link>
      <nav className="flex gap-6 items-center text-lg font-semibold">
        {!user && (
          <Link href="/login" className="hover:scale-105 transition-transform">
            🔑 Login
          </Link>
        )}
        {user && (
          <>
            <Link href="/pair" className="hover:scale-105 transition-transform">
              👫 Pair
            </Link>
            <Link href="/chat" className="hover:scale-105 transition-transform">
              💌 Chat
            </Link>
            <NotificationDropdown />
            <Link href="/profile" className="hover:scale-105 transition-transform">
              ⚙️ Profile
            </Link>
            <button
              onClick={async () => { await logOut(); router.push('/'); }}
              className="hover:scale-105 transition-transform"
            >
              🔓 Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
