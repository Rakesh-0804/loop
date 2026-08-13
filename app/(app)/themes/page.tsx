'use client';

import { useEffect, useState } from 'react';

type LinkedFeedback = {
  feedback: {
    id: string;
    content: string;
    channel: string;
    sentiment?: 'POS' | 'NEU' | 'NEG';
    customerLabel?: string;
  };
};

type Theme = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  feedback: LinkedFeedback[];
};

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/themes');
      if (res.ok) {
        setThemes(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTheme(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Theme name is required');
      return;
    }

    const res = await fetch('/api/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create theme');
      return;
    }

    setName('');
    setDescription('');
    setShowAddForm(false);
    load();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Customer Feedback Themes</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Categorized topic clusters extracted across all customer feedback channels.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all self-start md:self-auto cursor-pointer"
        >
          {showAddForm ? '✕ Close Form' : '+ New Theme'}
        </button>
      </div>

      {/* Add Theme Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddTheme} className="glass-panel p-6 space-y-4 border-indigo-500/40 animate-fadeIn">
          <h3 className="text-base font-bold text-white">Create Custom Feedback Theme</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Theme Name</label>
              <input
                type="text"
                placeholder="e.g. Billing & Invoicing"
                className="glass-input w-full text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded bg-transparent border-0 cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-mono">{color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1">Description</label>
            <input
              type="text"
              placeholder="Brief description of what customer comments fall under this theme..."
              className="glass-input w-full text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              Create Theme
            </button>
          </div>
        </form>
      )}

      {/* Themes Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading feedback themes...</div>
      ) : themes.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-400 text-sm">
          No themes defined yet. Click "+ New Theme" to create your first topic cluster.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const count = theme.feedback?.length || 0;
            const posCount = theme.feedback?.filter((f) => f.feedback.sentiment === 'POS').length || 0;
            const negCount = theme.feedback?.filter((f) => f.feedback.sentiment === 'NEG').length || 0;

            return (
              <div
                key={theme.id}
                className="glass-panel p-6 space-y-4 flex flex-col justify-between hover:border-white/20 transition-all"
                style={{
                  borderLeft: `4px solid ${theme.color || '#6366f1'}`,
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{theme.name}</span>
                    </h3>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: `${theme.color || '#6366f1'}20`,
                        borderColor: `${theme.color || '#6366f1'}40`,
                        color: theme.color || '#818cf8',
                      }}
                    >
                      {count} items
                    </span>
                  </div>

                  {theme.description && (
                    <p className="text-xs text-gray-400 leading-relaxed">{theme.description}</p>
                  )}
                </div>

                {/* Sentiment Mini Bar */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                    <span>Positive: <strong className="text-emerald-400">{posCount}</strong></span>
                    <span>Negative: <strong className="text-rose-400">{negCount}</strong></span>
                  </div>

                  {/* Linked Feedback Snippets */}
                  <div className="space-y-1.5 pt-1">
                    {theme.feedback?.slice(0, 2).map((fb, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 text-[11px] text-gray-300 border border-white/5 truncate">
                        "{fb.feedback.content}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
