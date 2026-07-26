'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] || data.error || 'Signup failed');
      return;
    }
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/dashboard');
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Create your workspace</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Your name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Workspace name" value={form.workspaceName}
          onChange={(e) => setForm({ ...form, workspaceName: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded w-full" type="submit">Sign up</button>
      </form>
    </div>
  );
}