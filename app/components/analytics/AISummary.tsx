"use client";

export default function AISummary() {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-5 text-xl font-bold">
        🤖 AI Summary
      </h2>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Overall Sentiment</span>
          <span className="font-semibold text-green-600">
            Positive
          </span>
        </div>

        <div className="flex justify-between">
          <span>Average Rating</span>
          <span>⭐ 4.6 / 5</span>
        </div>

        <div className="flex justify-between">
          <span>Confidence</span>
          <span className="font-semibold text-blue-600">
            92%
          </span>
        </div>

      </div>

    </div>
  );
}