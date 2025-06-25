'use client';
import { useState } from 'react';

function heartRain() {
  const container = document.createElement('div');
  container.id = 'heart-container';
  container.style.position = 'fixed';
  container.style.pointerEvents = 'none';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  document.body.appendChild(container);
  const interval = setInterval(() => {
    const el = document.createElement('div');
    el.textContent = '💖';
    el.style.position = 'absolute';
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.fontSize = '24px';
    el.style.animation = 'fall 2s linear forwards';
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }, 150);
  setTimeout(() => { clearInterval(interval); container.remove(); }, 2000);
}

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <button className="fab" onClick={() => setOpen(v => !v)} aria-label="Love menu">
        💖
      </button>
      {open && (
        <div className="menu-options flex flex-col gap-2 mb-2 bg-white/90 rounded-xl shadow-xl p-3 border border-pink-300 animate-fade-in-up">
          <button className="menu-item" onClick={heartRain}>💖 Herzregen</button>
        </div>
      )}
    </div>
  );
}
