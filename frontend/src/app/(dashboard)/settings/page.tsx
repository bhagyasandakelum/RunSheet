import { Metadata } from "next";
import { SettingsView } from "@/features/settings";

export const metadata: Metadata = {
  title: "Account Settings | RunSheet",
  description: "Manage your RunSheet preferences, security, and interface configuration.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
