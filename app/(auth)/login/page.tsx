'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { ...form, redirect: false });
    if (res?.error) {
      setError('Invalid email or password');
      return;
    }
    router.push('/dashboard');
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded w-full" type="submit">Log in</button>
      </form>
    </div>
  );
}