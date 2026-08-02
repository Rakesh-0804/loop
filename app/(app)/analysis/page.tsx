"use client";

import {
  MessageSquare,
  Smile,
  Meh,
  Frown,
  Sparkles,
} from "lucide-react";

import FilterBar from "@/app/components/analytics/FilterBar";
import AISummary from "@/app/components/analytics/AISummary";
import TrendingKeywords from "@/app/components/analytics/TrendingKeywords";

import FeedbackTrendChart from "@/app/components/charts/FeedbackTrendChart";
import SentimentPieChart from "@/app/components/charts/SentimentPieChart";
import CategoryBarChart from "@/app/components/charts/CategoryBarChart";

export default function AnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Feedback Analysis
        </h1>

        <p className="mt-2 text-slate-500">
          AI-powered insights into customer feedback and customer sentiment.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Feedback
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                1,254
              </h2>

              <p className="mt-2 text-sm text-green-600">
                ↑ 12% this month
              </p>
            </div>

            <MessageSquare
              className="text-blue-600"
              size={36}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Positive
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                72%
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                903 Reviews
              </p>
            </div>

            <Smile
              className="text-green-600"
              size={36}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Neutral
              </p>

              <h2 className="mt-2 text-3xl font-bold text-yellow-500">
                18%
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                226 Reviews
              </p>
            </div>

            <Meh
              className="text-yellow-500"
              size={36}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow transition hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Negative
              </p>

              <h2 className="mt-2 text-3xl font-bold text-red-500">
                10%
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                125 Reviews
              </p>
            </div>

            <Frown
              className="text-red-500"
              size={36}
            />
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <FeedbackTrendChart />

        <SentimentPieChart />

      </div>

      <div className="mt-6">

        <CategoryBarChart />

      </div>

      {/* AI Summary + Keywords */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        <AISummary />

        <TrendingKeywords />

      </div>

      {/* AI Insights */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">

        <div className="mb-4 flex items-center gap-3">

          <Sparkles className="text-blue-600" />

          <h2 className="text-xl font-semibold">
            AI Insights
          </h2>

        </div>

        <ul className="space-y-4 text-slate-700">

          <li className="rounded-lg bg-green-50 p-4">
            ✅ Customers are highly satisfied with delivery speed and product quality.
          </li>

          <li className="rounded-lg bg-red-50 p-4">
            ⚠️ Most complaints are related to payment gateway failures and refund delays.
          </li>

          <li className="rounded-lg bg-blue-50 p-4">
            📈 Mobile app usability has improved by 18% compared to last month.
          </li>

          <li className="rounded-lg bg-yellow-50 p-4">
            💡 Recommendation: Improve the checkout experience and optimize payment processing.
          </li>

        </ul>

      </div>

    </div>
  );
}