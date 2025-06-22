'use client';
import { useEffect, useState } from 'react';
import { Message, sendMessage, subscribeToMessages } from '../../lib/chat';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsub = subscribeToMessages(setMessages);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4 bg-white rounded shadow max-w-md mx-auto">
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
    </div>
  );
}
