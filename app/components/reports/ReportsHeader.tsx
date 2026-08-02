"use client";

import { FileText, Download } from "lucide-react";

export default function ReportsHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-xl bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div>
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />

          <h1 className="text-3xl font-bold text-slate-900">
            Reports
          </h1>
        </div>

        <p className="mt-2 text-slate-500">
          Generate detailed reports, export data,
          and review AI-powered insights.
        </p>
      </div>

      <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700">
        <Download size={18} />
        Generate Report
      </button>
    </div>
  );
}