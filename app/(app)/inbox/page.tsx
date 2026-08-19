'use client';

import { useEffect, useState } from 'react';
import CSVUploadModal from '@/app/components/CSVUploadModal';

type FeedbackTheme = {
  theme: {
    id: string;
    name: string;
    color?: string;
  };
};

type Feedback = {
  id: string;
  content: string;
  channel: string;
  sourceRef?: string;
  customerLabel?: string;
  sentiment?: 'POS' | 'NEU' | 'NEG';
  sentimentScore?: number;
  status: 'NEW' | 'REVIEWED' | 'ACTIONED';
  createdAt: string;
  themes?: FeedbackTheme[];
};

const CHANNELS = [
  { value: 'support_ticket', label: 'Support Ticket' },
  { value: 'app_store', label: 'App Store Review' },
  { value: 'nps_survey', label: 'NPS Survey' },
  { value: 'sales_call', label: 'Sales Call Note' },
  { value: 'community_post', label: 'Community Post' },
];

export default function InboxPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('support_ticket');
  const [customerLabel, setCustomerLabel] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  
  const [search, setSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        setItems(await res.json());
      } else {
        setError('Could not load feedback items.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Please provide feedback text.');
      return;
    }

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, channel, customerLabel, sourceRef }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to submit feedback');
      return;
    }

    setContent('');
    setCustomerLabel('');
    setSourceRef('');
    setShowAddForm(false);
    load();
  }

  async function handleAutoAnalyze() {
    setAnalyzing(true);
    try {
      await fetch('/api/feedback/analyze', { method: 'POST' });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  }

  async function updateStatus(id: string, newStatus: 'NEW' | 'REVIEWED' | 'ACTIONED') {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    await fetch('/api/feedback', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }

  // Filtering Logic
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.customerLabel && item.customerLabel.toLowerCase().includes(search.toLowerCase())) ||
      (item.sourceRef && item.sourceRef.toLowerCase().includes(search.toLowerCase()));

    const matchesChannel = selectedChannel === 'ALL' || item.channel === selectedChannel;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSentiment = selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;

    return matchesSearch && matchesChannel && matchesStatus && matchesSentiment;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Feedback Inbox</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Centralized hub for managing customer reviews, support notes, NPS surveys, and auto-extracted themes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload CSV</span>
          </button>
          <button
            onClick={handleAutoAnalyze}
            disabled={analyzing}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{analyzing ? '⚙️ Analyzing...' : '✨ AI Auto-Classify Inbox'}</span>
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {showAddForm ? '✕ Close Form' : '+ New Feedback'}
          </button>
        </div>
      </div>

      {/* Add Feedback Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 border-indigo-500/40 animate-fadeIn">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Add Customer Feedback</span>
          </h3>

          <textarea
            className="glass-input w-full min-h-[100px] text-sm"
            placeholder="Paste raw customer feedback content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Feedback Channel</label>
              <select
                className="glass-input w-full text-sm cursor-pointer"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-slate-900">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Customer / Account Label</label>
              <input
                type="text"
                className="glass-input w-full text-sm"
                placeholder="e.g. Acme Corp (Enterprise)"
                value={customerLabel}
                onChange={(e) => setCustomerLabel(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Source Reference</label>
              <input
                type="text"
                className="glass-input w-full text-sm"
                placeholder="e.g. Ticket #4021 / AppStore"
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Save Feedback
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search feedback text, customer name, or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 text-sm"
            />
          </div>

          {/* Counts Indicator */}
          <div className="text-xs text-gray-400 font-medium">
            Showing <strong className="text-white">{filteredItems.length}</strong> of <strong className="text-white">{items.length}</strong> items
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
          {/* Channel Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 mr-1">Channel:</span>
            <button
              onClick={() => setSelectedChannel('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedChannel === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              All
            </button>
            {CHANNELS.map((c) => (
              <button
                key={c.value}
                onClick={() => setSelectedChannel(c.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedChannel === c.value ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {c.label.split(' ')[0]}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-5 bg-white/10 self-center"></div>

          {/* Sentiment Filters */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-500 mr-1">Sentiment:</span>
            {['ALL', 'POS', 'NEU', 'NEG'].map((sent) => (
              <button
                key={sent}
                onClick={() => setSelectedSentiment(sent)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedSentiment === sent ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {sent === 'POS' ? 'Positive 😊' : sent === 'NEG' ? 'Negative 🔴' : sent === 'NEU' ? 'Neutral 😐' : 'All'}
              </button>
            ))}
          </div>

          <div className="hidden md:block w-px h-5 bg-white/10 self-center"></div>

          {/* Status Filters */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-500 mr-1">Status:</span>
            {['ALL', 'NEW', 'REVIEWED', 'ACTIONED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedStatus === st ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback Item List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading feedback items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <span className="text-3xl">📭</span>
          <p className="text-gray-300 font-medium">No feedback matching your filters.</p>
          <p className="text-xs text-gray-500">Try adjusting search keywords or resetting filters above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-5 space-y-3 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                {/* Meta Bar */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      item.sentiment === 'POS' ? 'badge-pos' : item.sentiment === 'NEG' ? 'badge-neg' : 'badge-neu'
                    }`}
                  >
                    {item.sentiment === 'POS' ? 'Positive 😊' : item.sentiment === 'NEG' ? 'Negative 🔴' : 'Neutral 😐'}
                  </span>

                  <span className="text-gray-400 font-medium bg-slate-800 px-2.5 py-0.5 rounded border border-white/10">
                    {item.channel}
                  </span>

                  {item.customerLabel && (
                    <span className="text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-medium">
                      👤 {item.customerLabel}
                    </span>
                  )}

                  {item.sourceRef && (
                    <span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded text-[11px]">
                      🔗 {item.sourceRef}
                    </span>
                  )}
                </div>

                {/* Main Text Content */}
                <p className="text-gray-100 text-sm leading-relaxed">{item.content}</p>

                {/* Theme Tags Row */}
                {item.themes && item.themes.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] text-gray-500 font-semibold">Themes:</span>
                    {item.themes.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={{
                          backgroundColor: `${t.theme.color || '#6366f1'}15`,
                          borderColor: `${t.theme.color || '#6366f1'}35`,
                          color: t.theme.color || '#818cf8',
                        }}
                      >
                        {t.theme.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Switcher & Date */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 self-stretch md:self-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                <span className="text-[11px] text-gray-500 font-mono">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <select
                  value={item.status}
                  onChange={(e) => updateStatus(item.id, e.target.value as any)}
                  className={`glass-input text-xs py-1.5 px-3 rounded-lg font-semibold cursor-pointer ${
                    item.status === 'ACTIONED'
                      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                      : item.status === 'REVIEWED'
                      ? 'text-purple-300 border-purple-500/40 bg-purple-500/10'
                      : 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'
                  }`}
                >
                  <option value="NEW" className="bg-slate-900 text-indigo-300">
                    Status: NEW
                  </option>
                  <option value="REVIEWED" className="bg-slate-900 text-purple-300">
                    Status: REVIEWED
                  </option>
                  <option value="ACTIONED" className="bg-slate-900 text-emerald-300">
                    Status: ACTIONED
                  </option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <CSVUploadModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onSuccess={() => {
          load();
        }}
      />
    </div>
  );
}