import { Metadata } from "next";
import { InvitationManagementView } from "@/features/invitations";

export const metadata: Metadata = {
  title: "Invitation Management | RunSheet",
  description: "Track and manage event invitations and volunteer responses.",
};

export default function InvitationsPage() {
  return <InvitationManagementView />;
}
