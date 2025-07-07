"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, auth } from '../../lib/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getUserByUsername } from '../../lib/user';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
    }
    setSubmitting(false);
  }

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      let email = emailOrUser;
      if (!emailOrUser.includes('@')) {
        const u = await getUserByUsername(emailOrUser);
        if (!u) throw new Error('Benutzer nicht gefunden');
        email = u.email;
      }
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Login');
    }
    setSubmitting(false);
  };

  return (
    <div className="card mt-24 animate-fade-in-up">
      <div className="text-5xl text-center mb-1 select-none">🔐</div>
      <h2 className="text-2xl font-bold text-center text-primary-pink mb-1">Willkommen zurück!</h2>
      <p className="text-center text-primary-blue/80 mb-4 text-sm">Login für Liebe, Chats und deine gemeinsamen Erinnerungen.</p>
      <input
        className="input"
        placeholder="Email oder Username"
        value={emailOrUser}
        onChange={(e) => setEmailOrUser(e.target.value)}
        autoFocus
        autoComplete="username"
      />
      <div className="relative mt-3">
        <input
          className="input pr-10"
          type={showPass ? 'text' : 'password'}
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute right-3 top-2 text-lg text-primary-pink"
          onClick={() => setShowPass(!showPass)}
          tabIndex={-1}
        >
          {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="error bg-red-50 rounded px-2 py-1">{error}</p>}
      <button
        className="btn-google"
        onClick={handleGoogle}
        disabled={submitting}
      >
        <img src="/google-logo.svg" className="w-5 h-5" alt="Google" />
        <span>Google Login</span>
      </button>
      <button className="btn" onClick={handleLogin} disabled={submitting}>
        {submitting ? "..." : "Einloggen"}
      </button>
      <a href="/signup" className="block underline text-sm text-primary-blue/70 text-center hover:text-primary-pink mt-2">
        Noch kein Account?
      </a>
    </div>
  );
}
