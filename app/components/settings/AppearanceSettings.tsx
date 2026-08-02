"use client";

export default function AppearanceSettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Appearance
      </h2>

      <div className="grid gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Theme
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Language
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
            <option>English</option>
            <option>Kannada</option>
            <option>Hindi</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Time Zone
          </label>

          <select className="w-full rounded-lg border border-slate-300 px-4 py-2">
            <option>Asia/Kolkata</option>
            <option>UTC</option>
            <option>America/New_York</option>
          </select>
        </div>

      </div>

      <div className="mt-6 flex justify-end">
        <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
          Save Changes
        </button>
      </div>

    </div>
  );
}