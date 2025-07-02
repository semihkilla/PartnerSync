"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/auth";
import { createUserProfile, getUserProfile, UserProfile, getUserByPairCode } from "../../lib/user";

export default function CompleteSignup() {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    birthday: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function prefill() {
      if (!auth.currentUser) return;
      // Versuche, falls schon Daten vorhanden
      const profile = await getUserProfile(auth.currentUser.uid);
      setForm({
        username: profile?.username || auth.currentUser.displayName?.replace(/\s/g, "").toLowerCase() || "",
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        birthday: profile?.birthday || "",
      });
    }
    prefill();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PairCode automatisch generieren
  const generateCode = async () => {
    let code = "";
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await getUserByPairCode(code));
    return code;
  };

  const handleSave = async () => {
    setError("");
    if (!form.username.trim()) {
      setError("Username required");
      return;
    }
    try {
      const pairCode = "PS-" + (await generateCode());
      const profile: UserProfile = {
        username: form.username,
        email: auth.currentUser?.email || "",
        pairCode,
        photoURL: auth.currentUser?.photoURL ?? "",
        ...(form.firstName ? { firstName: form.firstName } : {}),
        ...(form.lastName ? { lastName: form.lastName } : {}),
        ...(form.birthday ? { birthday: form.birthday } : {}),
      };
      await createUserProfile(auth.currentUser!.uid, profile);
      alert("Profil vervollständigt! Dein Code: " + pairCode);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to complete profile");
    }
  };

  return (
    <div className="card flex flex-col gap-4 mt-16 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2">Profil vervollständigen</h2>
      <input className="input" name="username" placeholder="Username" value={form.username} onChange={handleChange} />
      <input className="input" name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} />
      <input className="input" name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} />
      <input className="input" name="birthday" type="date" placeholder="Birthday" value={form.birthday} onChange={handleChange} />
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={handleSave}>Speichern</button>
    </div>
  );
}
