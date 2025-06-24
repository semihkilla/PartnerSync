'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange } from '../lib/auth';

export default function Home() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthChange(setUser), []);

  return (
    <div className="card text-center space-y-6">
      <div className="text-6xl">💖</div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-xl">
        Welcome to PartnerSync
      </h1>
      {!user ? (
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/login" className="btn">
            Sign In
          </Link>
          <Link href="/signup" className="btn">
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-center gap-4 mt-6">
            <Link href="/pair" className="btn">
              Pair with Partner
            </Link>
            <Link href="/chat" className="btn">
              Open Chat
            </Link>
          </div>
        </div>
      )}
      <p className="text-white/80 text-lg">Private space for two hearts</p>
    </div>
  );
}
