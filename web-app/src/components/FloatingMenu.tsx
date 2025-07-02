"use client";
import { useState, useEffect } from "react";
import { auth } from "../lib/auth";
import { getPairCode, getPartnerId } from "../lib/pair";
import { createNotification } from "../lib/notifications";
import { Sparkles, Flower2, Heart } from "lucide-react";

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);
  const [paired, setPaired] = useState(false);

  useEffect(() => {
    async function check() {
      const pair = getPairCode();
      if (!pair || !auth.currentUser) return setPaired(false);
      const partnerId = await getPartnerId(pair, auth.currentUser.uid);
      setPaired(!!partnerId);
    }
    check();
  }, [auth.currentUser]);

  // Send "rain" as notification to partner
  const sendRain = async (type: "heart" | "flower") => {
    const pair = getPairCode();
    if (!pair || !auth.currentUser) return;
    const partnerId = await getPartnerId(pair, auth.currentUser.uid);
    if (!partnerId) return;
    await createNotification({
      userId: partnerId,
      type: type === "heart" ? "heartRain" : "flowerRain",
      from: auth.currentUser.uid,
    });
    setOpen(false);
  };

  if (!paired) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <button
        className="fab ring-2 ring-primary-pink shadow-glow hover:scale-110 transition-transform"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
      >
        <Heart className="w-8 h-8" />
      </button>
      {open && (
        <div className="flex flex-col gap-2 mb-2 w-40 bg-card-bg/95 border border-primary-pink/50 rounded-2xl shadow-menu animate-fade-in-up">
          <button
            className="flex gap-3 items-center py-4 px-6 rounded-2xl hover:bg-primary-pink/80 font-bold text-lg text-white transition-colors"
            onClick={() => sendRain("heart")}
          >
            <Sparkles className="w-6 h-6" /> Heart Rain
          </button>
          <button
            className="flex gap-3 items-center py-4 px-6 rounded-2xl hover:bg-pink-400/70 font-bold text-lg text-white transition-colors"
            onClick={() => sendRain("flower")}
          >
            <Flower2 className="w-6 h-6" /> Flower Rain
          </button>
        </div>
      )}
    </div>
  );
}
