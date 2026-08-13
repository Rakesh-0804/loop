'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [demoText, setDemoText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<{ sentiment: string; score: number; themes: string[] } | null>(null);

  const sampleTexts = [
    "The new dashboard is insanely fast! Saved our support agents 10 hours this week.",
    "Billing system is super confusing. Invoice generated with incorrect tax line.",
    "Can you please add automatic PDF export for executive reports?",
  ];

  function runDemoAnalysis(textToAnalyze?: string) {
    const target = textToAnalyze || demoText;
    if (!target.trim()) return;
    setAnalyzing(true);

    setTimeout(() => {
      const lower = target.toLowerCase();
      let sentiment = 'NEU';
      let score = 0.65;
      const themes = [];

      if (lower.includes('fast') || lower.includes('insanely') || lower.includes('saved') || lower.includes('love') || lower.includes('great')) {
        sentiment = 'POS';
        score = 0.95;
      } else if (lower.includes('confusing') || lower.includes('incorrect') || lower.includes('slow') || lower.includes('bug') || lower.includes('fail')) {
        sentiment = 'NEG';
        score = 0.18;
      }

      if (lower.includes('speed') || lower.includes('fast') || lower.includes('dashboard')) themes.push('Performance & Speed');
      if (lower.includes('billing') || lower.includes('invoice') || lower.includes('tax')) themes.push('Billing & Subscriptions');
      if (lower.includes('pdf') || lower.includes('export') || lower.includes('report') || lower.includes('add')) themes.push('Feature Requests');
      if (themes.length === 0) themes.push('Customer Usability');

      setDemoResult({ sentiment, score, themes });
      setAnalyzing(false);
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Nav */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/25">
            ∞
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Project LOOP <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI Platform</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-pulse">
          <span>✨ Next-Gen AI Feedback Intelligence</span>
          <span>→</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Turn Multi-Channel Customer Feedback Into{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            Real-Time Product Action
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl leading-relaxed mb-10">
          Unify customer tickets, app store reviews, NPS surveys, and sales calls. Automatically extract sentiment scores, detect recurring theme clusters, and generate executive summaries in seconds.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <span>Open Demo Dashboard</span>
            <span>→</span>
          </Link>
          <Link
            href="/signup"
            className="px-8 py-4 rounded-xl text-base font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-gray-200 border border-white/10 transition-all"
          >
            Create Free Account
          </Link>
        </div>

        {/* Live Interactive AI Playground Widget */}
        <div className="w-full max-w-3xl glass-panel p-6 text-left shadow-2xl relative overflow-hidden border border-indigo-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <span>⚡ Live AI Playground Demo</span>
            </h3>
            <span className="text-xs text-gray-400">Try analyzing customer feedback live</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDemoText(sample);
                  runDemoAnalysis(sample);
                }}
                className="text-xs bg-white/5 hover:bg-indigo-500/20 text-gray-300 hover:text-indigo-200 px-3 py-1.5 rounded-lg border border-white/10 transition-all"
              >
                Sample #{idx + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Paste any raw feedback text here..."
              className="flex-1 glass-input text-sm"
              onKeyDown={(e) => e.key === 'Enter' && runDemoAnalysis()}
            />
            <button
              onClick={() => runDemoAnalysis()}
              disabled={analyzing}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
            >
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {demoResult && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  demoResult.sentiment === 'POS' ? 'badge-pos' : demoResult.sentiment === 'NEG' ? 'badge-neg' : 'badge-neu'
                }`}>
                  {demoResult.sentiment === 'POS' ? 'Positive 😊' : demoResult.sentiment === 'NEG' ? 'Negative 🔴' : 'Neutral 😐'}
                </span>
                <span className="text-xs text-gray-400">
                  Sentiment Score: <strong className="text-white">{(demoResult.score * 100).toFixed(0)}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400">Detected Themes:</span>
                {demoResult.themes.map((t, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">Complete Feedback Intelligence Engine</h2>
          <p className="text-gray-400">Built for modern product, engineering, and customer success teams.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 flex flex-col justify-between hover:border-indigo-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Track Net Sentiment Index, positive ratio, channel volumes, and open action items in real time.
              </p>
            </div>
            <Link href="/dashboard" className="mt-6 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>View Dashboard</span>
              <span>→</span>
            </Link>
          </div>

          <div className="glass-panel p-6 flex flex-col justify-between hover:border-purple-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl mb-4">
                📥
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unified Feedback Inbox</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Centralize Support Tickets, App Store Reviews, Sales Notes, and NPS into one searchable workspace.
              </p>
            </div>
            <Link href="/inbox" className="mt-6 text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              <span>Open Inbox</span>
              <span>→</span>
            </Link>
          </div>

          <div className="glass-panel p-6 flex flex-col justify-between hover:border-cyan-500/40">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mb-4">
                🏷️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Theme Clustering</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatically group incoming customer issues by topic clusters like UI/UX, Billing, and Performance.
              </p>
            </div>
            <Link href="/themes" className="mt-6 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Explore Themes</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-6 text-center text-gray-500 text-sm">
        <p>© 2026 Project LOOP. AI Customer Feedback Intelligence Platform.</p>
      </footer>
    </div>
  );
}
