'use client';
import { useState, useEffect } from 'react';

function getStats(date: string) {
  const start = new Date(date);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365.25);
  const daysR = Math.floor(days - years * 365.25);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { years, days: daysR, hours, minutes, totalDays: days };
}

export default function AnniversaryDisplay({ date }: { date: string }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(v => v + 1), 60000);
    return () => clearInterval(t);
  }, []);
  const s = getStats(date);
  return (
    <div className="bg-primary-pink text-white rounded-xl px-4 py-2 shadow-glow mt-2 text-center">
      Together since: {s.years > 0 && `${s.years} year${s.years > 1 ? 's' : ''}, `}
      {s.days} days (total {s.totalDays} days)
      <br />({s.hours}h {s.minutes}m)
    </div>
  );
}
