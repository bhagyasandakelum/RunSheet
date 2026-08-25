import { Metadata } from "next";
import { EditTaskForm } from "@/features/tasks";

export const metadata: Metadata = {
  title: "Edit Task | RunSheet",
  description: "Update task parameters, deadlines, and requirements.",
};

interface EditTaskPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { taskId } = await params;
  return <EditTaskForm taskId={taskId} />;
}
