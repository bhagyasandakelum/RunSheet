import { Metadata } from "next";
import { EditTeamForm } from "@/features/teams";

export const metadata: Metadata = {
  title: "Edit Team | RunSheet",
  description: "Update team information, manage leadership, and organize members.",
};

interface EditTeamPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { teamId } = await params;
  return <EditTeamForm teamId={teamId} />;
}
