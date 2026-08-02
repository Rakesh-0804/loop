"use client";

const tabs = [
  "Profile",
  "Team",
  "Notifications",
  "AI",
  "Appearance",
  "Security",
  "Integrations",
];

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function SettingsTabs({
  activeTab,
  setActiveTab,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 p-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}