import { Metadata } from "next";
import { EventDetailsView } from "@/features/events";

export const metadata: Metadata = {
  title: "Event Details | RunSheet",
  description: "View real-time event analytics, teams, and operations.",
};

interface EventDetailsPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { eventId } = await params;
  return <EventDetailsView eventId={eventId} />;
}
