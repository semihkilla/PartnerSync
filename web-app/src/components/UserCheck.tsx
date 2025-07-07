"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/auth";
import { getUserProfile } from "../lib/user";

export default function UserCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      if (!auth.currentUser) return;
      const profile = await getUserProfile(auth.currentUser.uid);
      // Prüfe auf wichtige Felder, ggf. mehr!
      if (!profile || !profile.username || !profile.pairCode) {
        // Leite zu /complete-signup (dort kann man alles fertig ausfüllen)
        router.replace("/complete-signup");
      }
    }
    checkProfile();
  }, []);

  return <>{children}</>;
}
