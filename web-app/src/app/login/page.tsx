'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '../../lib/auth';
import { getUserByUsername } from '../../lib/user';

export default function Login() {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 max-w-sm mx-auto p-6 bg-white rounded shadow mt-8">
      <input
        className="input"
        placeholder="Email or Username"
        value={emailOrUser}
        onChange={(e) => setEmailOrUser(e.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
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
