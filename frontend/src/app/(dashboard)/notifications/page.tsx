import { Metadata } from "next";
import { NotificationCenterView } from "@/features/notifications";

export const metadata: Metadata = {
  title: "Notification Center | RunSheet",
  description: "Stay updated with your events, team assignments, and task milestones.",
};

export default function NotificationsPage() {
  return <NotificationCenterView />;
}
