'use client';

import { useState } from 'react';

type ReviewItem = {
  author: string;
  rating: number;
  content: string;
  sentiment: 'POS' | 'NEU' | 'NEG';
  sentimentScore: number;
  themes: string[];
  date: string;
};

type AnalysisResult = {
  businessName: string;
  businessCategory: string;
  overallRating: number;
  totalReviewsExtracted: number;
  csatScore: number;
  netSentimentIndex: number;
  executiveSummary: string;
  topPositives: string[];
  criticalPainPoints: string[];
  extractedReviews: ReviewItem[];
};

const SAMPLE_URLS = [
  { label: '📍 Taj Mahal Palace Hotel (Google Maps)', url: 'https://maps.app.goo.gl/TajMahalPalaceMumbai', name: 'Taj Mahal Palace Hotel' },
  { label: '🏨 Grand Plaza Resort (TripAdvisor)', url: 'https://www.tripadvisor.com/Hotel_Review-Grand_Plaza_Resort_Spa', name: 'Grand Plaza Resort & Spa' },
  { label: '🏖️ Coastal Breeze Suites (Booking.com)', url: 'https://www.booking.com/hotel/us/coastal-breeze-suite-boutique', name: 'Coastal Breeze Boutique Resort' },
  { label: '🍽️ Metro Bistro & Lounge (Google Reviews)', url: 'https://www.google.com/maps/place/Metro_Bistro_Grand_Restaurant', name: 'Metro Bistro & Lounge' },
];

