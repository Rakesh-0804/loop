'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

type Profile = {
  id: string;
  name: string;
  email: string;
  role: string;
  workspaceId: string;
  workspace?: { id: string; name: string } | null;
};

type FieldErrors = Record<string, string[]>;

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  ANALYST: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  VIEWER: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState<FieldErrors>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState<FieldErrors>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/user/profile');
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setName(data.name || '');
        } else {
          setError('Could not load profile');
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError({});
    setNameSaved(false);
    setNameSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameError(data.fieldErrors || {});
        return;
      }
      setProfile((prev) => (prev ? { ...prev, name: data.name } : prev));
      setNameSaved(true);
    } catch {
      setNameError({ name: ['Something went wrong. Please try again.'] });
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError({});
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordError({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.fieldErrors || {});
        return;
      }
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError({ _: ['Something went wrong. Please try again.'] });
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 md:p-8 text-center text-gray-400 text-sm">Loading profile...</div>;
  }

  if (error || !profile) {
    return <div className="p-6 md:p-8 text-center text-rose-400 text-sm">{error || 'Profile unavailable'}</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>My Profile & Security</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal details, workspace, and password.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings/members"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 transition-all cursor-pointer"
          >
            👥 Team Members
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Account Overview</h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{profile.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${ROLE_STYLES[profile.role] || ROLE_STYLES.VIEWER}`}>
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-mono">{profile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Workspace</p>
            <p className="text-sm font-semibold text-white">{profile.workspace?.name || 'My Workspace'}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-1 break-all">{profile.workspaceId}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member ID</p>
            <p className="text-[11px] text-gray-400 font-mono break-all">{profile.id}</p>
          </div>
        </div>
      </div>

      {/* Update Display Name */}
      <form onSubmit={handleSaveName} className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Update Display Name</h3>
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">Full Name</label>
          <input
            className="glass-input w-full text-sm"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError({});
              setNameSaved(false);
            }}
            required
          />
          {nameError.name?.map((msg) => (
            <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
          ))}
          {nameSaved && <p className="text-xs text-emerald-400 font-medium mt-1">Display name updated.</p>}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={nameSaving}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {nameSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handleChangePassword} className="glass-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Change Password</h3>
        <p className="text-xs text-gray-500">Use at least 8 characters with one uppercase letter and one number.</p>

        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">Current Password</label>
          <input
            className="glass-input w-full text-sm"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setPasswordError({});
              setPasswordMessage('');
            }}
            required
          />
          {passwordError.currentPassword?.map((msg) => (
            <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">New Password</label>
          <input
            className="glass-input w-full text-sm"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordError({});
              setPasswordMessage('');
            }}
            required
          />
          {passwordError.newPassword?.map((msg) => (
            <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
          ))}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-1">Confirm New Password</label>
          <input
            className={`glass-input w-full text-sm ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-500/50' : ''}`}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordError({});
              setPasswordMessage('');
            }}
            required
          />
          {passwordError.confirmPassword?.map((msg) => (
            <p key={msg} className="text-xs text-rose-400 font-medium mt-1">{msg}</p>
          ))}
          {confirmPassword && confirmPassword !== newPassword && (
            <p className="text-xs text-rose-400 font-medium mt-1">Passwords do not match</p>
          )}
        </div>

        {passwordMessage && <p className="text-xs text-emerald-400 font-medium">{passwordMessage}</p>}
        {passwordError._?.map((msg) => (
          <p key={msg} className="text-xs text-rose-400 font-medium">{msg}</p>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}