"use client";

export default function NotificationSettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Notification Settings
      </h2>

      <div className="space-y-5">

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-medium">Email Notifications</h3>
            <p className="text-sm text-slate-500">
              Receive notifications through email.
            </p>
          </div>

          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-medium">Weekly Reports</h3>
            <p className="text-sm text-slate-500">
              Receive weekly feedback reports.
            </p>
          </div>

          <input type="checkbox" defaultChecked className="h-5 w-5" />
        </div>

        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="font-medium">Feedback Alerts</h3>
            <p className="text-sm text-slate-500">
              Notify when new customer feedback arrives.
            </p>
          </div>

          <input type="checkbox" className="h-5 w-5" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">AI Summary Notifications</h3>
            <p className="text-sm text-slate-500">
              Get AI-generated summaries automatically.
            </p>
          </div>

          <input type="checkbox" defaultChecked className="h-5 w-5" />
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