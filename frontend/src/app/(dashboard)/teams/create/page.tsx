import { Metadata } from "next";
import { CreateTeamForm } from "@/features/teams";

export const metadata: Metadata = {
  title: "Create Team | RunSheet",
  description: "Set up organizing groups for your event and assign initial team leaders.",
};

export default function CreateTeamPage() {
  return <CreateTeamForm />;
}
