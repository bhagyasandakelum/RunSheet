import { Metadata } from "next";
import { TaskDetailsView } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Task Details | RunSheet",
  description: "View task progress, assigned members, and timeline milestones.",
};

interface TaskDetailsPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { taskId } = await params;
  return <TaskDetailsView taskId={taskId} />;
}
