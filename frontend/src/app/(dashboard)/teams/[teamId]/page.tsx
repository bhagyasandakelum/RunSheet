import { Metadata } from "next";
import { TeamDetailsView } from "@/features/teams";

export const metadata: Metadata = {
  title: "Team Details | RunSheet",
  description: "View team details, active tasks, and team member allocations.",
};

interface TeamDetailsPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { teamId } = await params;
  return <TeamDetailsView teamId={teamId} />;
}
