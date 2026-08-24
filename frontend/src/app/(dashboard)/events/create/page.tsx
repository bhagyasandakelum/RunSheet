import { Metadata } from "next";
import { CreateEventForm } from "@/features/events";

export const metadata: Metadata = {
  title: "Create New Event | RunSheet",
  description: "Set up and schedule a new event on RunSheet.",
};

export default function CreateEventPage() {
  return <CreateEventForm />;
}
