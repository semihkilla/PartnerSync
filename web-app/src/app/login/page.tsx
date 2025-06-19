'use client';

import { useState } from 'react';
import { signIn, signUp } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col gap-2 max-w-sm mx-auto p-4">
      <input
        className="border px-2 py-1"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border px-2 py-1"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="border px-2 py-1" onClick={() => signUp(email, password)}>
        Sign Up
      </button>
      <button className="border px-2 py-1" onClick={() => signIn(email, password)}>
        Sign In
      </button>
    </div>
  );
}
