'use client';

import { useEffect, useState } from 'react';

type Member = { id: string; name: string; email: string; role: string };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [password, setPassword] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        setMembers(await res.json());
      } else {
        setError('Could not load members');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role, password: password || 'password123' }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to add member');
      return;
    }

    setName('');
    setEmail('');
    setPassword('');
    setShowInviteForm(false);
    load();
  }

  async function updateRole(userId: string, newRole: string) {
    setError('');
    const res = await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update role');
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)));
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Workspace Members & Permissions</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your team access, assign roles, and invite analysts to Acme SaaS Corp workspace.
          </p>
        </div>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          {showInviteForm ? '✕ Close Form' : '+ Invite Team Member'}
        </button>
      </div>

      {/* Invite Member Drawer */}
      {showInviteForm && (
        <form onSubmit={handleAddMember} className="glass-panel p-6 space-y-4 border-indigo-500/40 animate-fadeIn">
          <h3 className="text-base font-bold text-white">Invite New Team Member</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Lee"
                className="glass-input w-full text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="jordan@company.com"
                className="glass-input w-full text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Access Role</label>
              <select
                className="glass-input w-full text-sm cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ADMIN" className="bg-slate-900">Admin (Full Access)</option>
                <option value="ANALYST" className="bg-slate-900">Analyst (Edit & AI Analysis)</option>
                <option value="VIEWER" className="bg-slate-900">Viewer (Read Only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Password (Default: password123)</label>
            <input
              type="text"
              placeholder="password123"
              className="glass-input w-full text-sm font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInviteForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Send Invite
            </button>
          </div>
        </form>
      )}

      {/* Members Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading workspace members...</div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5">
                  <th className="py-3.5 px-6">Member Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                        {m.name.charAt(0)}
                      </div>
                      <span>{m.name}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-300 font-mono text-xs">{m.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                          m.role === 'ADMIN'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : m.role === 'ANALYST'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={m.role}
                        onChange={(e) => updateRole(m.id, e.target.value)}
                        className="glass-input text-xs py-1 px-2.5 rounded-lg cursor-pointer"
                      >
                        <option value="ADMIN" className="bg-slate-900">Admin</option>
                        <option value="ANALYST" className="bg-slate-900">Analyst</option>
                        <option value="VIEWER" className="bg-slate-900">Viewer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}