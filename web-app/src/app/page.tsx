'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange } from '../lib/auth';

export default function Home() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthChange(setUser), []);

  return (
    <div className="text-center mt-16 space-y-4">
      <h1 className="text-3xl font-bold">Welcome to PartnerSync</h1>
      {!user ? (
        <p>
          <Link href="/login" className="btn">
            Login to start
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-lg">You are logged in.</p>
          <div className="flex justify-center gap-4">
            <Link href="/pair" className="btn">
              Pair with Partner
            </Link>
            <Link href="/chat" className="btn">
              Open Chat
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
