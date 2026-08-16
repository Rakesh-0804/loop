'use client';

import { useEffect, useState } from 'react';

type SentimentCounts = {
  POS: number;
  NEU: number;
  NEG: number;
};

type KeywordDriver = {
  keyword: string;
  frequency: number;
  impact: string;
};

type RiskFlag = {
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  count: number;
  description: string;
  channel: string;
};

type AnalysisData = {
  netSentimentIndex: number;
  csat: number;
  sentimentDistribution: SentimentCounts;
  sentimentByChannel: Record<string, SentimentCounts>;
  sentimentByTheme: Record<string, SentimentCounts>;
  keywordDrivers: {
    positive: KeywordDriver[];
    negative: KeywordDriver[];
  };
  riskFlags: RiskFlag[];
  totalAnalyzed: number;
  timeframe: string;
  channel: string;
};

const TIMEFRAMES = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
];

const CHANNELS = [
  { value: 'ALL', label: 'All Channels' },
  { value: 'support_ticket', label: 'Support Ticket' },
  { value: 'app_store', label: 'App Store' },
  { value: 'nps_survey', label: 'NPS Survey' },
  { value: 'sales_call', label: 'Sales Call' },
  { value: 'community_post', label: 'Community Post' },
];

const CHANNEL_LABELS: Record<string, string> = {
  support_ticket: 'Support Tickets 🎟️',
  app_store: 'App Store Reviews ⭐️',
  nps_survey: 'NPS Surveys 📈',
  sales_call: 'Sales Calls 📞',
  community_post: 'Community Posts 💬',
};

