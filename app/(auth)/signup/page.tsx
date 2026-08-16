'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

type FieldErrors = Record<string, string[]>;

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', workspaceName: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: [] }));
  }

  function passwordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'];
    return { score, label: labels[score], color: colors[score] };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          workspaceName: form.workspaceName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        let message = 'Signup failed';
        if (typeof data.error === 'string') {
          message = data.error;
        } else if (data.error?.formErrors?.[0]) {
          message = data.error.formErrors[0];
        }
        setError(message);
        return;
      }

      await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred while creating your account.');
    } finally {
      setLoading(false);
    }
  }

  const strength = passwordStrength(form.password);
  const strengthSegments = [1, 2, 3, 4];
  const confirmMatches = form.confirmPassword === '' || form.confirmPassword === form.password;

  return (
    <div className="min-h-screen text-white flex flex-col justify-center items-center p-6 relative z-10">
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
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            {fieldErrors.name?.map((msg) => (
              <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Workspace Name</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="Acme Corp"
              value={form.workspaceName}
              onChange={(e) => updateField('workspaceName', e.target.value)}
              required
            />
            {fieldErrors.workspaceName?.map((msg) => (
              <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Work Email</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="alex@company.com"
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
            {fieldErrors.email?.map((msg) => (
              <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Password</label>
            <input
              className="glass-input w-full text-sm"
              placeholder="Minimum 8 characters"
              type="password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1.5">
                  {strengthSegments.map((seg) => (
                    <div
                      key={seg}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        strength.score >= seg ? strength.color : 'bg-white/10'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 inline-block">
                  Strength: <span className={`font-semibold ${strength.score >= 3 ? 'text-emerald-400' : strength.score >= 2 ? 'text-amber-400' : 'text-rose-400'}`}>{strength.label}</span>
                </span>
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-1">
              Use at least 8 characters with one uppercase letter and one number.
            </p>
            {fieldErrors.password?.map((msg) => (
              <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Confirm Password</label>
            <input
              className={`glass-input w-full text-sm ${form.confirmPassword && !confirmMatches ? 'border-rose-500/50' : ''}`}
              placeholder="Re-enter your password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              required
            />
            {fieldErrors.confirmPassword?.map((msg) => (
              <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
            ))}
            {form.confirmPassword && !confirmMatches && (
              <p className="text-xs text-rose-400 font-medium mt-1">Passwords do not match</p>
            )}
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