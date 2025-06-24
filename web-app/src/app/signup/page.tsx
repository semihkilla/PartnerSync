'use client';
import { useState } from 'react';
import { signUp } from '../../lib/auth';
import { createUserProfile, UserProfile } from '../../lib/user';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

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
    try {
      const cred = await signUp(form.email, form.password);
      const pairCode = 'PS-' + crypto.randomUUID().split('-')[0];
      const profile: UserProfile = {
        username: form.username,
        email: form.email,
        pairCode,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        age: form.age ? Number(form.age) : undefined,
        photoURL: cred.user.photoURL || undefined,
      };
      await createUserProfile(cred.user.uid, profile);
      alert('Your pair code: ' + pairCode);
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
      <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      <input className="input" name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} />
      <input className="input" name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} />
      <input className="input" name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} />
      {error && <p className="error">{error}</p>}
      <button className="btn" onClick={handleSubmit}>Sign Up</button>
      <a href="/login" className="underline text-sm text-center">Already have an account?</a>
    </div>
  );
}
