'use client';
import { useState, useEffect } from 'react';
import { sendPairRequest } from '../../lib/pair';
import { getUserProfile } from '../../lib/user';
import { auth } from '../../lib/auth';

export default function Pair() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [myCode, setMyCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCode() {
      if (!auth.currentUser) return;
      const profile = await getUserProfile(auth.currentUser.uid);
      setMyCode(profile?.pairCode || null);
    }
    fetchCode();
  }, []);
  return (
    <div className="card flex flex-col gap-4">
      {myCode && (
        <div className="text-sm flex items-center gap-2">
          <span>Your code: {myCode}</span>
          <button
            className="underline text-xs"
            onClick={() => {
              navigator.clipboard.writeText(myCode);
              alert('Code kopiert!');
            }}
          >
            Copy
          </button>
        </div>
      )}
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
