"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { auth, onAuthChange } from "../../lib/auth";
import {
  getUserProfile,
  watchUserProfile,
  updateProfile as updateFirestoreProfile,
  isUsernameAvailableExceptSelf,
  UserProfile,
} from "../../lib/user";
import { getPartnerId, deletePairing, clearPairCode } from "../../lib/pair";
import {
  updateProfileImage,
  deleteProfileImage,
} from "../../lib/supabase";
import {
  updateProfile as updateAuthProfile,
  deleteUser as firebaseDeleteUser,
} from "firebase/auth";

import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Loader2, Camera, Trash2, CheckCircle2, XCircle } from "lucide-react";

type AnniversaryDisplayProps = {
  readonly date: string;
};

const GENDER_OPTIONS = [
  { value: "male",   label: "Männlich" },
  { value: "female", label: "Weiblich" },
  { value: "diverse",label: "Divers" },
  { value: "",       label: "Keine Angabe" },
];
const DEFAULT_AVATAR = "/default-avatar.png";

function getInitials(p?: UserProfile|null) {
  if (!p) return "";
  const f = p.firstName?.trim()[0] ?? "";
  const l = p.lastName?.trim()[0]  ?? "";
  if (f && l) return (f + l).toUpperCase();
  return p?.username?.slice(0,2).toUpperCase() ?? "";
}

function AnniversaryDisplay({ date }: AnniversaryDisplayProps) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(v=>v+1), 60_000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(date);
  const diff  = Date.now() - start.getTime();
  const days  = Math.floor(diff / (1000*60*60*24));
  const yrs   = Math.floor(days / 365.25);
  const rem   = days - Math.floor(yrs*365.25);
  const mos   = Math.floor(rem / 30.44);
  const d     = rem - Math.floor(mos*30.44);
  const hrs   = Math.floor((diff/(1000*60*60)) % 24);
  const mins  = Math.floor((diff/(1000*60))    % 60);

  return (
    <div className="bg-primary-pink text-white rounded-xl px-4 py-2 shadow-glow mt-2 text-center text-base">
      {yrs>0  && `${yrs} Jahr${yrs>1?'e':''}, `}
      {mos>0 && `${mos} Monat${mos>1?'e':''}, `}
      {d} Tag{d!==1?'e':''} (insgesamt {days} Tage)
      <br/>
      Seit {days} Tagen, {hrs} Std, {mins} Min
    </div>
  );
}

