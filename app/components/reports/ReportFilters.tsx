"use client";

export default function ReportFilters() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Date Range
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Category
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>All</option>
            <option>Product</option>
            <option>Support</option>
            <option>Delivery</option>
            <option>Website</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Sentiment
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>All</option>
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Rating
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option>All Ratings</option>
            <option>5 Stars</option>
            <option>4 Stars</option>
            <option>3 Stars</option>
            <option>2 Stars</option>
            <option>1 Star</option>
          </select>
        </div>

        <div className="flex items-end">
          <button className="w-full rounded-lg bg-blue-600 py-2.5 text-white hover:bg-blue-700">
            Generate
          </button>
        </div>

      </div>
    </div>
  );
}