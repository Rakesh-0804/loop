"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { Feedback } from "@/app/types/feedback";

type Props = {
  initialData?: Partial<Feedback>;
  onSubmit: (feedback: Omit<Feedback, "id" | "date" | "status">) => void;
  onCancel: () => void;
};

export default function FeedbackForm({
  initialData,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [category, setCategory] = useState(
    initialData?.category || "Product"
  );
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [sentiment, setSentiment] = useState<
    "Positive" | "Neutral" | "Negative"
  >(initialData?.sentiment || "Positive");
  const [comment, setComment] = useState(initialData?.comment || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !comment.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    onSubmit({
      name,
      email,
      category,
      rating,
      sentiment,
      comment,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block font-medium">
          Customer Name
        </label>

        <input
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Smith"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Email
        </label>

        <input
          type="email"
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Category
        </label>

        <select
          className="w-full rounded-lg border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Product</option>
          <option>Delivery</option>
          <option>Support</option>
          <option>Payment</option>
          <option>Website</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Rating
        </label>

        <StarRating
          rating={rating}
          onChange={setRating}
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Sentiment
        </label>

        <select
          className="w-full rounded-lg border p-3"
          value={sentiment}
          onChange={(e) =>
            setSentiment(
              e.target.value as
                | "Positive"
                | "Neutral"
                | "Negative"
            )
          }
        >
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Feedback
        </label>

        <textarea
          rows={5}
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write customer feedback..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-5 py-2 hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Save Feedback
        </button>
      </div>
    </form>
  );
}