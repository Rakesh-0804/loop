"use client";

const keywords = [
  "Delivery",
  "Checkout",
  "Payment",
  "Refund",
  "Support",
  "UI",
  "Performance",
  "Pricing",
  "Mobile",
  "Shipping",
];

export default function TrendingKeywords() {
  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-5 text-xl font-bold">
        🔥 Trending Keywords
      </h2>

      <div className="flex flex-wrap gap-3">

        {keywords.map((item) => (
          <span
            key={item}
            className="rounded-full bg-blue-100 px-4 py-2 text-blue-700"
          >
            {item}
          </span>
        ))}

      </div>

    </div>
  );
}