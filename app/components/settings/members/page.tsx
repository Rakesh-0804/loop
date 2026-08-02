'use client';
import { useEffect, useState } from 'react';

type Member = { id: string; name: string; email: string; role: string };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/members');
    if (res.ok) {
      setMembers(await res.json());
    } else {
      setError('Could not load members');
    }
    setLoading(false);
  }

  async function updateRole(userId: string, role: string) {
    setError('');
    const res = await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to update role');
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, role } : m)));
  }

  if (loading) return <div className="p-8">Loading members...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Members</h1>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b">
              <td className="py-2">{m.name}</td>
              <td>{m.email}</td>
              <td>
                <select
                  value={m.role}
                  onChange={(e) => updateRole(m.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}