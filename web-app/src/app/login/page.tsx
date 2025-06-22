'use client';

import { useState } from 'react';
import { signIn, signUp } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col gap-3 max-w-sm mx-auto p-6 bg-white rounded shadow">
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn" onClick={() => signUp(email, password)}>
        Sign Up
      </button>
      <button className="btn" onClick={() => signIn(email, password)}>
        Sign In
      </button>
    </div>
  );
}
