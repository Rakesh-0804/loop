"use client";

import { Sparkles, TrendingUp, AlertTriangle, Star } from "lucide-react";

const insights = [
  {
    icon: TrendingUp,
    title: "Customer Satisfaction",
    description: "Customer satisfaction increased by 14% compared to last month.",
    color: "text-green-600",
  },
  {
    icon: Star,
    title: "Top Performing Category",
    description: "Product Quality received the highest average rating of 4.8/5.",
    color: "text-yellow-500",
  },
  {
    icon: AlertTriangle,
    title: "Attention Needed",
    description: "Delivery delays remain the most common source of negative feedback.",
    color: "text-red-500",
  },
];

export default function AIReportSummary() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <Sparkles className="h-7 w-7 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            AI Executive Summary
          </h2>
          <p className="text-sm text-slate-500">
            Automatically generated insights from customer feedback.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4"
          >
            <item.icon className={`mt-1 h-6 w-6 ${item.color}`} />

            <div>
              <h3 className="font-semibold text-slate-800">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
        <h3 className="font-semibold text-blue-700">
          AI Recommendation
        </h3>

        <p className="mt-2 text-sm text-slate-700">
          Prioritize reducing delivery delays and continue investing in product
          quality improvements. These changes are likely to increase customer
          satisfaction and reduce negative feedback over the next quarter.
        </p>
      </div>
    </div>
  );
}