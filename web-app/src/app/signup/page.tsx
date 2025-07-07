"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { signUp, auth } from "@/lib/auth";
import {
  createUserProfile,
  getUserByPairCode,
  isUsernameAvailable,
  isEmailRegistered,
  UserProfile,
} from "@/lib/user";
import { updateProfileImage } from "@/lib/supabase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { updateProfile as updateAuthProfile } from "firebase/auth";

const GENDER_OPTIONS = [
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "diverse", label: "Divers" },
  { value: "",     label: "Keine Angabe" },
];

/* ----------------------------------------------------------- */
export default function SignUp() {
  /* ----------------------- state --------------------------- */
  const [form, setForm] = useState({
    username : "",
    email    : "",
    password : "",
    password2: "",
    firstName: "",
    lastName : "",
    birthday : null as Date | null,
    gender   : "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [checking,     setChecking]     = useState(false);
  const [usernameOk,   setUsernameOk]   = useState<boolean | null>(null);
  const [error,        setError]        = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const router = useRouter();

  /* ---------------- username availability ------------------ */
  useEffect(() => {
    const t = setTimeout(async () => {
      if (form.username.length < 3) return setUsernameOk(null);
      setChecking(true);
      setUsernameOk(await isUsernameAvailable(form.username));
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [form.username]);

  /* -------------- helper: Pair-Code erzeugen --------------- */
  const genPairCode = async () => {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await getUserByPairCode(code));
    return "PS-" + code;
  };

  /* --------------------- submit ---------------------------- */
  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      /* ---- validation ---- */
      if (!form.email.includes("@"))                 throw new Error("Ungültige E-Mail");
      if (form.password.length < 8)                  throw new Error("Passwort ≥ 8 Zeichen");
      if (form.password !== form.password2)          throw new Error("Passwörter stimmen nicht überein");
      if (!(await isUsernameAvailable(form.username))) throw new Error("Username existiert bereits");
      if (await isEmailRegistered(form.email)) {
        alert("E-Mail existiert bereits – du wirst eingeloggt.");
        router.replace("/");
        return;
      }

      /* ---- Firebase Auth-Sign-Up ---- */
      const cred = await signUp(form.email, form.password);

      /* ---- optionaler Avatar-Upload ---- */
      let photoURL = "";
      if (photoFile) {
        const url = await updateProfileImage(photoFile, cred.user.uid);
        if (url) photoURL = url;
      }

      /* ---- Auth-Profil sofort aktualisieren ---- */
      await updateAuthProfile(cred.user, {
        displayName: form.username,
        photoURL: photoURL || undefined,
      });

      /* ---- Firestore-Dokument anlegen ---- */
      const profile: UserProfile = {
        username : form.username,
        email    : form.email,
        pairCode : await genPairCode(),
        photoURL ,
        ...(form.firstName && { firstName: form.firstName }),
        ...(form.lastName  && { lastName : form.lastName  }),
        ...(form.birthday  && { birthday : form.birthday.toISOString().slice(0, 10) }),
        ...(form.gender    && { gender   : form.gender }),
      };
      await createUserProfile(cred.user.uid, profile);

      alert("Erfolgreich registriert. Dein Code: " + profile.pairCode);
      router.replace("/");
    } catch (e: any) {
      setError(e.message ?? "Registrierung fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Google Sign-Up ------------------------- */
  const handleGoogle = async () => {
    setError("");
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred     = await signInWithPopup(auth, provider);
      if (await isEmailRegistered(cred.user.email!)) {
        return router.replace("/");
      }
      router.replace("/complete-signup");
    } catch (e: any) {
      setError(e.message ?? "Google-Login fehlgeschlagen");
    } finally {
      setSubmitting(false);
    }
  };

  /* ----------------------- UI ----------------------------- */
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="card mt-20 animate-fade-in-up">
      <div className="text-4xl text-center mb-1 select-none">📝</div>
      <h2 className="text-2xl font-bold text-center text-primary-pink mb-1">
        Erstelle deinen Account
      </h2>

      {/* ---------------- username ---------------- */}
      <div className="relative">
        <input
          name="username"
          className="input"
          placeholder="Username"
          value={form.username}
          onChange={handle}
          autoComplete="off"
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

      {/* ---------------- avatar ------------------ */}
      <input
        type="file"
        accept="image/*"
        className="input"
        onChange={e => setPhotoFile(e.target.files?.[0] || null)}
      />

      {/* ---------------- email / pwd ------------- */}
      <input
        name="email"
        type="email"
        className="input"
        placeholder="E-Mail"
        value={form.email}
        onChange={handle}
      />

      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          className="input pr-10"
          placeholder="Passwort"
          value={form.password}
          onChange={handle}
        />
        <button
          type="button"
          className="absolute right-2 top-2 text-lg text-primary-pink"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <input
        name="password2"
        type={showPassword ? "text" : "password"}
        className="input"
        placeholder="Passwort wiederholen"
        value={form.password2}
        onChange={handle}
      />

      {/* ---------------- optional fields ---------- */}
      <input name="firstName" className="input" placeholder="Vorname"
             value={form.firstName} onChange={handle} />
      <input name="lastName"  className="input" placeholder="Nachname"
             value={form.lastName}  onChange={handle} />

      <DatePicker
        selected={form.birthday || undefined}
        onChange={d => setForm(f => ({ ...f, birthday: d }))}
        className="input"
        placeholderText="Geburtstag"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
        dateFormat="yyyy-MM-dd"
        isClearable
      />

      <select
        name="gender"
        className="input"
        value={form.gender}
        onChange={handle}
      >
        {GENDER_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* ---------------- actions ----------------- */}
      {error && <p className="error">{error}</p>}

      <button className="btn-google" onClick={handleGoogle} disabled={submitting}>
        <img src="/google-logo.svg" className="w-5 h-5" alt="Google" /> Google Signup
      </button>

      <button className="btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "…" : "Registrieren"}
      </button>

      <a href="/login" className="block underline text-sm text-center text-primary-blue/70 hover:text-primary-pink mt-1">
        Bereits einen Account?
      </a>
    </div>
  );
}
