"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";

export default function ExportButtons() {
  return (
    <div className="flex flex-wrap gap-4">

      <button className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-white hover:bg-red-700">
        <Download size={18} />
        Export PDF
      </button>

      <button className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700">
        <FileSpreadsheet size={18} />
        Export Excel
      </button>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 rounded-lg bg-slate-700 px-5 py-3 text-white hover:bg-slate-800"
      >
        <Printer size={18} />
        Print Report
      </button>

    </div>
  );
}