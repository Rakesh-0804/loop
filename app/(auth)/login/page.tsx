'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: 'admin@projectloop.ai', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', { ...form, redirect: false });
      if (res?.error) {
        setError('Invalid email or password. Try demo credentials below.');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemoUser(email: string) {
    setForm({ email, password: 'password123' });
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25">
              ∞
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Project LOOP
            </span>
          </Link>
          <h1 className="text-xl font-bold text-gray-200">Welcome Back</h1>
          <p className="text-xs text-gray-400">Sign in to your customer feedback intelligence workspace.</p>
        </div>

        {/* Login Form Panel */}
        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5 border-indigo-500/30">
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="name@company.com"
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
              placeholder="••••••••"
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
            className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer text-sm"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Demo User Quick Fill Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 block text-center uppercase tracking-wider">
              Quick Fill Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoUser('admin@projectloop.ai')}
                className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-200 border border-white/10 transition-all text-left"
              >
                <span className="font-semibold block text-white">Admin Demo</span>
                <span className="text-[10px] text-gray-400">admin@projectloop.ai</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoUser('analyst@projectloop.ai')}
                className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-200 border border-white/10 transition-all text-left"
              >
                <span className="font-semibold block text-white">Analyst Demo</span>
                <span className="text-[10px] text-gray-400">analyst@projectloop.ai</span>
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">
            Create workspace
          </Link>
        </p>
      </div>
    </div>
  );
}