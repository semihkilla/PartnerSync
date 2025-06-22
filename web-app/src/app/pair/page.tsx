'use client';

import { useState } from 'react';
import { createPairing, joinPairing, setPairCode } from '../../lib/pair';
import { auth } from '../../lib/auth';

function randomCode() {
  return Math.random().toString(36).slice(2, 8);
}

export default function Pair() {
  const [code, setCode] = useState('');

  const user = auth.currentUser;

  return (
    <div className="flex flex-col gap-3 max-w-sm mx-auto p-6 bg-white rounded shadow">
      <div>
        <button
          className="btn"
          onClick={() => {
            const c = randomCode();
            setCode(c);
            if (user) {
              createPairing(c, user.uid);
              setPairCode(c);
            }
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
          onClick={() => {
            if (user) {
              joinPairing(code, user.uid);
              setPairCode(code);
            }
          }}
        >
          Join
        </button>
      </div>
      {code && (
        <a href="/chat" className="underline text-sm text-pink-700">
          Go to Chat
        </a>
      )}
    </div>
  );
}
