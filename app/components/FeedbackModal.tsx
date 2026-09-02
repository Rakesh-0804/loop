'use client';

import { useState } from 'react';
import FeedbackReviewModal from './FeedbackReviewModal';

const CHANNELS = [
  { value: 'support_ticket', label: 'Support Ticket' },
  { value: 'app_store', label: 'App Store Review' },
  { value: 'nps_survey', label: 'NPS Survey' },
  { value: 'sales_call', label: 'Sales Call Note' },
  { value: 'community_post', label: 'Community Post' },
];

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('support_ticket');
  const [customerLabel, setCustomerLabel] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // State to hold newly created feedback for instant AI Review Card display
  const [createdFeedback, setCreatedFeedback] = useState<any | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Feedback message is required');
      return;
    }

    setSubmitting(true);
    try {
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

      const newFeedback = await res.json();
      setContent('');
      setCustomerLabel('');
      setSourceRef('');
      setIsOpen(false);

      // Instantly open the AI Review Card Modal with the new feedback item
      setCreatedFeedback(newFeedback);
    } catch (e) {
      setError('An error occurred while submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:scale-105 text-white font-bold shadow-xl shadow-indigo-500/30 flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
        title="Submit Feedback"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm">Submit Feedback</span>
      </button>

      {/* Modal Dialog Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 space-y-5 border-indigo-500/40 relative shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-extrabold text-white">Submit Customer Feedback</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Feedback Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">
                  Feedback Content <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  className="glass-input w-full text-sm"
                  placeholder="Enter customer review, support ticket message, or feature request..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1">Feedback Channel</label>
                  <select
                    className="glass-input w-full text-sm cursor-pointer"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    {CHANNELS.map((c) => (
                      <option key={c.value} value={c.value} className="bg-slate-900 text-white">
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
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Source Reference (Optional)</label>
                <input
                  type="text"
                  className="glass-input w-full text-sm"
                  placeholder="e.g. Ticket #4082 / AppStore Review"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? '✨ Gemini AI Analyzing...' : '✨ Submit & Auto-Analyze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pop up AI Review Card Modal instantly when feedback is submitted */}
      {createdFeedback && (
        <FeedbackReviewModal
          feedback={createdFeedback}
          onClose={() => setCreatedFeedback(null)}
          onUpdate={() => setCreatedFeedback(null)}
        />
      )}
    </>
  );
}
