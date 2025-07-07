"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { auth } from "@/lib/auth";
import {
  getUserProfile,
  isUsernameAvailable,
  getUserByPairCode,
  createUserProfile,
  UserProfile,
} from "@/lib/user";
import { updateProfileImage } from "@/lib/supabase";
import { updateProfile as updateAuthProfile } from "firebase/auth";

const GENDER_OPTIONS = [
  { value: "male",    label: "Männlich" },
  { value: "female",  label: "Weiblich" },
  { value: "diverse", label: "Divers"   },
  { value: "",        label: "Keine Angabe" },
];

/* --------------------------------------------------------- */
export default function CompleteSignup() {
  /* ------------------ state ------------------ */
  const [form, setForm] = useState({
    username   : "",
    firstName  : "",
    lastName   : "",
    birthday   : null as Date | null,
    anniversary: null as Date | null,
    gender     : "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [checking,   setChecking]   = useState(false);
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const router = useRouter();

  /* -------- vorbefüllen, falls Teil-Profil existiert -------- */
  useEffect(() => {
    (async () => {
      if (!auth.currentUser) return;
      const p = await getUserProfile(auth.currentUser.uid);
      setForm(f => ({
        ...f,
        firstName  : p?.firstName  || "",
        lastName   : p?.lastName   || "",
        gender     : (p as any)?.gender ?? "",
        birthday   : p?.birthday   ? new Date(p.birthday)   : null,
        anniversary: p?.anniversary? new Date(p.anniversary): null,
      }));
    })();
  }, []);

  /* --------- username availability check (debounce) -------- */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (form.username.length < 3) return setUsernameOk(null);
      setChecking(true);
      setUsernameOk(await isUsernameAvailable(form.username));
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [form.username]);

  /* ---------------- helpers ------------------ */
  const genPairCode = async () => {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await getUserByPairCode(code));
    return "PS-" + code;
  };

  /* ---------------- submit ------------------- */
  const handleSave = async () => {
    setError("");
    setSubmitting(true);
    try {
      if (!form.username.trim())      throw new Error("Username ist Pflicht");
      if (!(await isUsernameAvailable(form.username)))
        throw new Error("Username existiert bereits");

      /* -------- Bild hochladen (optional) ------ */
      let photoURL = auth.currentUser?.photoURL || "";
      if (photoFile) {
        const url = await updateProfileImage(photoFile, auth.currentUser!.uid);
        if (url) photoURL = url;
      }

      /* ------- Auth-Profil updaten ------------ */
      await updateAuthProfile(auth.currentUser!, {
        displayName: form.username,
        photoURL    : photoURL || undefined,
      });

      /* -------- Firestore-Profil anlegen ------- */
      const profile: UserProfile = {
        username : form.username,
        email    : auth.currentUser?.email || "",
        pairCode : await genPairCode(),
        photoURL ,
        ...(form.firstName  && { firstName  : form.firstName }),
        ...(form.lastName   && { lastName   : form.lastName  }),
        ...(form.birthday   && { birthday   : form.birthday.toISOString().slice(0,10) }),
        ...(form.anniversary&& { anniversary: form.anniversary.toISOString().slice(0,10) }),
        ...(form.gender     && { gender     : form.gender }),
      };
      await createUserProfile(auth.currentUser!.uid, profile);

      alert("Profil vervollständigt! Dein Code: " + profile.pairCode);
      router.replace("/");
    } catch (e: any) {
      setError(e.message ?? "Speichern fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI helpers --------------- */
  const handle = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* ------------------- UI -------------------- */
  return (
    <div className="card flex flex-col gap-5 mt-16 max-w-md mx-auto animate-fade-in-up">
      <div className="text-4xl text-center select-none">💡</div>
      <h2 className="text-2xl font-bold text-primary-blue text-center mb-1">
        Profil vervollständigen
      </h2>
      <p className="text-center text-primary-blue/80">
        Ein paar Infos noch – für dein perfektes Erlebnis!
      </p>

      {/* Username */}
      <div className="relative">
        <input
          name="username"
          className="input"
          placeholder="Username*"
          value={form.username}
          onChange={handle}
        />
        {form.username && (
          <span className="username-check absolute right-2 top-2">
            {checking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : usernameOk ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </span>
        )}
      </div>

      {/* Avatar */}
      <input
        type="file"
        accept="image/*"
        className="input"
        onChange={e => setPhotoFile(e.target.files?.[0] || null)}
      />

      {/* Vor-/Nachname */}
      <input name="firstName" className="input" placeholder="Vorname"
             value={form.firstName} onChange={handle} />
      <input name="lastName"  className="input" placeholder="Nachname"
             value={form.lastName}  onChange={handle} />

      {/* Dates */}
      <DatePicker
        selected={form.birthday || undefined}
        onChange={d => setForm(f => ({ ...f, birthday: d }))}
        className="input"
        placeholderText="Geburtstag"
        showMonthDropdown
        showYearDropdown
        dateFormat="yyyy-MM-dd"
        maxDate={new Date()}
        isClearable
      />
      <DatePicker
        selected={form.anniversary || undefined}
        onChange={d => setForm(f => ({ ...f, anniversary: d }))}
        className="input"
        placeholderText="Jahrestag (optional)"
        showMonthDropdown
        showYearDropdown
        dateFormat="yyyy-MM-dd"
        maxDate={new Date()}
        isClearable
      />

      {/* Gender */}
      <select
        name="gender"
        className="input"
        value={form.gender}
        onChange={handle}
      >
        {GENDER_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Fehler */}
      {error && <p className="error">{error}</p>}

      {/* Speichern */}
      <button className="btn" onClick={handleSave} disabled={submitting}>
        {submitting ? "…" : "Speichern"}
      </button>
    </div>
  );
}
