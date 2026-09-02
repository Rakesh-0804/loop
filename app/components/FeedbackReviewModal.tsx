'use client';

import { useState } from 'react';

type ThemeItem = {
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
  themes?: ThemeItem[];
};

type FeedbackReviewModalProps = {
  feedback: Feedback | null;
  onClose: () => void;
  onUpdate: () => void;
};

export default function FeedbackReviewModal({ feedback, onClose, onUpdate }: FeedbackReviewModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(feedback);
  const [status, setStatus] = useState<'NEW' | 'REVIEWED' | 'ACTIONED'>(feedback?.status || 'NEW');
  const [statusUpdating, setStatusUpdating] = useState(false);

  if (!feedback || !currentFeedback) return null;

  const sentiment = currentFeedback.sentiment || 'NEU';
  const scorePct = Math.round((currentFeedback.sentimentScore || 0.5) * 100);

  async function handleAIAutoAnalyze() {
    if (!currentFeedback) return;
    setAnalyzing(true);
    setAiExplanation(null);

    try {
      const res = await fetch('/api/feedback/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: currentFeedback.id }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.feedback) {
          setCurrentFeedback(data.feedback);
        }
        setAiExplanation(data.explanation || 'Gemini 3.6 Flash AI analysis completed successfully.');
        onUpdate();
      }
    } catch (e) {
      console.error(e);
      setAiExplanation('Error communicating with Gemini AI Engine.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleStatusChange(newStatus: 'NEW' | 'REVIEWED' | 'ACTIONED') {
    if (!currentFeedback) return;
    setStatus(newStatus);
    setStatusUpdating(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentFeedback.id, status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentFeedback((prev) => (prev ? { ...prev, status: updated.status } : null));
        onUpdate();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl p-6 md:p-8 space-y-6 border-indigo-500/40 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl">
              🔍
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">AI Feedback Review Card</h3>
              <p className="text-xs text-gray-400">Detailed AI analysis, sentiment scoring & extracted theme clusters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 text-lg font-bold cursor-pointer rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Sentiment & Status Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center gap-3">
            {/* Sentiment Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                sentiment === 'POS' ? 'badge-pos' : sentiment === 'NEG' ? 'badge-neg' : 'badge-neu'
              }`}
            >
              {sentiment === 'POS' ? 'Positive 😊' : sentiment === 'NEG' ? 'Negative 🔴' : 'Neutral 😐'}
            </span>

            {/* Satisfaction Rating Score */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-gray-400">Satisfaction Score:</span>
              <span
                className={`text-sm ${
                  sentiment === 'POS' ? 'text-emerald-400' : sentiment === 'NEG' ? 'text-rose-400' : 'text-amber-400'
                }`}
              >
                {scorePct}%
              </span>
            </div>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Status:</span>
            <select
              value={status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              className="glass-input text-xs py-1 px-3 rounded-lg font-bold cursor-pointer bg-slate-900 text-white border-indigo-500/40"
            >
              <option value="NEW" className="bg-slate-900 text-indigo-300">
                NEW
              </option>
              <option value="REVIEWED" className="bg-slate-900 text-purple-300">
                REVIEWED
              </option>
              <option value="ACTIONED" className="bg-slate-900 text-emerald-300">
                ACTIONED
              </option>
            </select>
          </div>
        </div>

        {/* Feedback Content Box */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
            Customer Feedback Message
          </span>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-gray-100 text-sm leading-relaxed shadow-inner font-normal">
            "{currentFeedback.content}"
          </div>
        </div>

        {/* Customer & Source Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <span className="text-gray-400 block font-medium">Channel</span>
            <span className="text-white font-bold capitalize">{currentFeedback.channel.replace(/_/g, ' ')}</span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <span className="text-gray-400 block font-medium">Customer / Account</span>
            <span className="text-indigo-300 font-bold truncate block">
              {currentFeedback.customerLabel || 'Anonymous Customer'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1">
            <span className="text-gray-400 block font-medium">Source Reference</span>
            <span className="text-gray-300 font-semibold truncate block">
              {currentFeedback.sourceRef || 'N/A'}
            </span>
          </div>
        </div>

        {/* Matched Theme Categories Used */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
            Theme Categories Used
          </span>
          {currentFeedback.themes && currentFeedback.themes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentFeedback.themes.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: `${t.theme.color || '#6366f1'}20`,
                    borderColor: `${t.theme.color || '#6366f1'}50`,
                    color: t.theme.color || '#a5b4fc',
                  }}
                >
                  <span>🏷️</span>
                  <span>{t.theme.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No specific themes linked yet.</p>
          )}
        </div>

        {/* AI Auto-Analysis Box / Explanation */}
        {aiExplanation && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <span>✨</span>
              <span>Gemini 3.6 Flash AI Analysis Explanation</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-normal">{aiExplanation}</p>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-[11px] text-gray-500 font-mono">
            Submitted: {new Date(currentFeedback.createdAt).toLocaleString()}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAIAutoAnalyze}
              disabled={analyzing}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{analyzing ? '⚙️ Gemini Analyzing...' : '✨ AI Auto-Analyze Feedback'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 cursor-pointer"
            >
              Close Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
