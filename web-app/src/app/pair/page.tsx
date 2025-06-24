'use client';
import { useState } from 'react';
import { sendPairRequest } from '../../lib/pair';

export default function Pair() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <div className="card flex flex-col gap-4">
      <input
        className="input"
        placeholder="Partner code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="btn"
        onClick={async () => {
          try {
            await sendPairRequest(code.trim());
            setMsg('Request sent');
          } catch (e) {
            setMsg((e as Error).message);
          }
        }}
      >
        Pair
      </button>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </div>
  );
}
