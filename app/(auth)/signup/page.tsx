'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        let message = 'Signup failed';
        if (typeof data.error === 'string') {
          message = data.error;
        } else if (data.error?.formErrors?.[0]) {
          message = data.error.formErrors[0];
        } else if (data.error?.fieldErrors) {
          const firstField = Object.values(data.error.fieldErrors)[0] as string[] | undefined;
          if (firstField?.[0]) message = firstField[0];
        }
        setError(message);
        return;
      }

      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setError('An error occurred while creating your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25">
              ∞
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Project LOOP
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-200">Create Your Workspace</h1>
          <p className="text-xs text-gray-400">Start organizing and analyzing customer feedback with AI.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-4 border-indigo-500/30">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Your Full Name</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="Alex Mercer"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Workspace Name</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="Acme Corp"
              value={form.workspaceName}
              onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Work Email</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="alex@company.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Password</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="Minimum 6 characters"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <button
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer text-sm"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Workspace...' : 'Create Account & Workspace'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}