'use client';
import { useEffect, useState } from 'react';
import { Message, sendMessage, subscribeToMessages } from '../../lib/chat';
import { getPairCode, getPartnerId } from '../../lib/pair';
import { auth } from '../../lib/auth';
import { getUserProfile } from '../../lib/user';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
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
    <div
      className="card flex flex-col h-[60vh] w-full max-w-lg"
      style={{ background: bg }}
    >
      <div className="flex justify-between items-center mb-2">
        {partnerName && <span className="font-semibold">{partnerName}</span>}
        <input
          className="input h-8 ml-auto"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 bg-white/80 rounded-xl p-2">
        {messages
          .filter((m) => m.text.toLowerCase().includes(query.toLowerCase()))
          .map((m) => {
            const mine = m.sender === auth.currentUser?.uid;
            return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`px-3 py-2 rounded-xl shadow max-w-xs ${mine ? 'bg-pink-300 dark:bg-pink-700 text-black dark:text-white' : 'bg-white dark:bg-gray-700'}`}
              >
                <div className="text-xs text-gray-600 mb-1">
                  {m.senderName ?? m.sender}
                </div>
                <div>{m.text}</div>
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  {m.createdAt?.toDate().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-auto">
        <input
          className="input flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
        />
        <button className="btn" onClick={handleSend}>
          ➤
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <label>Background:</label>
        <input
          type="color"
          value={bg}
          onChange={(e) => {
            setBg(e.target.value);
            localStorage.setItem('chatBg', e.target.value);
          }}
        />
        {partnerName && <span className="ml-auto">Chatting with {partnerName}</span>}
      </div>
    </div>
  );
}
