import { Metadata } from "next";
import { CreateTaskForm } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Create Task | RunSheet",
  description: "Create a new operational task and assign team members.",
};

export default function CreateTaskPage() {
  return <CreateTaskForm />;
}
