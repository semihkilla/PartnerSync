"use client";
import { useEffect } from "react";
import { onAuthChange } from "../lib/auth";
import { updatePresence } from "../lib/user";

export default function PresenceWatcher() {
  useEffect(() => {
    const unsubscribe = onAuthChange((u) => u && updatePresence(u.uid));
    return unsubscribe;
  }, []);
  return null;
}