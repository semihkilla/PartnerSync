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
    <div className="card flex flex-col gap-6 max-w-sm mx-auto mt-16 bg-white/95 shadow-xl border border-primary-purple/20 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-primary-blue mb-1 text-center">
        Partner koppeln
      </h2>
      {myCode && (
        <div className="text-sm flex items-center gap-2 justify-center mb-2">
          <span>Dein Code:</span>
          <span className="font-mono px-2 py-1 bg-primary-purple/10 rounded-md text-primary-purple tracking-wide">{myCode}</span>
          <button
            className="underline text-xs text-primary-pink hover:text-primary-blue"
            onClick={() => {
              navigator.clipboard.writeText(myCode);
              alert('Code kopiert!');
            }}
          >
            Kopieren
          </button>
        </div>
      )}
      <input
        className="input text-center"
        placeholder="Partner-Code eingeben"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="btn"
        onClick={async () => {
          setMsg('');
          try {
            await sendPairRequest(code.trim());
            setMsg('Anfrage gesendet!');
          } catch (e) {
            setMsg((e as Error).message);
          }
        }}
      >
        Koppeln
      </button>
      {msg && <p className={`text-sm text-center ${msg.includes('gesendet') ? 'text-primary-blue' : 'text-primary-pink'}`}>{msg}</p>}
    </div>
  );
}
