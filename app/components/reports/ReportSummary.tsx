"use client";

const cards = [
  {
    title: "Total Feedback",
    value: "1,248",
    color: "text-slate-900",
  },
  {
    title: "Positive",
    value: "72%",
    color: "text-green-600",
  },
  {
    title: "Neutral",
    value: "18%",
    color: "text-yellow-600",
  },
  {
    title: "Negative",
    value: "10%",
    color: "text-red-600",
  },
  {
    title: "Average Rating",
    value: "4.6 ★",
    color: "text-blue-600",
  },
];

export default function ReportSummary() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl bg-white border border-slate-200 shadow-sm p-6"
        >
          <p className="text-sm text-slate-500">
            {card.title}
          </p>

          <h2 className={`mt-3 text-3xl font-bold ${card.color}`}>
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}