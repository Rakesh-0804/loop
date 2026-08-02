"use client";

import { Settings } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-blue-600" />

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="text-slate-500">
            Manage your account, application preferences, security, and integrations.
          </p>
        </div>
      </div>
    </div>
  );
}