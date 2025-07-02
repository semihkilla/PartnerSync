'use client';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Message, sendMessage, subscribeToMessages } from '../../lib/chat';
import { getPairCode, getPartnerId } from '../../lib/pair';
import { auth } from '../../lib/auth';
import { getUserProfile } from '../../lib/user';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [bg, setBg] = useState<string>('#fff');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pairCode = getPairCode();

  const groupByDate = (list: Message[]) => {
    const groups: Record<string, Message[]> = {};
    for (const m of list) {
      const day = m.createdAt?.toDate().toLocaleDateString() ?? 'unknown';
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    }
    return groups;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatBg');
      if (saved) setBg(saved);
    }
  }, []);

  useEffect(() => {
    if (!pairCode) return;
    const unsub = subscribeToMessages(setMessages);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [pairCode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    // Schönes Panel für "Nicht gepaart"
    return (
      <div className="card text-center space-y-5 animate-fade-in-up max-w-lg mx-auto mt-12">
        <h2 className="text-3xl font-bold text-primary-pink mb-2">Du bist noch nicht gepaart!</h2>
        <a href="/pair" className="btn shadow-glow text-lg px-6 py-3">
          Jetzt mit Partner koppeln
        </a>
        <p className="text-base text-gray-500 dark:text-gray-300">
          Nur gepaarte User können chatten. Verbinde dich mit deinem Partner, um loszulegen!
        </p>
      </div>
    );
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
      <div className="flex-1 overflow-y-auto space-y-4 mb-2 bg-white/80 dark:bg-gray-800/70 rounded-xl p-3">
        {Object.entries(groupByDate(messages.filter(m => m.text.toLowerCase().includes(query.toLowerCase())))).map(([day, msgs]) => (
          <div key={day}>
            <div className="text-center my-2 text-xs text-gray-500">{day}</div>
            <AnimatePresence>
              {msgs.map(m => {
                const mine = m.sender === auth.currentUser?.uid;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: mine ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mine ? 50 : -50 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', width: '100%' }}
                  >
                    <div className={`px-4 py-2 rounded-2xl shadow max-w-xs break-words ${mine ? 'bg-gradient-to-br from-primary-pink to-secondary-pink text-white rounded-br-3xl' : 'bg-white dark:bg-gray-700 text-black dark:text-white rounded-bl-3xl'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs">{m.senderName ?? m.sender}</span>
                        <span className="text-[10px] text-gray-400">{m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div>{m.text}</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
        <div ref={bottomRef} />
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
      <div className="mt-2 flex items-center gap-3 text-sm">
        <label htmlFor="chat-bg-picker" className="font-semibold">Background:</label>
        <button
          type="button"
          className="w-7 h-7 rounded-full border-2 border-primary-pink shadow-lg transition-transform transform hover:scale-110 cursor-pointer"
          style={{ background: bg }}
          title="Current background"
          aria-label="Pick chat background color"
          onClick={() => document.getElementById('chat-bg-picker')?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('chat-bg-picker')?.click();
            }
          }}
        />
        <input
          id="chat-bg-picker"
          type="color"
          className="hidden"
          value={bg}
          onChange={(e) => {
            setBg(e.target.value);
            if (typeof window !== 'undefined') localStorage.setItem('chatBg', e.target.value);
          }}
        />
        {partnerName && <span className="ml-auto">Chatting with {partnerName}</span>}
      </div>
    </div>
  );
}
