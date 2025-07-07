"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, onAuthChange } from '../lib/auth';

// Animationen via Tailwind
const PULSE_ANIM = "animate-[pulse_1.4s_infinite]";
const FADEIN_ANIM = "animate-[fadein_0.6s_ease-out]";

export default function Home() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => onAuthChange(setUser), []);

  return (
    <section className={`flex flex-col items-center w-full max-w-xl mx-auto ${FADEIN_ANIM}`}>
      {/* Header Emoji */}
      <div className={`text-7xl mb-1 select-none drop-shadow ${PULSE_ANIM}`}>💖</div>
      
      {/* Welcome Text */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-xl mb-3">
        {user ? "Welcome back, Lovebird!" : "Welcome to PartnerSync"}
      </h1>
      
      {/* Subheadline / Quote */}
      <p className="text-pink-100 text-lg mb-4">
        {user
          ? "Ready to connect, share, and create new memories?"
          : "A private space for two hearts. Simple. Secure. Yours."}
      </p>
      
      {/* Motivational subtext */}
      <p className="text-pink-200/80 mb-5">
        {user
          ? "💬 Chatte mit deinem Lieblingsmenschen oder teilt euch kleine Überraschungen!"
          : "Sign up and start your shared adventure today."}
      </p>

      {/* Buttons */}
      {!user ? (
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
          <Link href="/login" className="btn w-full sm:w-auto">
            Sign In
          </Link>
          <Link href="/signup" className="btn w-full sm:w-auto">
            Sign Up
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
          <Link href="/pair" className="btn w-full sm:w-auto">
            Pair with Partner
          </Link>
          <Link href="/chat" className="btn w-full sm:w-auto">
            Open Chat
          </Link>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-7 text-sm text-pink-200/60">
        <span>
          {/* Feel free to change the quote */}
          {user
            ? "Your love. Your story. Your safe space. 💌"
            : "Built for moments. Built for you. 💞"}
        </span>
      </div>

      {/* Fade-In Animation */}
      <style>{`
        @keyframes fadein { from {opacity: 0; transform: translateY(20px);} to {opacity: 1; transform: none;} }
        @keyframes pulse { 0%,100% { transform: scale(1);} 50% {transform: scale(1.13);} }
      `}</style>
    </section>
  );
}
