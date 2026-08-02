"use client";

import { useState } from "react";

import SettingsHeader from "@/app/components/settings/SettingsHeader";
import SettingsTabs from "@/app/components/settings/SettingsTabs";

import ProfileSettings from "@/app/components/settings/ProfileSettings";
import TeamSettings from "@/app/components/settings/TeamSettings";
import NotificationSettings from "@/app/components/settings/NotificationSettings";
import AISettings from "@/app/components/settings/AISettings";
import AppearanceSettings from "@/app/components/settings/AppearanceSettings";
import SecuritySettings from "@/app/components/settings/SecuritySettings";
import IntegrationsSettings from "@/app/components/settings/IntegrationsSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="space-y-6 p-6">
      <SettingsHeader />

      <SettingsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "Profile" && <ProfileSettings />}
      {activeTab === "Team" && <TeamSettings />}
      {activeTab === "Notifications" && <NotificationSettings />}
      {activeTab === "AI" && <AISettings />}
      {activeTab === "Appearance" && <AppearanceSettings />}
      {activeTab === "Security" && <SecuritySettings />}
      {activeTab === "Integrations" && <IntegrationsSettings />}
    </div>
  );
}