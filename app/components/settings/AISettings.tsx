"use client";

export default function AISettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        AI Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            AI Provider
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
            <option>OpenAI</option>
            <option>Google Gemini</option>
            <option>Anthropic Claude</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            AI Model
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
            <option>GPT-5.5</option>
            <option>Gemini 2.5</option>
            <option>Claude Sonnet</option>
          </select>
        </div>

      </div>

      <div className="mt-8 space-y-4">

        <label className="flex items-center justify-between">
          <span>Enable Sentiment Analysis</span>
          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </label>

        <label className="flex items-center justify-between">
          <span>Generate AI Summary</span>
          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </label>

        <label className="flex items-center justify-between">
          <span>Keyword Extraction</span>
          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </label>

      </div>

      <div className="mt-6 flex justify-end">
        <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
          Save Changes
        </button>
      </div>

    </div>
  );
}