const RISK_ICONS: Record<string, string> = {
  BILLING_FAILURES: '💳',
  PERFORMANCE_BOTTLENECKS: '⚡',
  SUPPORT_DELAYS: '🎟️',
};

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState('30d');
  const [channel, setChannel] = useState('ALL');
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ timeframe, channel });
        const res = await fetch(`/api/analysis?${params.toString()}`);
        if (cancelled) return;
        if (res.ok) {
          setData(await res.json());
        } else {
          setError('Could not load analysis data.');
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('An unexpected error occurred.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [timeframe, channel]);

  function channelPct(counts: SentimentCounts): { pos: number; neu: number; neg: number } {
    const total = counts.POS + counts.NEU + counts.NEG;
    if (total === 0) return { pos: 0, neu: 0, neg: 0 };
    return {
      pos: Math.round((counts.POS / total) * 100),
      neu: Math.round((counts.NEU / total) * 100),
      neg: Math.round((counts.NEG / total) * 100),
    };
  }

  function exportCSV() {
    if (!data) return;

    const rows: string[][] = [];
    rows.push(['LOOP AI - Feedback Analysis Export']);
    rows.push(['Generated At', new Date().toISOString()]);
    rows.push(['Timeframe', data.timeframe]);
    rows.push(['Channel', data.channel]);
    rows.push([]);
    rows.push(['Net Sentiment Index', String(data.netSentimentIndex)]);
    rows.push(['CSAT', `${data.csat}%`]);
    rows.push(['Total Analyzed', String(data.totalAnalyzed)]);
    rows.push([]);
    rows.push(['Sentiment Distribution']);
    rows.push(['Positive', String(data.sentimentDistribution.POS)]);
    rows.push(['Neutral', String(data.sentimentDistribution.NEU)]);
    rows.push(['Negative', String(data.sentimentDistribution.NEG)]);
    rows.push([]);
    rows.push(['Sentiment By Channel']);
    rows.push(['Channel', 'Positive', 'Neutral', 'Negative']);
    Object.entries(data.sentimentByChannel).forEach(([ch, counts]) => {
      rows.push([CHANNEL_LABELS[ch] || ch, String(counts.POS), String(counts.NEU), String(counts.NEG)]);
    });
    rows.push([]);
    rows.push(['Keyword Drivers']);
    rows.push(['Type', 'Keyword', 'Frequency', 'Impact']);
    data.keywordDrivers.positive.forEach((k) => rows.push(['Positive', k.keyword, String(k.frequency), k.impact]));
    data.keywordDrivers.negative.forEach((k) => rows.push(['Negative', k.keyword, String(k.frequency), k.impact]));
    rows.push([]);
    rows.push(['Risk Flags']);
    rows.push(['Type', 'Severity', 'Count', 'Description', 'Channel']);
    data.riskFlags.forEach((r) =>
      rows.push([r.type, r.severity, String(r.count), r.description, CHANNEL_LABELS[r.channel] || r.channel])
    );

    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-export-${data.timeframe}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    if (!data) return;
    const payload = {
      meta: {
        product: 'LOOP AI Feedback Analysis',
        generatedAt: new Date().toISOString(),
        timeframe: data.timeframe,
        channel: data.channel,
        totalAnalyzed: data.totalAnalyzed,
      },
      metrics: {
        netSentimentIndex: data.netSentimentIndex,
        csat: data.csat,
        sentimentDistribution: data.sentimentDistribution,
      },
      sentimentByChannel: data.sentimentByChannel,
      sentimentByTheme: data.sentimentByTheme,
      keywordDrivers: data.keywordDrivers,
      riskFlags: data.riskFlags,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-export-${data.timeframe}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400">Computing deep analytics...</p>
        </div>
      </div>
    );
  }

  const totalCounts = data?.sentimentDistribution || { POS: 0, NEU: 0, NEG: 0 };
  const total = data?.totalAnalyzed || 0;
  const posPct = total > 0 ? Math.round((totalCounts.POS / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((totalCounts.NEU / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((totalCounts.NEG / total) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📈 Deep AI Analysis Hub</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Net sentiment intelligence, keyword drivers, theme distribution, and critical risk flags.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            ⬇ Export JSON
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}

      {/* Filters */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-2">Timeframe</span>
            <div className="flex items-center gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeframe === tf.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-px h-8 bg-white/10 self-center"></div>

          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-2">Channel</span>
            <div className="flex items-center gap-1 flex-wrap">
              {CHANNELS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setChannel(c.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    channel === c.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSAT & Net Sentiment Meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-panel p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Customer Satisfaction (CSAT)</span>
            <span className="text-2xl font-extrabold text-emerald-400">{data?.csat ?? 0}%</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${data?.csat ?? 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            Based on {total} analyzed feedback items · Positive share of total sentiment
          </p>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Net Sentiment Index</span>
            <span
              className={`text-2xl font-extrabold ${
                (data?.netSentimentIndex ?? 0) >= 20
                  ? 'text-emerald-400'
                  : (data?.netSentimentIndex ?? 0) <= -20
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`}
            >
              {(data?.netSentimentIndex ?? 0) >= 0 ? '+' : ''}
              {data?.netSentimentIndex ?? 0}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"></div>
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                (data?.netSentimentIndex ?? 0) >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.abs(data?.netSentimentIndex ?? 0))}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            Positive vs Negative ratio · Range -100 to +100
          </p>
        </div>
      </div>

      {/* Sentiment Distribution Bar */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Sentiment Distribution</h2>
          <span className="text-xs text-gray-400">{total} items analyzed</span>
        </div>

        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: `${posPct}%` }} className="bg-emerald-500 transition-all duration-500"></div>
          <div style={{ width: `${neuPct}%` }} className="bg-amber-500 transition-all duration-500"></div>
          <div style={{ width: `${negPct}%` }} className="bg-rose-500 transition-all duration-500"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs text-gray-400 block">Positive</span>
            <span className="text-xl font-bold text-emerald-400">{totalCounts.POS}</span>
            <span className="text-xs text-emerald-300/70 block">({posPct}%)</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-xs text-gray-400 block">Neutral</span>
            <span className="text-xl font-bold text-amber-400">{totalCounts.NEU}</span>
            <span className="text-xs text-amber-300/70 block">({neuPct}%)</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <span className="text-xs text-gray-400 block">Negative</span>
            <span className="text-xl font-bold text-rose-400">{totalCounts.NEG}</span>
            <span className="text-xs text-rose-300/70 block">({negPct}%)</span>
          </div>
        </div>
      </div>

      {/* Keyword Drivers Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">😊</span>
            <h2 className="text-base font-bold text-white">Positive Keyword Drivers</h2>
          </div>
          {data?.keywordDrivers.positive.length ? (
            <div className="space-y-3">
              {data.keywordDrivers.positive.map((kw) => {
                const max = data.keywordDrivers.positive[0]?.frequency || 1;
                return (
                  <div key={kw.keyword} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-200 capitalize">{kw.keyword}</span>
                      <span className="text-emerald-400">{kw.frequency} mentions</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(kw.frequency / max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No positive keyword signals found.</p>
          )}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">😟</span>
            <h2 className="text-base font-bold text-white">Negative Keyword Drivers</h2>
          </div>
          {data?.keywordDrivers.negative.length ? (
            <div className="space-y-3">
              {data.keywordDrivers.negative.map((kw) => {
                const max = data.keywordDrivers.negative[0]?.frequency || 1;
                return (
                  <div key={kw.keyword} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-200 capitalize">{kw.keyword}</span>
                      <span className="text-rose-400">{kw.frequency} mentions</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${(kw.frequency / max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">No negative keyword signals found.</p>
          )}
        </div>
      </div>

      {/* Sentiment by Channel & Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Sentiment by Channel</h2>
          {Object.keys(data?.sentimentByChannel || {}).length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No channel data available.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data?.sentimentByChannel || {}).map(([ch, counts]) => {
                const pcts = channelPct(counts);
                return (
                  <div key={ch} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{CHANNEL_LABELS[ch] || ch}</span>
                      <span className="text-gray-400">
                        {counts.POS} pos · {counts.NEU} neu · {counts.NEG} neg
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${pcts.pos}%` }} className="bg-emerald-500"></div>
                      <div style={{ width: `${pcts.neu}%` }} className="bg-amber-500"></div>
                      <div style={{ width: `${pcts.neg}%` }} className="bg-rose-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Sentiment by Theme</h2>
          {Object.keys(data?.sentimentByTheme || {}).length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No theme data available.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data?.sentimentByTheme || {}).map(([theme, counts]) => {
                const pcts = channelPct(counts);
                return (
                  <div key={theme} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-300">{theme}</span>
                      <span className="text-gray-400">
                        {counts.POS} pos · {counts.NEU} neu · {counts.NEG} neg
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${pcts.pos}%` }} className="bg-emerald-500"></div>
                      <div style={{ width: `${pcts.neu}%` }} className="bg-amber-500"></div>
                      <div style={{ width: `${pcts.neg}%` }} className="bg-rose-500"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Risk Flags */}
      <div className="glass-panel p-6 space-y-4 border-rose-500/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚨</span>
          <h2 className="text-base font-bold text-white">Critical Risk Flags</h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Urgency Monitor
          </span>
        </div>

        {data?.riskFlags.length ? (
          <div className="space-y-3">
            {data.riskFlags.map((flag) => (
              <div
                key={flag.type}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  flag.severity === 'HIGH'
                    ? 'bg-rose-500/10 border-rose-500/40'
                    : flag.severity === 'MEDIUM'
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-yellow-500/10 border-yellow-500/40'
                }`}
              >
                <span className="text-xl">{RISK_ICONS[flag.type] || '⚠️'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white capitalize">
                      {flag.type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        flag.severity === 'HIGH'
                          ? 'bg-rose-500/30 text-rose-300'
                          : flag.severity === 'MEDIUM'
                          ? 'bg-amber-500/30 text-amber-300'
                          : 'bg-yellow-500/30 text-yellow-300'
                      }`}
                    >
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{flag.description}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Affected items: {flag.count} · Channel: {CHANNEL_LABELS[flag.channel] || flag.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-4 text-center flex items-center justify-center gap-2">
            <span>✅</span> No critical risk flags detected in the current selection.
          </p>
        )}
      </div>
    </div>
  );
}