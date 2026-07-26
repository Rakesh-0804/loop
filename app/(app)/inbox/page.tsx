'use client';
import { useEffect, useState } from 'react';

type Feedback = { id: string; content: string; channel: string; status: string; createdAt: string };

const CHANNELS = [
  { value: 'support_ticket', label: 'Support ticket' },
  { value: 'app_store', label: 'App store review' },
  { value: 'nps_survey', label: 'NPS survey' },
  { value: 'sales_call', label: 'Sales call note' },
  { value: 'community_post', label: 'Community post' },
];

export default function InboxPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('support_ticket');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/feedback');
    if (res.ok) {
      setItems(await res.json());
    } else {
      setError('Could not load feedback');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, channel }),
    });
  if (!res.ok) {
      const data = await res.json();
      let message = 'Failed to add feedback';
      if (typeof data.error === 'string') {
        message = data.error;
      } else if (data.error?.formErrors?.[0]) {
        message = data.error.formErrors[0];
      } else if (data.error?.fieldErrors) {
        const firstField = Object.values(data.error.fieldErrors)[0] as string[] | undefined;
        if (firstField?.[0]) message = firstField[0];
      }
      setError(message);
      return;
    }
    setContent('');
    load();
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Feedback Inbox</h1>

      <form onSubmit={handleSubmit} className="space-y-2 mb-8 border p-4 rounded">
        <textarea
          className="border p-2 w-full rounded"
          placeholder="Feedback content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded block" type="submit">
          Add feedback
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No feedback yet — add your first item above.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border p-3 rounded">
              <p>{item.content}</p>
              <p className="text-sm text-gray-500 mt-1">
                {item.channel} · {item.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}