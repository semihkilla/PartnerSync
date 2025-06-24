'use client';
import { useState, useEffect } from 'react';
import { signUp } from '../../lib/auth';
import { createUserProfile, UserProfile, getUserByPairCode } from '../../lib/user';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/auth';

export default function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    firstName: '',
    lastName: '',
    birthday: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const generateCode = async () => {
    let code = '';
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (await getUserByPairCode(code));
    return code;
  };

  useEffect(() => {
    if (auth.currentUser) router.replace('/');
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.email.includes('@')) {
      setError('Invalid email');
      return;
    }
    if (!form.username.trim() || !form.password.trim()) {
      setError('Username and password required');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.password2) {
      setError('Passwords do not match');
      return;
    }
    try {
      const cred = await signUp(form.email, form.password);
      const pairCode = 'PS-' + (await generateCode());
      const profile: UserProfile = {
        username: form.username,
        email: form.email,
        pairCode,
        photoURL: cred.user.photoURL ?? '',
        ...(form.firstName ? { firstName: form.firstName } : {}),
        ...(form.lastName ? { lastName: form.lastName } : {}),
        ...(form.birthday ? { birthday: form.birthday } : {}),
      };
      await createUserProfile(cred.user.uid, profile);
      alert('Erfolgreich registriert. Dein Code: ' + pairCode);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to sign up');
    }
  };

  return (
    <div className="card flex flex-col gap-4">
      <input className="input" name="username" placeholder="Username" value={form.username} onChange={handleChange} />
      <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <div className="relative">
        <input
          className="input pr-10 w-full"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <button
          type="button"
          className="absolute right-2 top-2 text-xl"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <input
        className="input"
        name="password2"
        type={showPassword ? 'text' : 'password'}
        placeholder="Repeat Password"
        value={form.password2}
        onChange={handleChange}
      />
      <input className="input" name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} />
      <input className="input" name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} />
      <input className="input" name="birthday" type="date" placeholder="Birthday" value={form.birthday} onChange={handleChange} />
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={handleSubmit}>Sign Up</button>
      <a href="/login" className="underline text-sm text-center">Already have an account?</a>
    </div>
  );
}