export default function URLReviewAnalyzerModal({
  isOpen,
  onClose,
  onImportSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'url' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(false);

  if (!isOpen) return null;

  async function handleAnalyze(targetUrl?: string, overrideName?: string) {
    const urlToUse = targetUrl || url;
    const nameToUse = overrideName !== undefined ? overrideName : customBusinessName;
    const textToUse = pastedText;

    if (activeTab === 'url' && !urlToUse.trim()) {
      setError('Please enter a Google Maps or online review URL.');
      return;
    }

    if (activeTab === 'paste' && !textToUse.trim()) {
      setError('Please paste Google review text content to analyze.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setResult(null);
    setImported(false);

    try {
      const payload = activeTab === 'url'
        ? { url: urlToUse, customBusinessName: nameToUse }
        : { url: 'Pasted Google Reviews', rawTextContent: textToUse, customBusinessName: nameToUse };

      const res = await fetch('/api/feedback/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to analyze review data.');
      }
    } catch (e) {
      setError('An error occurred while analyzing real review data.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleImport() {
    if (!result) return;
    setImporting(true);
    try {
      const payload = activeTab === 'url'
        ? { url, customBusinessName: result.businessName, importToInbox: true }
        : { url: 'Pasted Google Reviews', rawTextContent: pastedText, customBusinessName: result.businessName, importToInbox: true };

      const res = await fetch('/api/feedback/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setImported(true);
        if (onImportSuccess) onImportSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="glass-panel w-full max-w-3xl p-6 sm:p-8 space-y-6 border-indigo-500/40 relative shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold">
              📍
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Google Reviews & Restaurant/Company AI Analyzer</h3>
              <p className="text-xs text-gray-400">Analyze real online customer reviews for hotels, restaurants, and companies by Google URL or text.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 text-lg font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔗 Analyze Google / Review Page URL
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📝 Paste Real Google Reviews Text
          </button>
        </div>

        {/* Common Restaurant / Company Name Optional Input */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Restaurant / Hotel / Company Name <span className="text-indigo-400 font-normal">(Optional Override)</span>
          </label>
          <input
            type="text"
            className="glass-input w-full text-sm"
            placeholder="e.g. Taj Mahal Palace Hotel / The Capital Grille / Acme SaaS"
            value={customBusinessName}
            onChange={(e) => setCustomBusinessName(e.target.value)}
          />
        </div>

        {/* URL Input Mode */}
        {activeTab === 'url' ? (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 block">Google Maps / Review Page URL <span className="text-rose-400">*</span></label>
            <div className="flex gap-2">
              <input
                type="url"
                className="glass-input flex-1 text-sm"
                placeholder="e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/place/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analyzing Reviews...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Analyze URL</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">Or test with 1-click sample review pages:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_URLS.map((s) => (
                  <button
                    key={s.url}
                    onClick={() => {
                      setUrl(s.url);
                      setCustomBusinessName(s.name);
                      handleAnalyze(s.url, s.name);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-indigo-300 border border-white/10 transition-all cursor-pointer"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Direct Review Text Paste Mode */
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 block">Paste Real Google Reviews Content <span className="text-rose-400">*</span></label>
            <textarea
              rows={5}
              className="glass-input w-full text-sm font-mono"
              placeholder="Copy & paste real Google reviews text here e.g.&#10;'Great restaurant! Staff was super polite, food was hot and delicious, check-in took 5 mins. Highly recommend.'"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Gemini Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Analyze Pasted Reviews</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-rose-400 font-medium p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">{error}</p>}

        {/* AI Real Analysis Result Display */}
        {result && (
          <div className="space-y-6 pt-4 border-t border-white/10 animate-fadeIn">
            {/* Business / Hotel / Restaurant Summary Header Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  📍 {result.businessCategory}
                </span>
                <h4 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                  <span>{result.businessName}</span>
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Extracted {result.totalReviewsExtracted} real customer reviews
                </p>
              </div>

              {/* Metric Badges */}
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center min-w-[80px]">
                  <span className="text-[10px] text-amber-400 block font-semibold">Overall Rating</span>
                  <span className="text-xl font-extrabold text-amber-300">{result.overallRating} ★</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[80px]">
                  <span className="text-[10px] text-emerald-400 block font-semibold">CSAT Score</span>
                  <span className="text-xl font-extrabold text-emerald-300">{result.csatScore}%</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center min-w-[80px]">
                  <span className="text-[10px] text-purple-400 block font-semibold">Net Sentiment</span>
                  <span className="text-xl font-extrabold text-purple-300">+{result.netSentimentIndex}</span>
                </div>
              </div>
            </div>

            {/* Executive Reputation Summary */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                AI Reputation Synthesis for {result.businessName}
              </h5>
              <p className="text-xs text-gray-200 leading-relaxed">{result.executiveSummary}</p>
            </div>

            {/* Top Positives & Critical Pain Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span>😊 Top Positive Drivers ({result.businessName})</span>
                </h5>
                <ul className="space-y-1 text-xs text-emerald-200">
                  {result.topPositives.map((pos, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>✓</span>
                      <span>{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <span>🚨 Critical Customer Pain Points</span>
                </h5>
                <ul className="space-y-1 text-xs text-rose-200">
                  {result.criticalPainPoints.map((pain, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>⚠️</span>
                      <span>{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Extracted Real Customer Reviews List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Extracted Customer Reviews ({result.businessName})
                </h5>
                <span className="text-xs text-gray-500">{result.extractedReviews.length} Reviews Parsed</span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {result.extractedReviews.map((rev, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{rev.author}</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          {rev.rating} ★
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            rev.sentiment === 'POS'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : rev.sentiment === 'NEG'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {rev.sentiment === 'POS' ? 'Positive 🟢' : rev.sentiment === 'NEG' ? 'Negative 🔴' : 'Neutral 🟡'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">{rev.date}</span>
                    </div>

                    <p className="text-gray-200 leading-snug">&quot;{rev.content}&quot;</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rev.themes.map((t, ti) => (
                        <span key={ti} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button onClick={onClose} className="px-4 py-2 text-xs text-gray-400 hover:text-white">
                Close
              </button>

              <button
                onClick={handleImport}
                disabled={importing || imported}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {imported ? (
                  <span>✅ Imported {result.extractedReviews.length} Reviews for {result.businessName} to Inbox!</span>
                ) : importing ? (
                  <span>Saving to Database...</span>
                ) : (
                  <span>📥 Import Reviews for {result.businessName} to Inbox</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
