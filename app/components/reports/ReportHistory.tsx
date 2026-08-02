"use client";

import { Download, FileText } from "lucide-react";

const reports = [
  {
    id: 1,
    name: "Monthly Feedback Report",
    date: "02 Aug 2026",
    type: "PDF",
    status: "Generated",
  },
  {
    id: 2,
    name: "Customer Sentiment Analysis",
    date: "30 Jul 2026",
    type: "Excel",
    status: "Generated",
  },
  {
    id: 3,
    name: "Weekly Performance Report",
    date: "25 Jul 2026",
    type: "PDF",
    status: "Generated",
  },
];

export default function ReportHistory() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-800">
          Report History
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Report
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="px-6 py-4 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  {report.name}
                </td>

                <td className="px-6 py-4">{report.date}</td>

                <td className="px-6 py-4">{report.type}</td>

                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                    {report.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <button className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">
                    <Download size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}