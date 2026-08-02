"use client";

const integrations = [
  "Slack",
  "Microsoft Teams",
  "Google Sheets",
  "HubSpot",
  "Salesforce",
  "Zendesk",
];

export default function IntegrationsSettings() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-xl font-semibold text-slate-800">
        Integrations
      </h2>

      <div className="grid gap-4 md:grid-cols-2">

        {integrations.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
          >
            <div>
              <h3 className="font-medium">{item}</h3>

              <p className="text-sm text-slate-500">
                Connect with {item}
              </p>
            </div>

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Connect
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}