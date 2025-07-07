'use client';
import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Message, sendMessage, subscribeToMessages } from '../../lib/chat';
import { getPairCode, getPartnerId } from '../../lib/pair';
import { auth } from '../../lib/auth';
import { getUserProfile } from '../../lib/user';
import { Sparkles } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [bg, setBg] = useState<string>('#f7f7fa');
  const [loading, setLoading] = useState(true);
  const [hasPair, setHasPair] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Helper: group messages by date
  const groupByDate = (list: Message[]) => {
    const groups: Record<string, Message[]> = {};
    for (const m of list) {
      const day = m.createdAt?.toDate().toLocaleDateString() ?? 'unknown';
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    }
    return groups;
  };

  // Lade Chat-Background aus localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatBg');
      if (saved) setBg(saved);
    }
  }, []);

  // Prüfe: Ist User gepaart? Hole Partnername
  useEffect(() => {
    async function fetchPair() {
      const pairCode = getPairCode();
      if (!pairCode || !auth.currentUser) {
        setHasPair(false);
        setPartnerName(null);
        setLoading(false);
        return;
      }
      setHasPair(true);
      const partnerId = await getPartnerId(pairCode, auth.currentUser.uid);
      if (partnerId) {
        const partner = await getUserProfile(partnerId);
        setPartnerName(partner?.username || null);
      } else {
        setPartnerName(null);
      }
      setLoading(false);
    }
    fetchPair();
  }, []);

  // Chat-Nachrichten abonnieren (nur wenn gepaart)
  useEffect(() => {
    const pairCode = getPairCode();
    if (!pairCode) return;
    const unsub = subscribeToMessages(setMessages);
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [hasPair]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Senden
  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  if (loading) {
    return (
      <div className="card text-center animate-fade-in-up max-w-lg mx-auto mt-16 py-8 flex flex-col items-center gap-3 bg-white/90">
        <span className="animate-pulse text-primary-pink text-3xl font-bold">Lädt…</span>
      </div>
    );
  }

  // Nicht gepaart
  if (!hasPair) {
    return (
      <div className="card text-center animate-fade-in-up max-w-lg mx-auto mt-16 py-10 flex flex-col items-center gap-6 bg-white/90">
        <h2 className="text-3xl font-bold text-primary-pink mb-2">Du bist noch nicht gepaart!</h2>
        <a href="/pair" className="btn text-lg px-6 py-3">Jetzt mit Partner koppeln</a>
        <p className="text-base text-gray-500">
          Nur gepaarte User können chatten.<br />Verbinde dich mit deinem Partner, um loszulegen!
        </p>
      </div>
    );
  }

  // Gefilterte Messages im Pair
  const filtered = messages.filter(m => m.text.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      className="chat-card mx-auto mt-8 flex flex-col h-[68vh] w-full max-w-lg rounded-3xl"
      style={{
        background: bg,
        boxShadow: '0 10px 50px 0 #e940a633, 0 4px 20px #f472b688'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-3 border-b border-pink-100/70 rounded-t-3xl bg-white/80 backdrop-blur-md">
        <div className="font-semibold text-lg text-pink-600 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-pink" />
          {partnerName ? `Chat mit ${partnerName}` : "Partner"}
        </div>
        <input
          className="input-chat-search h-9 ml-auto max-w-[160px] text-sm"
          placeholder="Suche"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-6 pt-4 pb-2 bg-transparent">
        {Object.entries(groupByDate(filtered)).map(([day, msgs]) => (
          <div key={day}>
            <div className="text-center my-2 text-xs text-primary-pink/90 font-semibold">{day}</div>
            <AnimatePresence>
              {msgs.map(m => {
                const mine = m.sender === auth.currentUser?.uid;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: mine ? 60 : -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mine ? 60 : -60 }}
                    transition={{ duration: 0.21 }}
                    className={`flex w-full mb-2 ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`
                      max-w-xs break-words px-5 py-3 rounded-2xl shadow
                      ${mine
                        ? "bubble-mine"
                        : "bubble-other"}
                    `}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-xs ${mine ? "text-white" : "text-primary-pink"}`}>{m.senderName ?? m.sender}</span>
                        <span className={`text-[11px] ${mine ? "text-pink-200" : "text-gray-400"}`}>{m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
      {/* Input */}
      <div className="flex gap-2 mt-auto p-5 pt-4 border-t border-pink-100/60 bg-white/80 backdrop-blur-md rounded-b-3xl">
        <input
          className="input-chat flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nachricht schreiben…"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!hasPair}
        />
        <button className="send-btn" onClick={handleSend} disabled={!text.trim() || !hasPair}>
          <span className="sr-only">Senden</span>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      {/* Custom Background Color Picker */}
      <div className="mt-2 flex items-center gap-4 text-sm px-6 pb-4">
        <label htmlFor="chat-bg-picker" className="font-semibold text-primary-pink">Background:</label>
        <button
          type="button"
          className="bg-picker-btn"
          style={{ background: bg }}
          title="Chat-Background wählen"
          aria-label="Pick chat background color"
          onClick={() => document.getElementById('chat-bg-picker')?.click()}
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
        {partnerName && <span className="ml-auto text-gray-400">Mit <span className="font-semibold text-primary-pink">{partnerName}</span></span>}
      </div>
    </div>
  );
}
