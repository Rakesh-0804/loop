"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import SentimentBadge from "./SentimentBadge";
import StatusBadge from "./StatusBadge";
import FeedbackDetails from "./FeedbackDetails";

import { Feedback } from "@/app/types/feedback";
import { useFeedback } from "@/app/context/FeedbackContext";

const ITEMS_PER_PAGE = 5;

export default function FeedbackTable() {
  const { feedback, deleteFeedback } = useFeedback();

  const [selectedFeedback, setSelectedFeedback] =
    useState<Feedback | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFeedback = useMemo(() => {
    const value = search.toLowerCase();

    return feedback.filter(
      (item) =>
        item.name.toLowerCase().includes(value) ||
        item.email.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value) ||
        item.comment.toLowerCase().includes(value)
    );
  }, [feedback, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE)
  );

  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function openDrawer(item: Feedback) {
    setSelectedFeedback(item);
    setIsDrawerOpen(true);
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this feedback?")) return;
    deleteFeedback(id);
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-white p-4 shadow">
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
          <Search size={18} />
          <input
            placeholder="Search customer..."
            className="w-64 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <p className="text-sm text-slate-500">
          {filteredFeedback.length} feedback found
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Rating</th>
                <th className="px-6 py-4 text-left">Sentiment</th>
                <th className="px-6 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedFeedback.map((item) => (
                <tr key={item.id} className="border-t hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="#facc15" className="text-yellow-400" />
                      ))}
                      <span className="ml-2 text-sm text-slate-500">
                        ({item.rating}/5)
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <SentimentBadge sentiment={item.sentiment} />
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm">
                      {item.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>

                  <td className="px-6 py-4">{item.date}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openDrawer(item)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedFeedback.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No feedback found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-4 shadow">
        <p className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded border px-3 py-2 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <FeedbackDetails
        feedback={selectedFeedback}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}