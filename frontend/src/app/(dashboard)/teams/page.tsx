import { Metadata } from "next";
import { TeamsListView } from "@/features/teams";

export const metadata: Metadata = {
  title: "Teams | RunSheet",
  description: "Manage event specialized teams, track responsibilities, and assign leadership.",
};

export default function TeamsPage() {
  return <TeamsListView />;
}
