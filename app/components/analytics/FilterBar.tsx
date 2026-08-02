"use client";

import { Search, Download, RefreshCw } from "lucide-react";

export default function FilterBar() {
  return (
    <div className="mb-6 rounded-xl bg-white p-5 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-wrap gap-3">

          <select className="rounded-lg border px-4 py-2">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>

          <select className="rounded-lg border px-4 py-2">
            <option>All Categories</option>
            <option>Delivery</option>
            <option>Payment</option>
            <option>Support</option>
          </select>

          <select className="rounded-lg border px-4 py-2">
            <option>All Sentiments</option>
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </select>

        </div>

        <div className="flex gap-3">

          <div className="flex items-center rounded-lg border px-3">
            <Search size={18} />
            <input
              className="p-2 outline-none"
              placeholder="Search..."
            />
          </div>

          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Download size={18}/>
          </button>

          <button className="rounded-lg border px-4 py-2">
            <RefreshCw size={18}/>
          </button>

        </div>

      </div>
    </div>
  );
}