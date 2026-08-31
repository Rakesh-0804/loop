'use client';

import { useState, useRef } from 'react';

type CSVUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CSVUploadModal({ isOpen, onClose, onSuccess }: CSVUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [resultSummary, setResultSummary] = useState<{
    totalProcessed: number;
    positivesCount: number;
    negativesCount: number;
    neutralsCount: number;
    summary: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  }

  function downloadSampleCSV() {
    const csvContent =
      'feedback,channel,customerLabel,sourceRef\n' +
      '"Dashboard load time has improved dramatically after the latest update! Really crisp animations.",app_store,"Enterprise Client - TechFlow",AppStore #9021\n' +
      '"Billing invoice failed to generate the tax breakdown item. Customer support took 3 days to reply.",support_ticket,"Apex Global",Ticket #4012\n' +
      '"The Slack integration setup was seamless! Real-time alerts work great.",community_post,"Community Lead",Discord #integrations\n' +
      '"Mobile menu dropdown gets cut off on smaller iPhone screens in dark mode.",app_store,"Mobile User",AppStore #8801\n' +
      '"We need automated weekly PDF export reports so our team can review feedback without logging in every day.",sales_call,"VP Product - InnovateHQ",Zoom Call 2026-08-15\n' +
      '"Our account was double-charged this month and refund response has been terrible.",support_ticket,"Northwind Ops",Ticket #5219\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_feedbacks_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function parseCSV(text: string) {
    const lines = text.split(/\r\n|\n/);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const items: Array<{ content: string; channel: string; customerLabel: string; sourceRef: string }> = [];

    // Robust CSV row splitter handling quotes and commas
    const splitCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"'));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, '').replace(/""/g, '"'));
      return result;
    };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cleanValues = splitCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = cleanValues[idx] || '';
      });

      const content = row['feedback'] || row['content'] || row['text'] || cleanValues[0] || '';
      if (content && content.length > 2) {
        items.push({
          content,
          channel: row['channel'] || 'support_ticket',
          customerLabel: row['customerlabel'] || row['customer'] || row['user'] || row['account'] || '',
          sourceRef: row['sourceref'] || row['source'] || row['reference'] || 'CSV Bulk Upload',
        });
      }
    }

    return items;
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const text = await file.text();
      const parsedItems = parseCSV(text);

      if (parsedItems.length === 0) {
        setError('No valid feedback rows found in the CSV file.');
        setUploading(false);
        return;
      }

      const res = await fetch('/api/feedback/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: parsedItems }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to upload CSV feedbacks.');
        return;
      }

      const data = await res.json();
      setResultSummary(data);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('Error reading or processing the CSV file.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 space-y-5 border-indigo-500/40 relative shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h3 className="text-lg font-extrabold text-white">Bulk CSV Feedback Ingestion</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Result Summary Toast */}
        {resultSummary ? (
          <div className="p-6 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h4 className="text-lg font-extrabold text-white">CSV Upload & AI Analysis Complete!</h4>
            <p className="text-xs text-gray-300 leading-relaxed">{resultSummary.summary}</p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Positive</span>
                <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{resultSummary.positivesCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 font-semibold block uppercase">Negative</span>
                <span className="text-xl font-extrabold text-rose-300 mt-0.5 block">{resultSummary.negativesCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-semibold block uppercase">Neutral</span>
                <span className="text-xl font-extrabold text-amber-300 mt-0.5 block">{resultSummary.neutralsCount}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer"
            >
              Done & View Inbox
            </button>
          </div>
        ) : (
          /* File Upload Form */
          <form onSubmit={handleUpload} className="space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              Upload a bulk CSV file containing customer feedback items. Gemini 3.6 Flash AI will automatically analyze each row, compute positive/negative sentiment scores, and match theme categories.
            </p>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-900/60 p-6 rounded-2xl text-center cursor-pointer transition-all space-y-2 group"
            >
              <svg className="w-10 h-10 text-indigo-400 mx-auto group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-semibold text-white">
                {file ? file.name : 'Click to browse or drag & drop CSV file'}
              </p>
              <p className="text-[11px] text-gray-400">Supports .CSV files with feedback content</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Template Download Helper */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-gray-400">Need a format reference?</span>
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center gap-1 cursor-pointer"
              >
                <span>📥</span>
                <span>Download Sample CSV Template</span>
              </button>
            </div>

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {uploading ? '⚙️ Gemini AI Analyzing Bulk CSV...' : '✨ Upload & AI Analyze CSV'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
