'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange, logOut } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthChange(setUser), []);

  return (
    <header className="bg-pink-200 text-pink-900 px-4 py-2 flex justify-between items-center shadow">
      <Link href="/" className="font-bold text-lg">
        PartnerSync
      </Link>
      <nav className="flex gap-4 items-center text-sm">
        {!user && <Link href="/login">Login</Link>}
        {user && (
          <>
            <Link href="/pair">Pair</Link>
            <Link href="/chat">Chat</Link>
            <button onClick={() => logOut()} className="underline">
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
