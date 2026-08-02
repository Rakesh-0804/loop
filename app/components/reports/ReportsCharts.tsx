"use client";

import FeedbackTrendChart from "@/app/components/charts/FeedbackTrendChart";
import SentimentPieChart from "@/app/components/charts/SentimentPieChart";
import CategoryBarChart from "@/app/components/charts/CategoryBarChart";

export default function ReportsCharts() {
  return (
    <div className="space-y-6">

      {/* Feedback Trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Feedback Trend
        </h2>

        <FeedbackTrendChart />
      </div>

      {/* Pie + Bar */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Sentiment Distribution
          </h2>

          <SentimentPieChart />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Category Analysis
          </h2>

          <CategoryBarChart />
        </div>

      </div>

    </div>
  );
}