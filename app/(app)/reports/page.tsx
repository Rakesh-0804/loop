"use client";

import ReportsHeader from "@/app/components/reports/ReportsHeader";
import ReportFilters from "@/app/components/reports/ReportFilters";
import ReportSummary from "@/app/components/reports/ReportSummary";
import ReportsCharts from "@/app/components/reports/ReportsCharts";
import AIReportSummary from "@/app/components/reports/AIReportSummary";
import ExportButtons from "@/app/components/reports/ExportButtons";
import ReportHistory from "@/app/components/reports/ReportHistory";

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <ReportsHeader />

      <ReportFilters />

      <ReportSummary />

      <ReportsCharts />
      <AIReportSummary />

<ExportButtons />

<ReportHistory />


    
    </div>
  );
}