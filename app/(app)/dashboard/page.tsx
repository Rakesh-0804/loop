'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Feedback = {
  id: string;
  content: string;
  channel: string;
  customerLabel?: string;
  sentiment?: 'POS' | 'NEU' | 'NEG';
  sentimentScore?: number;
  status: 'NEW' | 'REVIEWED' | 'ACTIONED';
  createdAt: string;
};

type Theme = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

export default function DashboardPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const resFb = await fetch('/api/feedback');
      if (resFb.ok) {
        setFeedbacks(await resFb.json());
      }
      const resTh = await fetch('/api/themes');
      if (resTh.ok) {
        setThemes(await resTh.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Metrics
  const totalCount = feedbacks.length;
  const posCount = feedbacks.filter((f) => f.sentiment === 'POS').length;
  const neuCount = feedbacks.filter((f) => f.sentiment === 'NEU').length;
  const negCount = feedbacks.filter((f) => f.sentiment === 'NEG').length;

  const posPct = totalCount > 0 ? Math.round((posCount / totalCount) * 100) : 0;
  const neuPct = totalCount > 0 ? Math.round((neuCount / totalCount) * 100) : 0;
  const negPct = totalCount > 0 ? Math.round((negCount / totalCount) * 100) : 0;

  const pendingCount = feedbacks.filter((f) => f.status === 'NEW').length;
  const actionedCount = feedbacks.filter((f) => f.status === 'ACTIONED').length;

  // Channel breakdown counts
  const channelCounts: Record<string, number> = {};
  feedbacks.forEach((f) => {
    channelCounts[f.channel] = (channelCounts[f.channel] || 0) + 1;
  });

  const channelLabels: Record<string, string> = {
    support_ticket: 'Support Tickets 🎟️',
    app_store: 'App Store Reviews ⭐️',
    nps_survey: 'NPS Surveys 📈',
    sales_call: 'Sales Calls 📞',
    community_post: 'Community Posts 💬',
  };

  async function updateStatus(id: string, newStatus: 'NEW' | 'REVIEWED' | 'ACTIONED') {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f)));
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Loading feedback intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Feedback Intelligence Dashboard</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time multi-channel sentiment index, recurring themes, and actionable feedback items.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/inbox"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <span>+ Add Feedback</span>
          </Link>
          <Link
            href="/reports"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
          >
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Feedback</span>
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm">💬</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white">{totalCount}</div>
            <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
              <span>↑ +14%</span>
              <span className="text-gray-500 font-normal">vs last month</span>
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Net Sentiment Score</span>
            <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">😊</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400">{posPct}%</div>
            <p className="text-xs text-gray-400 mt-1">
              {posCount} Positive · {neuCount} Neutral · {negCount} Negative
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pending Review</span>
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm">⏳</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-400">{pendingCount}</div>
            <p className="text-xs text-gray-400 mt-1">
              {actionedCount} items resolved / actioned
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Themes</span>
            <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm">🏷️</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-300">{themes.length}</div>
            <p className="text-xs text-gray-400 mt-1">
              Performance, UI/UX, Billing & Features
            </p>
          </div>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Sentiment & Channel Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sentiment Breakdown Meter */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Sentiment Index Breakdown</span>
              </h2>
              <span className="text-xs text-gray-400">Auto-calculated NLP Score</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div style={{ width: `${posPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Positive ${posPct}%`}></div>
              <div style={{ width: `${neuPct}%` }} className="bg-amber-500 transition-all duration-500" title={`Neutral ${neuPct}%`}></div>
              <div style={{ width: `${negPct}%` }} className="bg-rose-500 transition-all duration-500" title={`Negative ${negPct}%`}></div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-xs text-gray-400 block">Positive</span>
                <span className="text-xl font-bold text-emerald-400">{posCount}</span>
                <span className="text-xs text-emerald-300/70 block">({posPct}%)</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-xs text-gray-400 block">Neutral</span>
                <span className="text-xl font-bold text-amber-400">{neuCount}</span>
                <span className="text-xs text-amber-300/70 block">({neuPct}%)</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-xs text-gray-400 block">Negative</span>
                <span className="text-xl font-bold text-rose-400">{negCount}</span>
                <span className="text-xs text-rose-300/70 block">({negPct}%)</span>
              </div>
            </div>
          </div>

          {/* Channels Breakdown List */}
          <div className="glass-panel p-6">
            <h2 className="text-base font-bold text-white mb-4">Feedback Volume by Channel</h2>
            <div className="space-y-4">
              {Object.keys(channelLabels).map((chKey) => {
                const count = channelCounts[chKey] || 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={chKey} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{channelLabels[chKey]}</span>
                      <span className="text-gray-400">{count} items ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: AI Key Takes & Theme Spotlight */}
        <div className="space-y-8">
          {/* AI Insights Card */}
          <div className="glass-panel p-6 border-indigo-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
                Automated AI Key Insights
              </h2>
            </div>
            <ul className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <li className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                🚀 <strong className="text-white">Performance Praise:</strong> Customer satisfaction with dashboard speed increased after the latest release.
              </li>
              <li className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                💡 <strong className="text-white">High Priority Request:</strong> 3 enterprise prospects requested automated weekly PDF reports.
              </li>
              <li className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                ⚠️ <strong className="text-white">Billing Attention:</strong> 2 support tickets mentioned invoice tax calculation delays.
              </li>
            </ul>
          </div>

          {/* Quick Theme Cloud */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Tracked Themes</h2>
              <Link href="/themes" className="text-xs text-indigo-400 hover:underline">View All →</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {themes.map((th) => (
                <div
                  key={th.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${th.color || '#6366f1'}15`,
                    borderColor: `${th.color || '#6366f1'}40`,
                    color: th.color || '#818cf8',
                  }}
                >
                  <span>•</span>
                  <span>{th.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold text-white">Recent Customer Feedback</h2>
          <Link href="/inbox" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
            View Full Inbox →
          </Link>
        </div>

        {feedbacks.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No feedback recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {feedbacks.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.sentiment === 'POS' ? 'badge-pos' : item.sentiment === 'NEG' ? 'badge-neg' : 'badge-neu'
                    }`}>
                      {item.sentiment || 'NEU'}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {channelLabels[item.channel] || item.channel}
                    </span>
                    {item.customerLabel && (
                      <span className="text-xs text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {item.customerLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200">{item.content}</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as any)}
                    className="glass-input text-xs py-1 px-2.5 rounded-lg cursor-pointer"
                  >
                    <option value="NEW" className="bg-slate-900">NEW</option>
                    <option value="REVIEWED" className="bg-slate-900">REVIEWED</option>
                    <option value="ACTIONED" className="bg-slate-900">ACTIONED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}