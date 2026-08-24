import { Metadata } from "next";
import { EventsListView } from "@/features/events";

export const metadata: Metadata = {
  title: "My Events | RunSheet",
  description: "Browse and manage your organized events and runsheets.",
};

export default function EventsPage() {
  return <EventsListView />;
}
