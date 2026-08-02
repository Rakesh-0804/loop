"use client";

import { Plus, Download } from "lucide-react";

type Props = {
  onAddFeedback: () => void;
};

export default function FeedbackHeader({
  onAddFeedback,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Customer Feedback
        </h1>

        <p className="mt-1 text-slate-500">
          View, manage and analyze customer feedback in one place.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium transition hover:bg-slate-100"
        >
          <Download size={18} />
          Export
        </button>

        <button
          onClick={onAddFeedback}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Feedback
        </button>
      </div>
    </div>
  );
}