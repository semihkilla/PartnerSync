'use client';
import { useEffect, useState } from 'react';
import { Message, sendMessage, subscribeToMessages } from '../../lib/chat';
import { getPairCode, getPartnerId } from '../../lib/pair';
import { auth } from '../../lib/auth';
import { getUserProfile } from '../../lib/user';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [bg, setBg] = useState<string>(() => localStorage.getItem('chatBg') || '#ffffff');
  const pairCode = getPairCode();

  useEffect(() => {
    if (!pairCode) return;
    const unsub = subscribeToMessages(setMessages);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [pairCode]);

  useEffect(() => {
    async function fetchPartner() {
      if (!pairCode || !auth.currentUser) return;
      const partnerId = await getPartnerId(pairCode, auth.currentUser.uid);
      if (partnerId) {
        const p = await getUserProfile(partnerId);
        setPartnerName(p?.username || null);
      }
    }
    fetchPartner();
  }, [pairCode]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (!pairCode) {
    return <p className="text-center mt-8">Pair with your partner first.</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 rounded shadow max-w-md mx-auto" style={{ background: bg }}>
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((m) => (
          <div key={m.id} className="my-1">
            <span className="text-xs text-gray-500 mr-1">{m.sender}:</span>
            {m.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
        />
        <button className="btn" onClick={handleSend}>
          Send
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <label>Background:</label>
        <input type="color" value={bg} onChange={(e) => { setBg(e.target.value); localStorage.setItem('chatBg', e.target.value); }} />
        {partnerName && <span className="ml-auto">Chatting with {partnerName}</span>}
      </div>
    </div>
  );
}
