'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, auth } from '../../lib/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getUserByUsername } from '../../lib/user';

export default function Login() {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div className="card flex flex-col gap-4">
      <input
        className="input"
        placeholder="Email or Username"
        value={emailOrUser}
        onChange={(e) => setEmailOrUser(e.target.value)}
      />
      <div className="relative">
        <input
          className="input pr-10 w-full"
          type={showPass ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-2 text-xl"
          onClick={() => setShowPass(!showPass)}
        >
          {showPass ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <button
        className="btn bg-white text-pink-500 flex items-center gap-2 border border-pink-400 shadow"
        onClick={async () => {
          try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/');
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <img src="/google-logo.svg" className="w-5 h-5" alt="Google" />
        Sign in with Google
      </button>
      <button
        className="btn"
        onClick={async () => {
          setError('');
          try {
            let email = emailOrUser;
            if (!emailOrUser.includes('@')) {
              const u = await getUserByUsername(emailOrUser);
              if (!u) throw new Error('User not found');
              email = u.email;
            }
            await signIn(email, password);
            router.push('/');
          } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Failed to sign in');
          }
        }}
      >
        Sign In
      </button>
      <a href="/signup" className="underline text-sm text-center">Need an account?</a>
    </div>
  );
}
