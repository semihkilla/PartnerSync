'use client';

import { useState } from 'react';
import { createPairing, joinPairing, setPairCode, getPairForUser } from '../../lib/pair';
import { auth } from '../../lib/auth';

function randomCode() {
  return Math.random().toString(36).slice(2, 8);
}

export default function Pair() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const user = auth.currentUser;

  return (
    <div className="card flex flex-col gap-4">
      <div>
        <button
          className="btn"
          onClick={async () => {
            if (!user) return;
            const existing = await getPairForUser(user.uid);
            if (existing) {
              setError('Already paired');
              return;
            }
            const c = randomCode();
            setCode(c);
            await createPairing(c, user.uid);
            setPairCode(c);
            setError('');
          }}
        >
          Generate Code
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="btn"
          onClick={async () => {
            if (!user) return;
            const existing = await getPairForUser(user.uid);
            if (existing) {
              setError('Already paired');
              return;
            }
            await joinPairing(code, user.uid);
            setPairCode(code);
            setError('');
          }}
        >
          Join
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {code && !error && (
        <a href="/chat" className="underline text-sm text-pink-700">
          Go to Chat
        </a>
      )}
    </div>
  );
}
