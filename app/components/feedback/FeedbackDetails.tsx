
"use client";

import { X, Star, Mail, Calendar, Tag } from "lucide-react";

type Feedback = {
  id: number;
  name: string;
  email: string;
  rating: number;
  sentiment: string;
  category: string;
  status: string;
  date: string;
};

type Props = {
  feedback: Feedback | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function FeedbackDetails({
  feedback,
  isOpen,
  onClose,
}: Props) {
  if (!feedback) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-bold">Feedback Details</h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-6 p-6">

          <div>
            <h3 className="text-lg font-semibold">{feedback.name}</h3>
            <p className="text-slate-500">{feedback.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Mail size={18} />
            {feedback.email}
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} />
            {feedback.date}
          </div>

          <div className="flex items-center gap-2">
            <Tag size={18} />
            {feedback.category}
          </div>

          <div>
            <p className="mb-2 font-semibold">Rating</p>

            <div className="flex">
              {Array.from({ length: feedback.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="#facc15"
                  className="text-yellow-400"
                />
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold">AI Sentiment</p>

            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              {feedback.sentiment}
            </span>
          </div>

          <div>
            <p className="font-semibold">AI Summary</p>

            <p className="mt-2 text-slate-600">
              Customer appreciated the overall experience but suggested improving
              the checkout process for faster payments.
            </p>
          </div>

          <div>
            <p className="font-semibold">Suggested Response</p>

            <div className="mt-2 rounded-lg bg-slate-100 p-4 text-slate-700">
              Thank you for your valuable feedback. We appreciate your
              suggestions and are continuously improving our payment process.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}