"use client";

import { X } from "lucide-react";
import FeedbackForm from "./FeedbackForm";
import { useFeedback } from "@/app/context/FeedbackContext";
import { Feedback } from "@/app/types/feedback";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddFeedbackModal({
  open,
  onClose,
}: Props) {
  const { addFeedback } = useFeedback();

  if (!open) return null;

  function handleSubmit(
    feedback: Omit<Feedback, "id" | "date" | "status">
  ) {
    addFeedback(feedback);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold">
              Add Feedback
            </h2>

            <p className="text-sm text-slate-500">
              Record a new customer feedback entry.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <FeedbackForm
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}