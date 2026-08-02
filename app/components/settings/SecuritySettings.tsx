"use client";

export default function SecuritySettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Security Settings
      </h2>

      <div className="space-y-6">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Current Password
          </label>

          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            New Password
          </label>

          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Confirm Password
          </label>

          <input
            type="password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
          />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <h3 className="font-medium">
              Enable Two-Factor Authentication
            </h3>

            <p className="text-sm text-slate-500">
              Increase account security.
            </p>
          </div>

          <input type="checkbox" className="h-5 w-5" />
        </div>

      </div>

      <div className="mt-6 flex justify-end">
        <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
          Update Security
        </button>
      </div>

    </div>
  );
}