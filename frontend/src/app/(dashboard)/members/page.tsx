import { Metadata } from "next";
import { EventMembersView } from "@/features/event-members";

export const metadata: Metadata = {
  title: "Event Members | RunSheet",
  description: "Manage event volunteers, team leaders, and staffing allocations.",
};

export default function EventMembersPage() {
  return <EventMembersView />;
}
