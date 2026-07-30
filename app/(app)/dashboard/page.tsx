'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Feedback = {
  id: string;
  content: string;
  channel: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const total = items.length;
  const newCount = items.filter((i) => i.status === 'NEW').length;
  const reviewedCount = items.filter((i) => i.status === 'REVIEWED').length;
  const actionedCount = items.filter((i) => i.status === 'ACTIONED').length;
  const recent = items.slice(0, 5);

  const statusColor: Record<string, string> = {
    NEW: 'bg-amber-100 text-amber-700',
    REVIEWED: 'bg-blue-100 text-blue-700',
    ACTIONED: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      <p className="text-slate-500 mt-1">Welcome back — here's your feedback at a glance.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Feedback" value={total} loading={loading} />
        <StatCard label="New" value={newCount} loading={loading} accent="text-amber-600" />
        <StatCard label="Reviewed" value={reviewedCount} loading={loading} accent="text-blue-600" />
        <StatCard label="Actioned" value={actionedCount} loading={loading} accent="text-emerald-600" />
      </div>

      {/* Recent feedback */}
      <div className="bg-white rounded-xl border border-slate-200 mt-8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Recent Feedback</h3>
          <Link href="/inbox" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-slate-400 text-sm">
            No feedback yet.{' '}
            <Link href="/inbox" className="text-blue-600 hover:underline">
              Add your first item
            </Link>
            .
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((item) => (
              <li key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-800">{item.content}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.channel}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColor[item.status]}`}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Placeholder note for future AI features */}
      <div className="mt-6 text-sm text-slate-400 border border-dashed border-slate-300 rounded-xl p-4">
        Sentiment analysis, theme trends, and reports will appear here once AI classification is built (Week 3–4).
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  accent = 'text-slate-900',
}: {
  label: string;
  value: number;
  loading: boolean;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{loading ? '—' : value}</p>
    </div>
  );
}