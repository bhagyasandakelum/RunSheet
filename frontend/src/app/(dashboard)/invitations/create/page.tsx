import { Metadata } from "next";
import { InviteMemberForm } from "@/features/invitations";

export const metadata: Metadata = {
  title: "Invite Member | RunSheet",
  description: "Send an invitation to join your event team on RunSheet.",
};

export default function InviteMemberPage() {
  return <InviteMemberForm />;
}
