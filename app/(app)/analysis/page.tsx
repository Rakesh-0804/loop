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

type TrendPoint = {
  date: string;
  pos: number;
  neu: number;
  neg: number;
  total: number;
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
  trendData?: TrendPoint[];
  totalAnalyzed: number;
  timeframe: string;
  channel: string;
};

const TIMEFRAMES = [
  { value: '7d', label: 'Past 7 Days' },
  { value: '30d', label: 'Past 30 Days' },
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
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'pie' | 'bar'>('both');

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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
          <p className="text-sm text-gray-400">Computing deep AI analytics & rendering charts...</p>
        </div>
      </div>
    );
  }

  const totalCounts = data?.sentimentDistribution || { POS: 0, NEU: 0, NEG: 0 };
  const total = data?.totalAnalyzed || 0;
  const posPct = total > 0 ? Math.round((totalCounts.POS / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((totalCounts.NEU / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((totalCounts.NEG / total) * 100) : 0;

  // SVG Pie/Donut Chart calculation
  const circumference = 2 * Math.PI * 40; // r=40
  const posStroke = (posPct / 100) * circumference;
  const neuStroke = (neuPct / 100) * circumference;
  const negStroke = (negPct / 100) * circumference;

  const neuOffset = circumference - posStroke;
  const negOffset = circumference - (posStroke + neuStroke);

  const trendPoints = data?.trendData || [];
  const maxTrendVal = Math.max(1, ...trendPoints.map((t) => t.total));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>📈 Deep AI Analytics Hub</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time sentiment charts, 7 & 30-day response trends, keyword drivers, and critical risk flags.
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

      {/* Filter Bar with Past 7 Days & 30 Days Selector */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-500 block mb-2">Time Period Filter</span>
              <div className="flex items-center gap-1">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      timeframe === tf.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
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
              <span className="text-xs font-semibold text-gray-500 block mb-2">Channel Filter</span>
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

          {/* Chart View Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveChartTab('both')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                activeChartTab === 'both' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All Visuals
            </button>
            <button
              onClick={() => setActiveChartTab('pie')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                activeChartTab === 'pie' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Pie Chart
            </button>
            <button
              onClick={() => setActiveChartTab('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                activeChartTab === 'bar' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Bar Chart
            </button>
          </div>
        </div>
      </div>

      {/* CSAT & Net Sentiment Metric Meters */}
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
            Based on {total} analyzed feedback items in {timeframe === '7d' ? 'Past 7 Days' : timeframe === '30d' ? 'Past 30 Days' : 'All Time'}
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
            Positive vs Negative score spread · Range -100 to +100
          </p>
        </div>
      </div>

      {/* Visual Charts Grid: Interactive Pie Chart & Response Trend Bar Chart */}
      {(activeChartTab === 'both' || activeChartTab === 'pie' || activeChartTab === 'bar') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 🥧 1. Interactive Pie / Donut Chart */}
          {(activeChartTab === 'both' || activeChartTab === 'pie') && (
            <div className="glass-panel p-6 space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🥧 Sentiment Distribution Pie Chart</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Breakdown for {timeframe === '7d' ? 'Past 7 Days' : timeframe === '30d' ? 'Past 30 Days' : 'All Time'} ({total} feedbacks)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {timeframe.toUpperCase()}
                </span>
              </div>

              {/* Pie/Donut Chart SVG Graphic */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="16" fill="transparent" />

                    {/* Positive Segment (Emerald) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#10b981"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${posStroke} ${circumference}`}
                      strokeDashoffset="0"
                      className="transition-all duration-700 hover:opacity-80"
                    />

                    {/* Neutral Segment (Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${neuStroke} ${circumference}`}
                      strokeDashoffset={`-${posStroke}`}
                      className="transition-all duration-700 hover:opacity-80"
                    />

                    {/* Negative Segment (Rose) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f43f5e"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${negStroke} ${circumference}`}
                      strokeDashoffset={`-${posStroke + neuStroke}`}
                      className="transition-all duration-700 hover:opacity-80"
                    />
                  </svg>
                  {/* Center Stat Callout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-white">{data?.csat ?? 0}%</span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">CSAT Score</span>
                  </div>
                </div>

                {/* Pie Chart Legend */}
                <div className="space-y-3 w-full sm:w-auto">
                  <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-semibold text-gray-200">Positive 😊</span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-300">
                      {totalCounts.POS} ({posPct}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-semibold text-gray-200">Neutral 😐</span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-300">
                      {totalCounts.NEU} ({neuPct}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-6 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="text-xs font-semibold text-gray-200">Negative 🔴</span>
                    </div>
                    <span className="text-xs font-extrabold text-rose-300">
                      {totalCounts.NEG} ({negPct}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📊 2. Interactive Feedback Volume & Response Trend Bar Chart */}
          {(activeChartTab === 'both' || activeChartTab === 'bar') && (
            <div className="glass-panel p-6 space-y-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📊 Feedback Response Trend Bar Chart</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Daily sentiment response volume over the {timeframe === '7d' ? 'Past 7 Days' : 'Past 30 Days'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded bg-emerald-500"></span> POS</span>
                  <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded bg-amber-500"></span> NEU</span>
                  <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded bg-rose-500"></span> NEG</span>
                </div>
              </div>

              {/* Bar Chart Container */}
              <div className="h-48 w-full flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-white/10 px-1">
                {trendPoints.slice(-14).map((pt, idx) => {
                  const barHeightPct = Math.max(8, Math.round((pt.total / maxTrendVal) * 100));
                  const posPctBar = pt.total > 0 ? (pt.pos / pt.total) * 100 : 0;
                  const neuPctBar = pt.total > 0 ? (pt.neu / pt.total) * 100 : 0;
                  const negPctBar = pt.total > 0 ? (pt.neg / pt.total) * 100 : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-1.5 rounded border border-white/20 z-10 pointer-events-none whitespace-nowrap font-mono shadow-lg">
                        {pt.date}: {pt.total} items ({pt.pos} pos / {pt.neg} neg)
                      </div>

                      {/* Stacked Bar */}
                      <div
                        className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-500 group-hover:brightness-125"
                        style={{ height: `${barHeightPct}%` }}
                      >
                        <div style={{ height: `${posPctBar}%` }} className="bg-emerald-500 w-full"></div>
                        <div style={{ height: `${neuPctBar}%` }} className="bg-amber-500 w-full"></div>
                        <div style={{ height: `${negPctBar}%` }} className="bg-rose-500 w-full"></div>
                      </div>

                      {/* Date Axis Label */}
                      <span className="text-[10px] text-gray-500 font-mono truncate w-full text-center">
                        {pt.date.split(' ')[1] || pt.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Critical Risk Flags */}
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