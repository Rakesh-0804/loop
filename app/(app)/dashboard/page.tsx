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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-slate-500">
            Welcome back — here's your feedback at a glance.
          </p>
        </div>

        <Link
          href="/feedback"
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Feedback Management
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Feedback"
          value={total}
          loading={loading}
        />

        <StatCard
          label="New"
          value={newCount}
          loading={loading}
          accent="text-amber-600"
        />

        <StatCard
          label="Reviewed"
          value={reviewedCount}
          loading={loading}
          accent="text-blue-600"
        />

        <StatCard
          label="Actioned"
          value={actionedCount}
          loading={loading}
          accent="text-emerald-600"
        />
      </div>

      {/* Recent Feedback */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Feedback
          </h2>

          <Link
            href="/feedback"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All Feedback →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">
            Loading...
          </p>
        ) : recent.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">
              No feedback has been added yet.
            </p>

            <Link
              href="/feedback"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Add First Feedback
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {item.content}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.channel}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor[item.status]}`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Placeholder */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
        <h3 className="mb-2 font-semibold text-slate-700">
          AI Insights
        </h3>

        <p className="text-sm text-slate-500">
          Sentiment analysis, keyword extraction, trend detection,
          smart categorization, and AI-generated reports will appear
          here once the AI engine is integrated.
        </p>
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-bold ${accent}`}>
        {loading ? '—' : value}
      </p>
    </div>
  );
}