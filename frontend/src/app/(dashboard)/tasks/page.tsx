import { Metadata } from "next";
import { TasksListView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Tasks & Milestones | RunSheet",
  description: "Manage and delegate operational tasks, milestones, and assignments.",
};

export default function TasksPage() {
  return <TasksListView />;
}
