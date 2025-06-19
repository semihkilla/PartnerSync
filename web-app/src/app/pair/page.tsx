'use client';

import { useState } from 'react';
import { createPairing, joinPairing } from '../../lib/pair';
import { auth } from '../../lib/auth';

function randomCode() {
  return Math.random().toString(36).slice(2, 8);
}

export default function Pair() {
  const [code, setCode] = useState('');

  const user = auth.currentUser;

  return (
    <div className="flex flex-col gap-2 max-w-sm mx-auto p-4">
      <div>
        <button
          className="border px-2 py-1"
          onClick={() => {
            const c = randomCode();
            setCode(c);
            if (user) createPairing(c, user.uid);
          }}
        >
          Generate Code
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className="border px-2 py-1 flex-1"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          className="border px-2 py-1"
          onClick={() => user && joinPairing(code, user.uid)}
        >
          Join
        </button>
      </div>
    </div>
  );
}
