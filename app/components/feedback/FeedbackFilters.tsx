"use client";

import { Search } from "lucide-react";

export default function FeedbackFilters() {
  return (
    <div className="my-8 rounded-xl bg-white p-5 shadow">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="flex flex-wrap gap-3">

          <select className="rounded-lg border px-4 py-2">
            <option>All Categories</option>
            <option>Delivery</option>
            <option>Support</option>
            <option>Payment</option>
            <option>Product</option>
          </select>

          <select className="rounded-lg border px-4 py-2">
            <option>All Sentiments</option>
            <option>Positive</option>
            <option>Neutral</option>
            <option>Negative</option>
          </select>

          <select className="rounded-lg border px-4 py-2">
            <option>Newest</option>
            <option>Oldest</option>
          </select>

        </div>

        <div className="flex items-center rounded-lg border px-3">

          <Search size={18}/>

          <input
            className="w-60 p-2 outline-none"
            placeholder="Search feedback..."
          />

        </div>

      </div>

    </div>
  );
}