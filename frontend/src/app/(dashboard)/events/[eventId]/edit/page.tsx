import { Metadata } from "next";
import { EditEventForm } from "@/features/events";

export const metadata: Metadata = {
  title: "Edit Event | RunSheet",
  description: "Modify event details, schedule, venue, and status.",
};

interface EditEventPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;
  return <EditEventForm eventId={eventId} />;
}
