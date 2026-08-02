"use client";

export default function ProfileSettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Profile Settings
      </h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company Name
          </label>

          <input
            type="text"
            defaultValue="Project LOOP"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Admin Name
          </label>

          <input
            type="text"
            defaultValue="Admin"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            defaultValue="admin@example.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Phone Number
          </label>

          <input
            type="text"
            defaultValue="+91 9876543210"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
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