export default function Profile() {
  const router = useRouter();

  // --- Lade-States ---
  const [authLoading,    setAuthLoading]    = useState(true);
  const [profile,        setProfile]        = useState<UserProfile|null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // --- Editierbare Kopie (DRAFT) ---
  const [draft, setDraft] = useState<UserProfile|null>(null);
  const [birthday, setBirthday] = useState<Date|null>(null);
  const [anniversary, setAnniversary] = useState<Date|null>(null);

  // --- UI-/Form-States ---
  const [editing,    setEditing]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [copyMsg,    setCopyMsg]    = useState("");

  // --- Avatar-Handling ---
  const [avatarFile,     setAvatarFile]     = useState<File|null>(null);
  const [avatarPreview,  setAvatarPreview]  = useState<string|null>(null);
  const [avatarToDelete, setAvatarToDelete] = useState(false);

  // --- Username-Livecheck ---
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameOk, setUsernameOk] = useState<boolean|null>(null);

  // --- Partner-Name ---
  const [partnerName, setPartnerName] = useState<string|null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // 1) Auth-Listener + Firestore-Realtime-Abo
  useEffect(() => {
    const unsubAuth = onAuthChange(user => {
      setAuthLoading(false);
      if (!user) {
        router.replace("/login");
        return;
      }
      // Profil als Snapshot abonnieren
      const unsubProf = watchUserProfile(user.uid, async p => {
        setProfile(p);
        setDraft(p ? { ...p } : null); // Kopie als Draft!
        setProfileLoading(false);

        // Datum-Felder initialisieren
        if (p?.birthday)    setBirthday(new Date(p.birthday));
        else setBirthday(null);
        if (p?.anniversary) setAnniversary(new Date(p.anniversary));
        else setAnniversary(null);

        // Partnername holen
        if (p?.pair) {
          const pid = await getPartnerId(p.pair, user.uid);
          if (pid) {
            const pp = await getUserProfile(pid);
            setPartnerName(pp?.username ?? null);
          }
        } else {
          setPartnerName(null);
        }
      });
      return unsubProf;
    });
    return () => unsubAuth();
  }, [router]);

  // Draft zurücksetzen (z.B. bei Abbrechen oder nach Speichern)
  const resetDraft = () => {
    setDraft(profile ? { ...profile } : null);
    setBirthday(profile?.birthday ? new Date(profile.birthday) : null);
    setAnniversary(profile?.anniversary ? new Date(profile.anniversary) : null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToDelete(false);
    setError("");
    setUsernameOk(null);
    setUsernameChecking(false);
  };

  // Avatar-Vorschau generieren
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const r = new FileReader();
    r.onload = () => setAvatarPreview(r.result as string);
    r.readAsDataURL(avatarFile);
  }, [avatarFile]);

  // --- Username-Livecheck (wie im Signup, aber "außer selbst") ---
  useEffect(() => {
    if (!editing || !draft || !draft.username) return;
    const t = setTimeout(async () => {
      if (draft.username.trim().length < 3) return setUsernameOk(null);
      setUsernameChecking(true);
      setUsernameOk(await isUsernameAvailableExceptSelf(draft.username.trim(), auth.currentUser!.uid));
      setUsernameChecking(false);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [draft?.username, editing]);

  const calcAge = (d?: string) => {
    if (!d) return null;
    const diff = Date.now() - new Date(d).getTime();
    return Math.floor(diff/(1000*60*60*24*365.25));
  };

  // Änderungen im Edit-Formular
  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    if (!draft) return;
    setDraft({ ...draft, [e.target.name]: e.target.value });
  };

  const handleDeleteAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarToDelete(true);
    setDraft(d => d ? { ...d, photoURL: "" } : d);
  };

  // --- SPEICHERN ---
  const handleSave = async () => {
    if (!editing || !draft || !auth.currentUser) return;
    setSubmitting(true);
    setError("");
    try {
      // Username-Check!
      if (!(await isUsernameAvailableExceptSelf(draft.username.trim(), auth.currentUser.uid)))
        throw new Error("Username ist bereits vergeben");

      let photoURL = draft.photoURL || "";

      // neues Bild?
      if (avatarFile) {
        photoURL = await updateProfileImage(avatarFile, auth.currentUser.uid, draft.photoURL) || "";
      }
      // markiert zum Löschen?
      if (avatarToDelete && photoURL && photoURL !== DEFAULT_AVATAR) {
        await deleteProfileImage(photoURL);
        photoURL = "";
      }

      // Auth-Profil aktualisieren
      await updateAuthProfile(auth.currentUser, {
        displayName: draft.username.trim(),
        photoURL: photoURL || null,
      });

      // Firestore-Profil aktualisieren
      await updateFirestoreProfile(auth.currentUser.uid, {
        ...draft,
        username: draft.username.trim(),
        photoURL,
        birthday: birthday ? birthday.toISOString().slice(0,10) : undefined,
        anniversary: anniversary ? anniversary.toISOString().slice(0,10) : undefined,
      });

      setEditing(false);
      resetDraft();
      alert("Profil gespeichert!");
    } catch (e: any) {
      setError(e.message||"Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!profile || !auth.currentUser) return;
    if (!confirm("Account wirklich löschen?")) return;
    setSubmitting(true);
    try {
      const uid = auth.currentUser.uid;
      if (profile.pair) await deletePairing(profile.pair);
      if (profile.photoURL && profile.photoURL!==DEFAULT_AVATAR) {
        await deleteProfileImage(profile.photoURL);
      }
      await deleteDoc(doc(db, "users", uid));
      await firebaseDeleteUser(auth.currentUser);
      clearPairCode();
      alert("Konto gelöscht!");
      router.replace("/login");
    } catch {
      setError("Löschen fehlgeschlagen");
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!draft?.pairCode) return;
    navigator.clipboard.writeText(draft.pairCode);
    setCopyMsg("Kopiert!");
    setTimeout(() => setCopyMsg(""), 1200);
  };

  function AvatarView() {
    const url = avatarPreview ?? draft?.photoURL ?? auth.currentUser?.photoURL ?? "";
    if (url) {
      return (
        <img
          src={url}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-4 border-pink-300 shadow-xl object-cover bg-white"
          onClick={() => editing && inputRef.current?.click()}
          style={{ cursor: editing ? "pointer" : "default" }}
        />
      );
    }
    return (
      <div
        onClick={() => editing && inputRef.current?.click()}
        className="w-28 h-28 rounded-full border-4 border-pink-300 shadow-xl bg-pink-400
                   flex items-center justify-center text-4xl font-bold text-white select-none"
        style={{ cursor: editing ? "pointer" : "default" }}
      >
        {getInitials(draft)}
      </div>
    );
  }

  // Spinner, bis Auth und Profil geladen sind
  if (authLoading || profileLoading || !draft) {
    return (
      <div className="card mt-16 flex flex-col gap-4 py-16 items-center
                       bg-white/95 dark:bg-gray-900/90">
        <Loader2 className="w-8 h-8 animate-spin text-primary-pink" />
        <p className="text-primary-pink font-bold">Lädt…</p>
      </div>
    );
  }

  // Endgültiges UI
  return (
    <div className="card flex flex-col gap-6 max-w-lg mx-auto mt-14
                    bg-white/80 dark:bg-gray-800/80 shadow-2xl border-none
                    animate-fade-in-up">
      <h2 className="text-3xl font-bold text-center text-white mb-2 drop-shadow">
        Dein Profil
      </h2>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative group transition-all">
          <AvatarView />
          {editing && (
            <div className="absolute bottom-1 right-1 flex gap-2">
              <button
                type="button"
                title="ändern"
                onClick={() => inputRef.current?.click()}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2 shadow-md"
              >
                <Camera className="w-5 h-5" />
              </button>
              {(!!draft && draft.photoURL || avatarPreview) && (
                <button
                  type="button"
                  title="entfernen"
                  onClick={handleDeleteAvatar}
                  className="bg-gray-200 hover:bg-red-400 text-pink-700 hover:text-white rounded-full p-2 shadow-md"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={!editing}
            onChange={e => {
              setAvatarFile(e.target.files?.[0]||null);
              setAvatarToDelete(false);
            }}
          />
        </div>
        {editing && <p className="text-xs text-pink-500 mt-1">Klick zum Ändern/Löschen</p>}
      </div>

      {/* Formularfelder */}
      <div className="flex flex-col gap-3 text-white">
        {/* Username mit Live-Check */}
        <div className="relative">
          <input
            name="username"
            value={draft.username || ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Username"
            className="input bg-[#181D2F] border-pink-400/40 text-white"
            autoComplete="off"
          />
          {editing && draft.username && (
            <span className="absolute right-2 top-2">
              {usernameChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : usernameOk === null ? null : usernameOk ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            name="firstName"
            value={draft.firstName ?? ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Vorname"
            className="input bg-[#181D2F] border-pink-400/40 text-white"
          />
          <input
            name="lastName"
            value={draft.lastName   ?? ""}
            onChange={handleChange}
            disabled={!editing}
            placeholder="Nachname"
            className="input bg-[#181D2F] border-pink-400/40 text-white"
          />
        </div>
        <div className="flex gap-2">
          <DatePicker
            selected={birthday}
            onChange={d=>setBirthday(d)}
            disabled={!editing}
            placeholderText="Geburtstag"
            className="input bg-[#181D2F] border-pink-400/40 text-white"
            maxDate={new Date()}
            showMonthDropdown showYearDropdown dropdownMode="select"
            dateFormat="yyyy-MM-dd"
            isClearable
          />
          <DatePicker
            selected={anniversary}
            onChange={d=>setAnniversary(d)}
            disabled={!editing}
            placeholderText="Jahrestag"
            className="input bg-[#181D2F] border-pink-400/40 text-white"
            maxDate={new Date()}
            showMonthDropdown showYearDropdown dropdownMode="select"
            dateFormat="yyyy-MM-dd"
            isClearable
          />
        </div>
        <select
          name="gender"
          value={draft.gender  ?? ""}
          onChange={handleChange}
          disabled={!editing}
          className="input bg-[#181D2F] border-pink-400/40 text-white"
        >
          {GENDER_OPTIONS.map(g=>(
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        {draft.birthday && (
          <p className="text-xs text-gray-300">Alter: {calcAge(draft.birthday)}</p>
        )}
        {draft.anniversary && (
          <AnniversaryDisplay date={draft.anniversary}/>
        )}
      </div>

      {/* Pairing-Code */}
      <div className="flex items-center gap-2 text-sm bg-pink-50 dark:bg-pink-900/10
                      rounded-lg p-2 mt-1 border border-pink-100 dark:border-pink-800">
        <span className="font-semibold text-primary-purple">Dein Code:</span>
        <code className="font-mono px-2 py-1 rounded bg-primary-blue/10 text-primary-blue">
          {draft.pairCode}
        </code>
        <button onClick={handleCopy} className="underline text-xs text-primary-pink">
          Kopieren
        </button>
        {copyMsg && <span className="text-green-600 ml-2">{copyMsg}</span>}
      </div>

      {/* Pair-Status */}
      {draft.pair && (
        <div className="text-sm flex items-center gap-2 bg-primary-pink/10 rounded-lg p-2
                        border border-pink-100 dark:border-pink-800 mt-1">
          <span>Verbunden mit <strong>{partnerName||"..."}</strong></span>
          <button
            disabled={!editing}
            onClick={async ()=>{
              await deletePairing(draft.pair!);
              clearPairCode();
              setDraft(d=>d?{...d,pair:undefined}:d);
              setPartnerName(null);
            }}
            className="underline ml-auto text-primary-pink hover:text-primary-blue"
          >
            Unpair
          </button>
        </div>
      )}

      {error && <p className="error bg-red-50 text-red-500 px-2 py-1 text-center">{error}</p>}

      {/* Aktionen */}
      <div className="flex gap-2 mt-2">
        {!editing ? (
          <button onClick={() => { setEditing(true); }} className="btn">Bearbeiten</button>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={submitting || usernameOk===false}
              className="btn"
            >
              {submitting?"…":"Speichern"}
            </button>
            <button
              onClick={()=>{
                setEditing(false);
                resetDraft();
              }}
              disabled={submitting}
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Abbrechen
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleDeleteAccount}
        disabled={submitting}
        className="btn bg-red-600 hover:bg-red-700 mt-2"
      >
        Account löschen
      </button>
    </div>
  );
}
