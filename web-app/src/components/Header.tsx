'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange, logOut } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthChange(setUser), []);

  return (
    <header className="bg-gradient-to-r from-pink-300 to-pink-400 text-pink-900 px-4 py-3 flex justify-between items-center shadow-md">
      <Link href="/" className="font-bold text-lg">
        PartnerSync
      </Link>
      <nav className="flex gap-4 items-center text-sm">
        {!user && <Link href="/login">Login</Link>}
        {user && (
          <>
            <Link className="hover:underline" href="/pair">Pair</Link>
            <Link className="hover:underline" href="/chat">Chat</Link>
            <Link className="hover:underline" href="/profile">Profile</Link>
            <button onClick={() => logOut()} className="underline">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
